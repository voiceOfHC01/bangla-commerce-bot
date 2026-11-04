'use client';

import React, { useState } from 'react';
import { Order, OrderStatus, Platform } from '@/lib/types';
import {
  Search,
  Download,
  Plus,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Package,
  AlertCircle,
  ChevronDown,
  Trash2,
  CreditCard,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
  onStatusChange: (id: string, newStatus: OrderStatus) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
  onOpenNewOrderModal: () => void;
  statusFilter: OrderStatus | 'all';
  onStatusFilterChange: (s: OrderStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOrderUpdated?: () => void;
}

export function OrdersTable({
  orders,
  onStatusChange,
  onDeleteOrder,
  onOpenNewOrderModal,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onOrderUpdated,
}: OrdersTableProps) {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Package className="w-3 h-3" /> Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" /> Cancelled
          </span>
        );
    }
  };

  const getPlatformBadge = (platform: Platform | 'manual') => {
    switch (platform) {
      case 'facebook':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-900/50 text-blue-300 border border-blue-700/50">Facebook</span>;
      case 'instagram':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-900/50 text-pink-300 border border-pink-700/50">Instagram</span>;
      case 'whatsapp':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">WhatsApp</span>;
      case 'manual':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">Manual</span>;
    }
  };

  const handleVerifyBkash = async (orderId: string) => {
    setVerifyingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: 'Paid',
          status: 'confirmed',
        }),
      });
      const data = await res.json();
      if (data.success && onOrderUpdated) {
        onOrderUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/orders/export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BanglaCommerce_Orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (platformFilter !== 'all' && o.platform !== platformFilter) return false;
    return true;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by 11-digit phone, customer name, order #..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/70 border border-slate-800 rounded-xl text-xs overflow-x-auto">
            {(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onStatusFilterChange(s)}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition cursor-pointer text-[11px] ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer shrink-0"
            title="Download CSV for Microsoft Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>{exporting ? 'Exporting...' : 'Export Excel/CSV'}</span>
          </button>

          <button
            onClick={onOpenNewOrderModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Order</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Order ID & Date</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Customer Details</th>
              <th className="py-3 px-4">Delivery Address</th>
              <th className="py-3 px-4">Items & Qty</th>
              <th className="py-3 px-4">Total & Payment</th>
              <th className="py-3 px-4">bKash TrxID & Verification</th>
              <th className="py-3 px-4">Status & Workflow</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                  No orders found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isBkash = order.paymentMethod === 'bkash' || order.payment_method === 'bKash' || !!order.bkash_trx_id;
                const isPaid = order.payment_status === 'Paid';

                return (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition">
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-slate-100">{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-4">
                      {getPlatformBadge(order.platform)}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{order.customerName}</p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-2.5 h-2.5" /> {order.customerPhone}
                      </a>
                    </td>

                    {/* Delivery Address */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1 font-semibold text-slate-200">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{order.deliveryAddress.district}</span>
                        {order.deliveryAddress.thana && (
                          <span className="text-slate-400 font-normal">
                            ({order.deliveryAddress.thana})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {order.deliveryAddress.fullAddress}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      {order.items.map((it, idx) => (
                        <p key={idx} className="text-[11px] text-slate-200 leading-snug">
                          {it.name} <span className="text-slate-400 font-bold">x{it.quantity}</span>
                        </p>
                      ))}
                    </td>

                    {/* Total & Payment Method */}
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-emerald-400 text-sm">
                        ৳{order.totalAmount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          isBkash
                            ? 'bg-pink-900/60 text-pink-300 border border-pink-700/60'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {isBkash ? 'bKash' : 'COD'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          (Deliv: ৳{order.deliveryCharge})
                        </span>
                      </div>
                    </td>

                    {/* bKash TrxID & Manual Verification Badge & Button */}
                    <td className="py-3.5 px-4">
                      {isBkash ? (
                        <div className="space-y-1.5">
                          {order.bkash_trx_id ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-300 font-mono text-[11px]">
                              <CreditCard className="w-3 h-3 text-pink-400 shrink-0" />
                              <span className="font-bold">{order.bkash_trx_id}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic block">No TrxID submitted</span>
                          )}

                          <div className="flex items-center gap-2">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <ShieldCheck className="w-3 h-3" /> Verified & Paid
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyBkash(order.id)}
                                disabled={verifyingId === order.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[10px] shadow-sm transition cursor-pointer"
                                title="Click to manually verify bKash payment"
                              >
                                <Check className="w-3 h-3" />
                                <span>{verifyingId === order.id ? 'Verifying...' : 'Mark as Verified / Paid'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-medium">— COD Unpaid</span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                          className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete order ${order.orderNumber}?`)) {
                            onDeleteOrder(order.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
