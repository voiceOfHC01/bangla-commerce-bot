import { NextRequest, NextResponse } from 'next/server';
import { getConversations, createConversation, addMessage } from '@/lib/db';
import { Conversation, Message } from '@/lib/types';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'socialbazaar_wa_token_2026';

// WhatsApp Verification Challenge (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp Cloud Webhook] Successfully verified challenge token');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// WhatsApp Cloud API Event Handler (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          // Message Status updates (delivered, read)
          if (value?.statuses) {
            for (const status of value.statuses) {
              console.log(`[WA Cloud] Message status update: ${status.id} is now ${status.status}`);
            }
          }

          // Incoming messages
          if (value?.messages) {
            for (const message of value.messages) {
              const fromNumber = message.from; // e.g. 8801712345678
              const contactName = value.contacts?.[0]?.profile?.name || `WA User +${fromNumber}`;
              const cleanPhone = fromNumber.startsWith('88') ? fromNumber.slice(2) : fromNumber;

              let text = '';
              let messageType: any = 'text';

              if (message.type === 'text') {
                text = message.text?.body || '';
              } else if (message.type === 'interactive') {
                // Interactive buttons or list replies
                const interactive = message.interactive;
                if (interactive.type === 'button_reply') {
                  text = `[Clicked Button: ${interactive.button_reply?.title}] (ID: ${interactive.button_reply?.id})`;
                } else if (interactive.type === 'list_reply') {
                  text = `[Selected List Item: ${interactive.list_reply?.title}]`;
                }
              } else if (message.type === 'audio') {
                text = '🎙️ [WhatsApp Voice Note Received]';
              } else if (message.type === 'location') {
                text = `📍 [Shared Location]: Lat ${message.location?.latitude}, Long ${message.location?.longitude} - ${message.location?.name || ''}`;
              } else if (message.type === 'image') {
                text = '📷 [Photo Attached]';
              }

              if (fromNumber && text) {
                const conversations = await getConversations();
                let conv = conversations.find(
                  (c) =>
                    c.platform === 'whatsapp' &&
                    (c.customerPhone === cleanPhone || c.customerHandle === `+${fromNumber}`)
                );

                if (!conv) {
                  conv = {
                    id: `conv-wa-${Date.now()}`,
                    platform: 'whatsapp',
                    customerName: contactName,
                    customerPhone: cleanPhone,
                    customerHandle: `+${fromNumber}`,
                    customerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
                    lastMessage: text,
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 1,
                    status: 'unread',
                    botActive: true,
                    source: 'whatsapp_cloud',
                  };
                  await createConversation(conv);
                }

                const origin = request.nextUrl.origin;
                // Forward through message pipeline to trigger smart bot & order parser
                await fetch(`${origin}/api/conversations/${conv.id}/messages`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    sender: 'customer',
                    senderName: contactName,
                    text,
                  }),
                });
              }
            }
          }
        }
      }

      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    return NextResponse.json({ status: 'IGNORED' }, { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Cloud Webhook Error]:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
