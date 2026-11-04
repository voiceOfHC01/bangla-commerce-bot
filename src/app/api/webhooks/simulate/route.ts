import { NextRequest, NextResponse } from 'next/server';
import { getConversations, createConversation } from '@/lib/db';
import { Conversation, Platform } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const platform = (body.platform || 'facebook') as Platform;
    const customerName = body.customerName || (platform === 'whatsapp' ? 'Kazi Shariful' : platform === 'instagram' ? 'Sultana Nargis' : 'Tanvir Ahmed');
    const customerPhone = body.customerPhone || '01722334455';
    const messageText = body.messageText || 'আসসালামু আলাইকুম, পাঞ্জাবির দাম কত? সাইজ ৪২ কি হবে?';

    // Check if conversation exists for this phone or customer
    const conversations = await getConversations();
    let conv = conversations.find(
      (c) => c.platform === platform && (c.customerPhone === customerPhone || c.customerName === customerName)
    );

    if (!conv) {
      conv = {
        id: `conv-sim-${Date.now()}`,
        platform,
        customerName,
        customerPhone,
        customerHandle: platform === 'whatsapp' ? `+88${customerPhone}` : `@${customerName.toLowerCase().replace(/\s+/g, '.')}`,
        customerAvatar: platform === 'whatsapp'
          ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
          : platform === 'instagram'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        lastMessage: messageText,
        lastMessageTime: new Date().toISOString(),
        unreadCount: 1,
        status: 'unread',
        botActive: true,
        productInterest: body.productInterest || 'Executive Cotton Semi-fitted Panjabi',
      };
      await createConversation(conv);
    }

    // Forward message to the conversation messages pipeline to trigger auto-responder / order extraction!
    const origin = request.nextUrl.origin;
    const msgRes = await fetch(`${origin}/api/conversations/${conv.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: 'customer',
        senderName: customerName,
        text: messageText,
      }),
    });

    const msgData = await msgRes.json();

    return NextResponse.json({
      success: true,
      simulatedPlatform: platform,
      conversationId: conv.id,
      customerName,
      messageSent: messageText,
      result: msgData.data,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
