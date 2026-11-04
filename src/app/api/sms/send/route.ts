import { NextRequest, NextResponse } from 'next/server';
import { sendBangladeshiSms } from '@/lib/sms-service';
import { getOrderById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, phone, customerName, customText, messageType } = body;

    let order = undefined;
    if (orderId) {
      order = (await getOrderById(orderId)) || undefined;
    }

    const targetPhone = phone || order?.customerPhone;
    const targetName = customerName || order?.customerName || 'Customer';

    if (!targetPhone) {
      return NextResponse.json({ success: false, error: 'Recipient phone number is required' }, { status: 400 });
    }

    const log = await sendBangladeshiSms({
      order,
      phone: targetPhone,
      customerName: targetName,
      customText,
      messageType,
    });

    return NextResponse.json({
      success: true,
      message: `SMS successfully dispatched via ${log.gateway} to ${log.recipientPhone}`,
      data: log,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
