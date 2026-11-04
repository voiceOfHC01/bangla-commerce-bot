'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Conversation,
  Message,
  Platform,
  Product,
  Order,
} from '@/lib/types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Zap,
  RotateCcw,
  CheckCheck,
  Smartphone,
  Check,
  X,
  MessageSquare,
  CreditCard,
  FileText,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { QuickRepliesModal } from './QuickRepliesModal';
import { InChatMiniStore } from './InChatMiniStore';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string, sender: 'agent' | 'customer', extra?: Partial<Message>) => Promise<void>;
  onToggleBot: (active: boolean) => Promise<void>;
  onCreateOrderShortcut?: (conv: Conversation) => void;
  loadingMessages?: boolean;
  onRefresh?: () => void;
}

export function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onToggleBot,
  onCreateOrderShortcut,
  loadingMessages = false,
  onRefresh,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isQuickRepliesOpen, setIsQuickRepliesOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsText, setSmsText] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsSuccessMsg, setSmsSuccessMsg] = useState<string | null>(null);
  
  // Simulator mode toggle: Agent reply vs Customer message simulation
  const [senderMode, setSenderMode] = useState<'agent' | 'customer'>('agent');
  const [verifyingTrx, setVerifyingTrx] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/40 text-slate-500">
        <Bot className="w-12 h-12 stroke-1 mb-3 text-slate-600" />
        <h3 className="text-base font-bold text-slate-400">Select a Conversation</h3>
        <p className="text-xs text-slate-500 max-w-sm text-center mt-1">
          Pick a chat from the left panel to review messages, send In-Chat Mini Store cards, or trigger SMS confirmation.
        </p>
      </div>
    );
  }

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    try {
      await onSendMessage(text, senderMode);
      if (onRefresh) onRefresh();
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendMiniStore = async () => {
    setIsSending(true);
    try {
      await onSendMessage(
        '🛍️ আমাদের হট-সেলিং প্রোডাক্ট কালেকশন নিচে সরাসরি ব্রাউজ ও অর্ডার করতে পারবেন:',
        'agent',
        {
          messageType: 'mini_store_carousel',
          productData: products.slice(0, 3),
        }
      );
      if (onRefresh) onRefresh();
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkPaid = async (orderId?: string) => {
    if (!orderId) return;
    setVerifyingTrx(orderId);
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
      if (data.success && onRefresh) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingTrx(null);
    }
  };

  const handleGenerateAiSuggestion = async () => {
    setIsAiGenerating(true);
    try {
      const lastCust = messages.filter((m) => m.sender === 'customer').pop();
      const res = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: conversation.productInterest || 'Executive Panjabi',
          keyFeatures: 'Pure cotton, inside Dhaka 80 Tk delivery, outside Dhaka 130 Tk, Cash on delivery',
          platform: 'facebook',
          language: 'bengali',
          tone: 'casual_friendly',
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.captions?.[0]?.content) {
        setInputText(
          `আসসালামু আলাইকুম ${conversation.customerName}! আমাদের প্রিমিয়াম কোয়ালিটি নিশ্চিত প্রোডাক্টে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। আপনার ডেলিভারি ঠিকানা দিলে আমরা এখনই পার্সেলটি বুক করে দিচ্ছি! 🚚`
        );
      } else {
        setInputText(
          `আসসালামু আলাইকুম ${conversation.customerName}! আপনার অর্ডারটি কনফার্ম করতে ১১ ডিজিটের ফোন নম্বর এবং সম্পূর্ণ ঠিকানা লিখে জানান। 😊`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const getPlatformLabel = (platform: Platform) => {
    switch (platform) {
      case 'facebook':
        return 'Facebook Messenger';
      case 'instagram':
        return 'Instagram DM';
      case 'whatsapp':
        return 'WhatsApp Cloud API';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Top Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between gap-4 z-10 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={conversation.customerAvatar}
              alt={conversation.customerName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                conversation.botActive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white leading-none">
                {conversation.customerName}
              </h3>
              <span className="text-[11px] font-medium text-slate-400">
                ({getPlatformLabel(conversation.platform)})
              </span>
              {conversation.intent && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Stage: {conversation.intent}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              {conversation.customerPhone ? (
                <span className="flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  {conversation.customerPhone}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Phone not yet captured</span>
              )}
              {conversation.deliveryAddress?.district && (
                <span className="flex items-center gap-1 text-[11px] text-slate-300">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {conversation.deliveryAddress.district}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & One-Click Takeover */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Send Mini Store Button */}
          <button
            onClick={handleSendMiniStore}
            disabled={isSending || products.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
            title="Send in-chat visual product carousel"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Mini Store</span>
          </button>

          {/* AI Auto-Bot / One-click Takeover Toggle */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
              conversation.botActive
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            <Bot className={`w-4 h-4 ${conversation.botActive ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-xs font-medium hidden md:inline">
              {conversation.botActive ? 'AI Auto-Pilot ON' : 'Human Takeover'}
            </span>
            <button
              onClick={() => onToggleBot(!conversation.botActive)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                conversation.botActive ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
              title={conversation.botActive ? 'Pause AI and takeover manually' : 'Turn AI Auto-Pilot back on'}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  conversation.botActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Create Order Shortcut Button */}
          {onCreateOrderShortcut && (
            <button
              onClick={() => onCreateOrderShortcut(conversation)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Message History Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {loadingMessages ? (
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          messages.map((msg) => {
            const isCustomer = msg.sender === 'customer';
            const isBot = msg.sender === 'bot';
            const isMiniStore = msg.messageType === 'mini_store_carousel' || msg.messageType === 'product_card';
            const isReceipt = msg.messageType === 'order_receipt' || !!msg.orderData;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[92%] md:max-w-[85%] ${
                  isCustomer ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar / Icon */}
                <div className="shrink-0 mt-1">
                  {isCustomer ? (
                    <img
                      src={conversation.customerAvatar}
                      alt="Customer"
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                    />
                  ) : isBot ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      A
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1 w-full">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isCustomer
                        ? 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/60 shadow-sm'
                        : isBot
                        ? 'bg-gradient-to-tr from-slate-900 to-indigo-950/80 text-slate-100 rounded-tr-sm border border-indigo-500/30 shadow-md'
                        : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    }`}
                  >
                    {/* Header tag */}
                    <div className="flex items-center gap-1.5 mb-1.5 opacity-80 font-semibold text-[10px]">
                      {isCustomer ? (
                        <span>{msg.senderName || conversation.customerName}</span>
                      ) : isBot ? (
                        <span className="text-emerald-300 flex items-center gap-1 font-bold">
                          <Sparkles className="w-3 h-3 text-emerald-400" /> {msg.senderName || 'BanglaBot AI Sales Closer'}
                        </span>
                      ) : (
                        <span>Business Owner / Agent</span>
                      )}
                    </div>

                    <p>{msg.text}</p>

                    {/* Order Invoice Summary Card */}
                    {isReceipt && msg.orderData && (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <span className="font-bold text-white text-xs">
                              Invoice #{msg.orderData.orderNumber || 'BD-2026-AUTO'}
                            </span>
                          </div>
                          {msg.orderData.payment_status === 'Paid' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Paid & Verified
                            </span>
                          ) : msg.orderData.payment_status === 'Pending Verification' || msg.orderData.bkash_trx_id ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> bKash Trx Verification
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              COD / Unpaid
                            </span>
                          )}
                        </div>

                        {/* Customer & Address Details */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-900/50 p-2 rounded-lg">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Customer</span>
                            <span className="font-medium text-white">{msg.orderData.customerName || conversation.customerName}</span>
                            <span className="text-slate-400 block font-mono">{msg.orderData.customerPhone || conversation.customerPhone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Delivery Location</span>
                            <span className="font-medium text-white">
                              {msg.orderData.deliveryAddress?.district || 'Dhaka'}
                            </span>
                            <span className="text-slate-400 text-[10px] block truncate">
                              {msg.orderData.deliveryAddress?.fullAddress || 'Address on file'}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        {msg.orderData.items && msg.orderData.items.length > 0 && (
                          <div className="space-y-1 border-t border-slate-800/80 pt-2 text-[11px]">
                            {msg.orderData.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-slate-300">
                                <span>
                                  {item.name} × {item.quantity}
                                </span>
                                <span className="font-semibold text-white">
                                  ৳{(item.price || 0) * (item.quantity || 1)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Total calculation */}
                        <div className="border-t border-slate-800/80 pt-2 flex justify-between items-center text-xs font-bold text-white">
                          <span>Total Amount</span>
                          <span className="text-emerald-400 font-mono text-sm">
                            ৳{msg.orderData.totalAmount || 1530}
                          </span>
                        </div>

                        {/* bKash Details */}
                        {msg.orderData.bkash_trx_id && (
                          <div className="p-2 rounded-lg bg-pink-950/30 border border-pink-500/30 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-pink-400" />
                              <span className="text-pink-300 font-medium">bKash TrxID:</span>
                              <span className="font-mono font-bold text-white tracking-wider">
                                {msg.orderData.bkash_trx_id}
                              </span>
                            </div>
                            {msg.orderData.payment_status !== 'Paid' && (
                              <button
                                onClick={() => handleMarkPaid(msg.orderData?.id)}
                                disabled={verifyingTrx === msg.orderData.id}
                                className="px-2 py-0.5 rounded bg-pink-600 hover:bg-pink-500 text-white font-bold text-[10px] cursor-pointer transition shadow-sm"
                              >
                                {verifyingTrx === msg.orderData.id ? 'Verifying...' : 'Mark Paid ✓'}
                              </button>
                            )}
                          </div>
                        )}

                        <div className="pt-1 flex items-center justify-between">
                          <Link
                            href="/orders"
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <span>Open in Orders Dashboard</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Render In-Chat Mini Store Carousel if present */}
                    {isMiniStore && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50">
                        <InChatMiniStore
                          products={
                            Array.isArray(msg.productData)
                              ? msg.productData
                              : msg.productData
                              ? [msg.productData]
                              : products
                          }
                          conversation={conversation}
                          onOrderSuccess={() => {
                            if (onRefresh) onRefresh();
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Status */}
                  <div
                    className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                      isCustomer ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!isCustomer && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Simulator Mode Switcher & Quick Replies Bar */}
      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none flex-wrap">
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setSenderMode('agent')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
              senderMode === 'agent' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reply as Store
          </button>
          <button
            onClick={() => setSenderMode('customer')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
              senderMode === 'customer' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Simulate customer messaging to test AI sales responses"
          >
            Simulate Customer
          </button>
        </div>

        {/* Quick Test Chips for Customer Simulator */}
        {senderMode === 'customer' ? (
          <>
            <button
              onClick={() => setInputText('এই পাঞ্জাবির দাম কত ভাইয়া? ডেলিভারি চার্জ কত লাগবে?')}
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] shrink-0 cursor-pointer"
            >
              💬 দাম ও ডেলিভারি জিজ্ঞাসা
            </button>
            <button
              onClick={() =>
                setInputText(
                  'আমি ১টি সাইজ 42 পাঞ্জাবি নিতে চাই। নাম: তানভীর আহমেদ, মোবাইল: 01712345678, ঠিকানা: বাড়ি ১৫, রোড ৪, ধানমন্ডি, ঢাকা।'
                )
              }
              className="px-2 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-[11px] shrink-0 cursor-pointer"
            >
              🛍️ সম্পূর্ণ অর্ডার পাঠানো
            </button>
            <button
              onClick={() =>
                setInputText('ভাইয়া আমি bKash থেকে ১৩০ টাকা পাঠাইছি ডেলিভারি চার্জের জন্য। TrxID: BL88A92K')
              }
              className="px-2 py-1 rounded-md bg-pink-950/60 hover:bg-pink-900/80 text-pink-300 border border-pink-500/30 text-[11px] shrink-0 cursor-pointer"
            >
              💳 বিকাশ TrxID পাঠানো
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsQuickRepliesOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold shrink-0 cursor-pointer"
            >
              <Zap className="w-3 h-3" />
              <span>Templates</span>
            </button>
            <button
              onClick={handleGenerateAiSuggestion}
              disabled={isAiGenerating}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{isAiGenerating ? 'Thinking...' : 'AI Suggestion'}</span>
            </button>
          </>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-end gap-3">
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            senderMode === 'customer'
              ? 'Simulate customer message (e.g., "Ei product tar dam koto?" or send phone & address)...'
              : conversation.botActive
              ? 'Type a message (AI is active, sending manual message will reply directly to customer)...'
              : 'Type your manual reply to the customer...'
          }
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isSending}
          className={`h-11 px-4.5 rounded-xl text-white flex items-center justify-center transition cursor-pointer font-semibold text-xs gap-1.5 shadow-md ${
            senderMode === 'customer'
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-indigo-600 hover:bg-indigo-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{senderMode === 'customer' ? 'Send as Customer' : 'Send'}</span>
        </button>
      </div>

      {isQuickRepliesOpen && (
        <QuickRepliesModal
          isOpen={isQuickRepliesOpen}
          onSelectTemplate={(text: string) => {
            setInputText(text);
            setIsQuickRepliesOpen(false);
          }}
          onClose={() => setIsQuickRepliesOpen(false)}
        />
      )}
    </div>
  );
}
