import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder, deleteOrder } from '@/lib/db';
import { OrderStatus } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedUpdates: Record<string, unknown> = {};
    if (body.status) allowedUpdates.status = body.status as OrderStatus;
    if (body.payment_status) allowedUpdates.payment_status = body.payment_status;
    if (body.payment_method) allowedUpdates.payment_method = body.payment_method;
    if (body.paymentMethod) allowedUpdates.paymentMethod = body.paymentMethod;
    if (body.bkash_trx_id !== undefined) allowedUpdates.bkash_trx_id = body.bkash_trx_id;
    if (body.bkash_sender_number !== undefined) allowedUpdates.bkash_sender_number = body.bkash_sender_number;
    if (body.notes !== undefined) allowedUpdates.notes = body.notes;
    if (body.trackingNumber !== undefined) allowedUpdates.trackingNumber = body.trackingNumber;

    const updated = await updateOrder(id, allowedUpdates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteOrder(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
