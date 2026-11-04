import { NextRequest, NextResponse } from 'next/server';
import {
  getConversationById,
  addMessage,
  createOrder,
  updateConversation,
  getKeywordTriggers,
  incrementTriggerMatch,
  getProducts,
  getOrders,
  updateOrder,
} from '@/lib/db';
import { Message, Order } from '@/lib/types';
import { matchKeywords } from '@/lib/keyword-engine';
import {
  extractOrderFromMessage,
  generateMissingInfoPrompt,
  classifyConversationIntent,
} from '@/lib/order-extractor';
import { generateSmartChatReply } from '@/lib/ai-service';
import { getAppSettings } from '@/lib/settings-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversation = await getConversationById(id);
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    const body = await request.json();
    const text = body.text?.trim() || '';
    const sender = body.sender || 'agent';
    const senderName = body.senderName || (sender === 'agent' ? 'Sales Agent' : conversation.customerName);

    if (!text) {
      return NextResponse.json({ success: false, error: 'Message text is required' }, { status: 400 });
    }

    // 1. Save user/agent message
    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId: id,
      sender,
      senderName,
      text,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    await addMessage(userMessage);

    let botReplyMessage: Message | null = null;
    let autoCreatedOrder: Order | null = null;

    // 2. If message is from customer and Bot is active, process automated sales agent flow
    if (sender === 'customer' && conversation.botActive) {
      const settings = getAppSettings();
      const products = await getProducts();
      const triggers = await getKeywordTriggers();
      const keywordResult = matchKeywords(text, triggers);

      // Classify intent
      const intent = classifyConversationIntent(text);

      // Smart order extraction with bKash and variants
      const extracted = extractOrderFromMessage(
        text,
        conversation.customerName,
        products
      );

      // Check if this customer already has an order in this conversation
      const allOrders = await getOrders();
      const existingOrder = allOrders.find(
        (o) => o.conversationId === id || (extracted.customerPhone && o.customerPhone === extracted.customerPhone)
      );

      // Case A: Customer sent bKash TrxID / payment proof
      if (extracted.bkashTrxId) {
        if (existingOrder) {
          await updateOrder(existingOrder.id, {
            payment_method: 'bKash',
            bkash_trx_id: extracted.bkashTrxId,
            bkash_sender_number: extracted.bkashSenderNumber || existingOrder.customerPhone,
            payment_status: 'Pending Verification',
            status: 'confirmed',
          });
          autoCreatedOrder = { ...existingOrder, bkash_trx_id: extracted.bkashTrxId, payment_status: 'Pending Verification' };
        }

        await updateConversation(id, {
          status: 'bkash_paid',
          intent: 'Order Confirmed',
        });

        const replyText = `🎉 ধন্যবাদ ${conversation.customerName}! আপনার বিকাশ ট্রানজেকশন আইডি (${extracted.bkashTrxId}) গ্রহণ করা হয়েছে।\n\n📌 পেমেন্ট স্ট্যাটাস: ভেরিফিকেশন পেন্ডিং (আমাদের টিম ভেরিফাই করার সাথে সাথেই পার্সেলটি কুরিয়ারে পাঠিয়ে দেওয়া হবে)।\n\nইনভয়েস সামারি নিচে তৈরি করা হলো 👇`;

        botReplyMessage = {
          id: `msg-${Date.now() + 1}`,
          conversationId: id,
          sender: 'bot',
          senderName: 'bKash Auto-Verification Bot 💳',
          text: replyText,
          timestamp: new Date().toISOString(),
          status: 'delivered',
          messageType: 'order_receipt',
          orderData: existingOrder || {
            orderNumber: `BD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            customerName: conversation.customerName,
            customerPhone: conversation.customerPhone || '017XXXXXXXX',
            totalAmount: 1580,
            bkash_trx_id: extracted.bkashTrxId,
            payment_status: 'Pending Verification',
            payment_method: 'bKash',
          },
        };
        await addMessage(botReplyMessage);

      } else if (extracted.customerPhone && (extracted.district || extracted.fullAddress)) {
        // Case B: Complete or near-complete order detected!
        const orderNumber = `BD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const district = extracted.district || 'Dhaka';
        const isInsideDhaka = district.toLowerCase() === 'dhaka';
        const deliveryCharge = isInsideDhaka ? 80 : 130;

        // Choose product from message, conversation context, or first in-stock product
        let matchedProduct = products.find((p) => p.name === extracted.productName);
        if (!matchedProduct && conversation.productInterest) {
          matchedProduct = products.find((p) => p.name.includes(conversation.productInterest || ''));
        }
        if (!matchedProduct) {
          matchedProduct = products[0];
        }

        const productName = matchedProduct.name;
        const unitPrice = extracted.unitPrice || matchedProduct.price;
        const qty = extracted.quantity || 1;
        const subtotal = unitPrice * qty;
        const total = subtotal + deliveryCharge;

        const isAdvancePolicy = settings.bkashPaymentPolicy === 'Advance Delivery Charge via bKash';
        const paymentMethod = isAdvancePolicy ? 'bKash' : (extracted.paymentMethod || 'COD');

        autoCreatedOrder = {
          id: `ord-${Date.now()}`,
          orderNumber,
          conversationId: id,
          platform: conversation.platform,
          customerName: extracted.customerName || conversation.customerName,
          customerPhone: extracted.customerPhone,
          deliveryAddress: {
            district,
            thana: extracted.thana || (isInsideDhaka ? 'Mirpur' : 'Sadar'),
            fullAddress: extracted.fullAddress || text,
          },
          items: [
            {
              id: `item-${Date.now()}`,
              name: productName,
              price: unitPrice,
              quantity: qty,
              variant: extracted.variant,
            },
          ],
          subtotal,
          deliveryCharge,
          totalAmount: total,
          paymentMethod: paymentMethod.toLowerCase() as 'cod' | 'bkash',
          payment_method: paymentMethod,
          payment_status: 'Unpaid',
          status: 'confirmed',
          notes: 'Auto-captured and closed by BanglaBot AI Sales Engine.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await createOrder(autoCreatedOrder);
        await updateConversation(id, {
          status: 'pending_order',
          intent: 'Order Confirmed',
          customerPhone: extracted.customerPhone,
          deliveryAddress: autoCreatedOrder.deliveryAddress,
        });

        let paymentInstructions = 'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে চেক করে টাকা দিন)।';
        if (isAdvancePolicy) {
          paymentInstructions = `ডেলিভারি চার্জ ৳${settings.bkashAdvanceAmount || 130} আমাদের বিকাশ নম্বরে (${settings.bkashNumber} - ${settings.bkashAccountType}) সেন্ড মানি করে TrxID দিন। বাকি ৳${subtotal} ক্যাশ অন ডেলিভারিতে দিতে পারবেন! 💳`;
        }

        const replyText = `🎉 অভিনন্দন ${autoCreatedOrder.customerName}! আপনার অর্ডারটি সফলভাবে লক করা হয়েছে।\n\n🧾 ইনভয়েস সামারি:\n• অর্ডার নম্বর: ${orderNumber}\n• প্রোডাক্ট: ${productName} (পরিমাণ: ${qty} টি${extracted.variant ? `, সাইজ: ${extracted.variant}` : ''})\n• প্রোডাক্ট মূল্য: ৳${subtotal}\n• ডেলিভারি চার্জ: ৳${deliveryCharge} (${district})\n• সর্বমোট: ৳${total}\n\n💳 পেমেন্ট পদ্ধতি: ${paymentInstructions}\n\nআপনার অফিসিয়াল অর্ডার ইনভয়েস কার্ড নিচে জেনারেট করা হলো 👇`;

        botReplyMessage = {
          id: `msg-${Date.now() + 1}`,
          conversationId: id,
          sender: 'bot',
          senderName: 'BanglaBot Sales Agent 🤖',
          text: replyText,
          timestamp: new Date().toISOString(),
          status: 'delivered',
          messageType: 'order_receipt',
          orderData: autoCreatedOrder,
        };
        await addMessage(botReplyMessage);

      } else if (text.length > 10 && (text.includes('নাম') || text.includes('ঠিকানা') || text.includes('01') || text.includes('০১') || text.includes('অর্ডার'))) {
        // Case C: Partial order info detected
        const missing: string[] = [];
        if (!extracted.customerPhone) missing.push('11-digit Phone Number');
        if (!extracted.fullAddress && !extracted.district) missing.push('Delivery Address');
        if (!extracted.productName) missing.push('Product Details');

        await updateConversation(id, {
          intent: 'Checkout/Order',
        });

        const promptText = generateMissingInfoPrompt(missing, settings.bkashPaymentPolicy, settings.bkashNumber);
        botReplyMessage = {
          id: `msg-${Date.now() + 1}`,
          conversationId: id,
          sender: 'bot',
          senderName: 'BanglaBot Deal Closer 🤖',
          text: promptText,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };
        await addMessage(botReplyMessage);

      } else if (keywordResult.matched && keywordResult.replyText) {
        // Case D: Keyword matched
        if (keywordResult.trigger) {
          await incrementTriggerMatch(keywordResult.trigger.id);
        }
        botReplyMessage = {
          id: `msg-${Date.now() + 1}`,
          conversationId: id,
          sender: 'bot',
          senderName: 'BanglaBot Auto-Responder 🤖',
          text: keywordResult.replyText,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };
        await addMessage(botReplyMessage);

      } else {
        // Case E: Intelligent sales conversation
        await updateConversation(id, { intent });

        const aiResponse = await generateSmartChatReply({
          customerMessage: text,
          customerName: conversation.customerName,
          platform: conversation.platform,
          products,
          intent,
        });

        botReplyMessage = {
          id: `msg-${Date.now() + 1}`,
          conversationId: id,
          sender: 'bot',
          senderName: 'BanglaBot AI Sales Closer 🤖',
          text: aiResponse,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };
        await addMessage(botReplyMessage);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        botReplyMessage,
        order: autoCreatedOrder,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
