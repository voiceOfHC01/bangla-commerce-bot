import { NextRequest, NextResponse } from 'next/server';
import { processCommentAutomation } from '@/lib/comment-automation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform = 'facebook', postTitle, commenterName = 'Sabbir Hossain', commentText = 'Price please? Delivery charge koto?' } = body;

    const result = await processCommentAutomation({
      platform,
      postTitle,
      commenterName,
      commentText,
    });

    return NextResponse.json({
      success: true,
      message: 'Comment-to-DM executed: Public comment replied + Private DM dispatched!',
      data: result,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
