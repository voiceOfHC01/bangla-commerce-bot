'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { ShoppingCart, DollarSign, Clock, Truck, CheckCircle2 } from 'lucide-react';

interface OrderStatsProps {
  orders: Order[];
}

export function OrderStats({ orders }: OrderStatsProps) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const processingOrShipped = orders.filter((o) => o.status === 'processing' || o.status === 'shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `৳${totalRevenue.toLocaleString()}`,
      subtext: 'Gross merchandise value',
      icon: DollarSign,
      color: 'from-emerald-600 to-teal-600',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      subtext: 'Across Meta, IG & WhatsApp',
      icon: ShoppingCart,
      color: 'from-indigo-600 to-purple-600',
      iconColor: 'text-indigo-400',
    },
    {
      title: 'Pending Confirmation',
      value: pendingOrders,
      subtext: 'Requires phone confirmation',
      icon: Clock,
      color: 'from-amber-600 to-orange-600',
      iconColor: 'text-amber-400',
    },
    {
      title: 'In Transit / Shipped',
      value: processingOrShipped,
      subtext: 'Handed to RedX / Steadfast',
      icon: Truck,
      color: 'from-blue-600 to-cyan-600',
      iconColor: 'text-blue-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((st, idx) => {
        const Icon = st.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-400">{st.title}</p>
              <h3 className="text-xl font-extrabold text-white mt-1 tracking-tight">
                {st.value}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{st.subtext}</p>
            </div>
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${st.color} bg-opacity-20 flex items-center justify-center shadow-inner`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
