import { NextRequest, NextResponse } from 'next/server';
import { getKeywordTriggers, saveKeywordTrigger } from '@/lib/db';
import { KeywordTrigger } from '@/lib/types';

export async function GET() {
  try {
    const triggers = await getKeywordTriggers();
    return NextResponse.json({ success: true, data: triggers });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const trigger: KeywordTrigger = {
      id: body.id || `trig-${Date.now()}`,
      title: body.title,
      keywords: Array.isArray(body.keywords) ? body.keywords : body.keywords.split(',').map((k: string) => k.trim()),
      responseText: body.responseText,
      action: body.action || 'reply',
      active: body.active !== undefined ? body.active : true,
      matchCount: body.matchCount || 0,
    };

    const saved = await saveKeywordTrigger(trigger);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
