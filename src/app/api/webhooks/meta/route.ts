import { NextRequest, NextResponse } from 'next/server';
import { getConversations, createConversation, addMessage } from '@/lib/db';
import { Conversation, Message } from '@/lib/types';

const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'socialbazaar_meta_verify_token_2026';

// Meta Verification Challenge (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    console.log('[Meta Webhook] Successfully verified webhook challenge');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Meta Webhook Event Handler (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === 'page' || body.object === 'instagram') {
      const platform = body.object === 'instagram' ? 'instagram' : 'facebook';

      for (const entry of body.entry || []) {
        for (const messaging of entry.messaging || []) {
          const senderId = messaging.sender?.id;
          const messageText = messaging.message?.text;

          if (senderId && messageText) {
            // Find or create conversation
            const conversations = await getConversations();
            let conv = conversations.find(
              (c) => c.customerHandle === senderId || c.customerName.includes(senderId)
            );

            if (!conv) {
              conv = {
                id: `conv-meta-${Date.now()}`,
                platform,
                customerName: `${platform === 'instagram' ? 'IG' : 'FB'} User ${senderId.slice(-4)}`,
                customerHandle: senderId,
                customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                lastMessage: messageText,
                lastMessageTime: new Date().toISOString(),
                unreadCount: 1,
                status: 'unread',
                botActive: true,
              };
              await createConversation(conv);
            }

            const msg: Message = {
              id: `msg-meta-${Date.now()}`,
              conversationId: conv.id,
              sender: 'customer',
              senderName: conv.customerName,
              text: messageText,
              timestamp: new Date().toISOString(),
              status: 'delivered',
            };
            await addMessage(msg);
          }
        }
      }

      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    return NextResponse.json({ status: 'IGNORED' }, { status: 200 });
  } catch (error) {
    console.error('[Meta Webhook Error]:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
