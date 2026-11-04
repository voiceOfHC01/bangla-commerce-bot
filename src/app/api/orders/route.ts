import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';
import { Order, OrderStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'all') as OrderStatus | 'all';
    const platform = searchParams.get('platform') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = await getOrders({ status, platform, search });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderNumber = `BD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const subtotal = body.items.reduce(
      (sum: number, it: { price: number; quantity: number }) => sum + it.price * it.quantity,
      0
    );
    const district = body.deliveryAddress?.district || 'Dhaka';
    const isInsideDhaka = district.toLowerCase() === 'dhaka';
    const deliveryCharge = body.deliveryCharge ?? (isInsideDhaka ? 80 : 150);
    const totalAmount = subtotal + deliveryCharge;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      platform: body.platform || 'manual',
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      deliveryAddress: {
        district,
        thana: body.deliveryAddress?.thana || '',
        fullAddress: body.deliveryAddress?.fullAddress || '',
      },
      items: body.items || [],
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: body.paymentMethod || 'cod',
      status: body.status || 'pending',
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await createOrder(newOrder);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
