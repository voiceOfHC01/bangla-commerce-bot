import { NextRequest, NextResponse } from 'next/server';
import { getConversations, createConversation } from '@/lib/db';
import { Conversation, Platform, ConversationStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = (searchParams.get('platform') || 'all') as Platform | 'all';
    const status = (searchParams.get('status') || 'all') as ConversationStatus | 'all';
    const search = searchParams.get('search') || undefined;

    const conversations = await getConversations({ platform, status, search });
    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      platform: body.platform || 'facebook',
      customerName: body.customerName || 'Guest Customer',
      customerAvatar: body.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      customerPhone: body.customerPhone,
      customerHandle: body.customerHandle,
      lastMessage: body.initialMessage || 'Hello',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 1,
      status: 'unread',
      botActive: true,
      productInterest: body.productInterest,
    };

    const saved = await createConversation(newConv);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
