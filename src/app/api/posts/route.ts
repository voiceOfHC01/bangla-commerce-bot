import { NextRequest, NextResponse } from 'next/server';
import { getScheduledPosts, createScheduledPost } from '@/lib/db';
import { ScheduledPost } from '@/lib/types';

export async function GET() {
  try {
    const posts = await getScheduledPosts();
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.caption) {
      return NextResponse.json(
        { success: false, error: 'Post caption is required' },
        { status: 400 }
      );
    }

    const post: ScheduledPost = {
      id: `post-${Date.now()}`,
      caption: body.caption,
      platforms: body.platforms && body.platforms.length > 0 ? body.platforms : ['facebook'],
      mediaUrls: body.mediaUrls || [],
      scheduledTime: body.scheduledTime || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      status: body.status || 'scheduled',
      createdAt: new Date().toISOString(),
    };

    const saved = await createScheduledPost(post);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
