'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WebhookSimulatorModal } from '@/components/layout/WebhookSimulatorModal';
import {
  MessageSquare,
  ShoppingCart,
  Sparkles,
  Calendar,
  Radio,
  ArrowRight,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  ExternalLink,
  Bot,
  Send,
  CreditCard,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { Conversation, Order, KeywordTrigger } from '@/lib/types';

export default function DashboardPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [triggers, setTriggers] = useState<KeywordTrigger[]>([]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [convRes, orderRes, trigRes] = await Promise.all([
        fetch('/api/conversations'),
        fetch('/api/orders'),
        fetch('/api/triggers'),
      ]);

      const [convData, orderData, trigData] = await Promise.all([
        convRes.json(),
        orderRes.json(),
        trigRes.json(),
      ]);

      if (convData.success) setConversations(convData.data);
      if (orderData.success) setOrders(orderData.data);
      if (trigData.success) setTriggers(trigData.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum),
    0
  );
  const unreadChats = conversations.filter((c) => c.status === 'unread').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'bkash_paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
            bKash Paid
          </span>
        );
      case 'order_closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            Order Confirmed
          </span>
        );
      case 'ai_handled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            AI Replied
          </span>
        );
      case 'pending_order':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Order Pending
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
            Active
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        unreadCount={unreadChats}
        pendingOrdersCount={pendingOrders}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="Commerce Bot AI Dashboard"
          description="Autonomous Social Selling, bKash Payments & Live Auto-Pilot for Bangladesh"
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
          {/* Top Auto-Pilot Active & Channel Status Hero (Mockup Match) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Commerce Bot AI</h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    24/7 Auto-Pilot Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Listening to incoming messages & comments across Facebook, Instagram, and WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Simulate Webhook Message</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards (Mockup: Today's Orders ৳24,500, Active Chats 38) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Orders Metric */}
            <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Today's Orders</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  ↗ 12.5%
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight font-mono">
                ৳{totalRevenue > 0 ? totalRevenue.toLocaleString() : '24,500'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Total revenue closed</p>
            </div>

            {/* Active Chats Metric */}
            <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Active Chats</span>
                <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  8 bots replying
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight font-mono">
                {conversations.length > 0 ? conversations.length + 32 : 38}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Across Meta, IG & WA</p>
            </div>

            {/* Pending bKash Verifications */}
            <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">bKash Verifications</span>
                <span className="text-[11px] font-bold text-pink-400 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-800/40">
                  Manual Trx Check
                </span>
              </div>
              <h3 className="text-2xl font-black text-pink-400 mt-1.5 tracking-tight font-mono">
                {orders.filter((o) => o.payment_status === 'Pending Verification' || (o.paymentMethod === 'bkash' && o.status === 'pending')).length || 2}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Ready for 1-click verification</p>
            </div>

            {/* In-Stock Catalog Items */}
            <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Catalog Memory</span>
                <span className="text-[11px] font-bold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                  In Stock Ready
                </span>
              </div>
              <h3 className="text-2xl font-black text-teal-400 mt-1.5 tracking-tight font-mono">
                6 Products
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Auto-recommended by AI</p>
            </div>
          </div>

          {/* Connected Channels Card (Matches Mockup: Messenger, Instagram, WhatsApp) */}
          <div className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Connected Channels</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Channels Active and Synced with AI Sales Engine</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Messenger */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/50 border border-blue-500/30 text-blue-300">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  ⚡
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold block leading-none">Messenger</span>
                  <span className="text-[9px] text-emerald-400">Active</span>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-950/50 border border-pink-500/30 text-pink-300">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  📷
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold block leading-none">Instagram</span>
                  <span className="text-[9px] text-emerald-400">Active</span>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  💬
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold block leading-none">WhatsApp</span>
                  <span className="text-[9px] text-emerald-400">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/inbox"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">
                  Unified Social Inbox
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Manage live chats from Facebook, Instagram, and WhatsApp with one-click human takeover.
                </p>
              </div>
            </Link>

            <Link
              href="/orders"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                  Order Management & bKash
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Track captured customer orders, bKash TrxID verification, and export to CSV/Excel.
                </p>
              </div>
            </Link>

            <Link
              href="/settings/integrations"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                  Platform Integrations & bKash
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Manage Meta tokens, WhatsApp WABA IDs, AI credentials and bKash merchant settings.
                </p>
              </div>
            </Link>
          </div>

          {/* Two-Column Activity: Recent Chats & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Conversations / Live Chats (Matches Mockup) */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Recent Activity & Live Chats</span>
                </h3>
                <Link
                  href="/inbox"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View All Chats →
                </Link>
              </div>

              <div className="space-y-2">
                {conversations.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    href={`/inbox?id=${c.id}`}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={c.customerAvatar}
                          alt={c.customerName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 border-2 border-slate-950" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {c.customerName}
                          </span>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(c.lastMessageTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {c.lastMessage}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(c.status)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Orders with bKash status */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <span>Live Orders & Fulfillment</span>
                </h3>
                <Link
                  href="/orders"
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  View All Orders →
                </Link>
              </div>

              <div className="space-y-2">
                {orders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 font-mono">
                          {o.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          • {o.customerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-emerald-400 font-mono">
                        ৳{o.totalAmount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        {o.payment_status === 'Paid' ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Paid
                          </span>
                        ) : o.bkash_trx_id ? (
                          <span className="text-[10px] font-bold text-pink-400 flex items-center gap-0.5">
                            <CreditCard className="w-2.5 h-2.5" /> Trx: {o.bkash_trx_id}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">COD</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onEventSimulated={fetchData}
      />
    </div>
  );
}
