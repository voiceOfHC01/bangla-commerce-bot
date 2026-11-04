'use client';

import React from 'react';
import { Conversation, Platform, ConversationStatus } from '@/lib/types';
import { Search, MessageSquare, CheckCheck, Clock, ShoppingBag, Sparkles, AlertCircle, CreditCard, Bot } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
  selectedPlatform: Platform | 'all';
  onSelectPlatform: (p: Platform | 'all') => void;
  selectedStatus: ConversationStatus | 'all';
  onSelectStatus: (s: ConversationStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  selectedPlatform,
  onSelectPlatform,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  const getPlatformBadge = (platform: Platform) => {
    switch (platform) {
      case 'facebook':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            FB
          </span>
        );
      case 'instagram':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30">
            IG
          </span>
        );
      case 'whatsapp':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            WA
          </span>
        );
    }
  };

  const getStatusBadge = (status: ConversationStatus) => {
    switch (status) {
      case 'unread':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Unread
          </span>
        );
      case 'replied':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Replied
          </span>
        );
      case 'pending_order':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <ShoppingBag className="w-2.5 h-2.5" /> Order Pending
          </span>
        );
      case 'ai_handled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            <Bot className="w-2.5 h-2.5" /> AI Replied
          </span>
        );
      case 'order_closed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <CheckCheck className="w-2.5 h-2.5" /> Order Confirmed
          </span>
        );
      case 'bkash_paid':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/25 text-pink-300 border border-pink-500/40 flex items-center gap-1 shadow-[0_0_10px_rgba(236,72,153,0.25)]">
            <CreditCard className="w-2.5 h-2.5 text-pink-400" /> bKash Paid
          </span>
        );
      case 'needs_human_review':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" /> Needs Human Review
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="w-full md:w-88 border-r border-slate-800 bg-slate-900/60 flex flex-col h-full shrink-0">
      {/* Top Search & Filter Bar */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search chats, name, phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Channel Filters */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px]">
          {(['all', 'facebook', 'instagram', 'whatsapp'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onSelectPlatform(p)}
              className={`py-1 rounded font-medium capitalize text-center transition cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'all' ? 'All' : p === 'facebook' ? 'Meta' : p === 'instagram' ? 'IG' : 'WA'}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-0.5 scrollbar-none">
          {(['all', 'unread', 'ai_handled', 'bkash_paid', 'order_closed', 'pending_order'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onSelectStatus(s as ConversationStatus | 'all')}
              className={`px-2 py-0.5 rounded-full shrink-0 transition cursor-pointer font-medium ${
                selectedStatus === s
                  ? 'bg-indigo-600 text-white border border-indigo-500'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              {s === 'all'
                ? 'All'
                : s === 'unread'
                ? 'Unread'
                : s === 'ai_handled'
                ? 'AI Replied'
                : s === 'bkash_paid'
                ? 'bKash'
                : s === 'order_closed'
                ? 'Confirmed'
                : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-xs">No conversations match the filter.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = selectedId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition select-none ${
                  isSelected
                    ? 'bg-slate-800/90 border-l-4 border-indigo-500'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Avatar with Channel Overlay */}
                <div className="relative shrink-0">
                  <img
                    src={conv.customerAvatar}
                    alt={conv.customerName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <div className="absolute -bottom-1 -right-1">
                    {getPlatformBadge(conv.platform)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {conv.customerName}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatTimeAgo(conv.lastMessageTime)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 truncate mb-1.5 leading-snug">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div>{getStatusBadge(conv.status)}</div>
                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
