import { NextRequest, NextResponse } from 'next/server';
import { getCommentRules, saveCommentRule, deleteCommentRule } from '@/lib/db';
import { CommentAutomationRule } from '@/lib/types';

export async function GET() {
  try {
    const rules = await getCommentRules();
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rule: CommentAutomationRule = {
      id: body.id || `rule-${Date.now()}`,
      platform: body.platform || 'facebook',
      campaignName: body.campaignName,
      postTitle: body.postTitle,
      postThumbnail: body.postThumbnail || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=200',
      keywords: Array.isArray(body.keywords)
        ? body.keywords
        : (body.keywords || '').split(',').map((k: string) => k.trim()),
      publicReplyTemplate: body.publicReplyTemplate,
      privateDmMessage: body.privateDmMessage,
      includeMiniStore: body.includeMiniStore !== undefined ? body.includeMiniStore : true,
      autoLikeComment: body.autoLikeComment !== undefined ? body.autoLikeComment : true,
      active: body.active !== undefined ? body.active : true,
      totalCommentsHandled: body.totalCommentsHandled || 0,
      totalDmsSent: body.totalDmsSent || 0,
      createdAt: new Date().toISOString(),
    };

    const saved = await saveCommentRule(rule);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Rule ID required' }, { status: 400 });

    const ok = await deleteCommentRule(id);
    return NextResponse.json({ success: ok });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
