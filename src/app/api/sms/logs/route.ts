import { NextRequest, NextResponse } from 'next/server';
import { getSmsLogs, getSmsConfig, updateSmsConfig } from '@/lib/db';

export async function GET() {
  try {
    const [logs, config] = await Promise.all([getSmsLogs(), getSmsConfig()]);
    return NextResponse.json({ success: true, data: { logs, config } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await updateSmsConfig(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
