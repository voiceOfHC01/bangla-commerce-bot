import { NextRequest, NextResponse } from 'next/server';
import { generateSocialCaptions } from '@/lib/ai-service';
import { CaptionGenerationRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CaptionGenerationRequest;

    if (!body.productName) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }

    const result = await generateSocialCaptions(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
