import { Order, SmsLog } from './types';
import { getSmsConfig, addSmsLog, updateOrder } from './db';

export interface SendSmsParams {
  order?: Order;
  phone: string;
  customerName: string;
  customText?: string;
  messageType?: 'order_confirmation' | 'order_shipped' | 'abandoned_cart' | 'custom';
}

export async function sendBangladeshiSms(params: SendSmsParams): Promise<SmsLog> {
  const { order, phone, customerName, customText, messageType = 'order_confirmation' } = params;
  const config = await getSmsConfig();

  let messageText = '';
  let trackingUrl = '';

  if (customText) {
    messageText = customText;
  } else if (order) {
    trackingUrl = `https://socialbazaar.bd/track/${order.orderNumber}`;
    if (messageType === 'order_shipped') {
      messageText = `প্রিয় ${customerName}, আপনার অর্ডার #${order.orderNumber} কুরিয়ারে হস্তান্তর করা হয়েছে। পার্সেল ট্র্যাকিং: ${trackingUrl}। রাইডার ডেলিভারির পূর্বে কল করবে। SocialBazaar`;
    } else {
      // Order Confirmation
      const itemsSnippet = order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ');
      messageText = `প্রিয় ${customerName}, SocialBazaar-এ আপনার অর্ডার #${order.orderNumber} সফলভাবে গৃহীত হয়েছে। মোট প্রদেয়: ৳${order.totalAmount} (${order.paymentMethod.toUpperCase()})। ডেলিভারি ২৪-৪৮ ঘণ্টায়। ট্র্যাকিং: ${trackingUrl}`;
    }
  } else {
    messageText = `প্রিয় ${customerName}, SocialBazaar-এ আপনার আগ্রহের জন্য ধন্যবাদ। যেকোনো তথ্যে কল করুন: 01700-000000।`;
  }

  // Calculate simulated rate: ~0.35 BDT for Bangla/English SMS
  const costBDT = config.ratePerSms || 0.35;

  const smsLog: SmsLog = {
    id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    orderId: order?.id,
    recipientPhone: phone,
    recipientName: customerName,
    gateway: config.gateway,
    senderId: config.senderId,
    messageText,
    status: 'delivered',
    costBDT,
    timestamp: new Date().toISOString(),
    trackingUrl,
  };

  await addSmsLog(smsLog);

  // Mark order as SMS sent
  if (order?.id) {
    await updateOrder(order.id, { smsSent: true });
  }

  return smsLog;
}
