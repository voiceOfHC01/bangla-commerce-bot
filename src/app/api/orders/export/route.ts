import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';
import { OrderStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'all') as OrderStatus | 'all';
    const orders = await getOrders({ status });

    const headers = [
      'Order ID',
      'Date',
      'Platform',
      'Customer Name',
      'Phone Number',
      'District',
      'Thana/Area',
      'Delivery Address',
      'Items',
      'Subtotal (BDT)',
      'Delivery Charge (BDT)',
      'Total Amount (BDT)',
      'Payment Method',
      'Order Status',
      'Notes',
    ];

    const rows = orders.map((o) => {
      const itemsStr = o.items.map((i) => `${i.name} (x${i.quantity})`).join('; ');
      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleString('en-US')}"`,
        `"${o.platform}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        `"${o.deliveryAddress.district}"`,
        `"${o.deliveryAddress.thana}"`,
        `"${(o.deliveryAddress.fullAddress || '').replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.subtotal,
        o.deliveryCharge,
        o.totalAmount,
        `"${o.paymentMethod.toUpperCase()}"`,
        `"${o.status.toUpperCase()}"`,
        `"${(o.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // Prepend UTF-8 BOM so Excel opens Bengali and Unicode properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="SocialBazaar_Orders_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
