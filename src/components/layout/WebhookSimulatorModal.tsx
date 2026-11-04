'use client';

import React, { useState } from 'react';
import { X, Radio, Send, CheckCircle2, Sparkles, MessageSquare, MessageCircleReply } from 'lucide-react';
import { Platform } from '@/lib/types';

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventSimulated?: () => void;
}

export function WebhookSimulatorModal({
  isOpen,
  onClose,
  onEventSimulated,
}: WebhookSimulatorModalProps) {
  const [eventType, setEventType] = useState<'message' | 'comment'>('message');
  const [platform, setPlatform] = useState<Platform>('facebook');
  const [customerName, setCustomerName] = useState('Tanvir Ahmed');
  const [customerPhone, setCustomerPhone] = useState('01712345678');
  const [messageText, setMessageText] = useState(
    'পাঞ্জাবির দাম কত ভাইয়া? ঢাকার মধ্যে ডেলিভারি চার্জ কত?'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      title: '💬 Facebook Comment-to-DM (Auto-Reply + Store DM)',
      type: 'comment' as const,
      platform: 'facebook' as Platform,
      name: 'Nadim Mahmud',
      phone: '01811223344',
      text: 'পাঞ্জাবির দাম কত ভাইয়া? সাইজ ৪২ কি আছে?',
    },
    {
      title: '📸 Instagram Reel Comment-to-DM (Jamdani Saree)',
      type: 'comment' as const,
      platform: 'instagram' as Platform,
      name: 'Sumaiya Akter',
      phone: '01799887766',
      text: 'Price please? Delivery charge koto Sylhet e?',
    },
    {
      title: '📦 WhatsApp BD Order with 11-digit Phone (Auto-Captured)',
      type: 'message' as const,
      platform: 'whatsapp' as Platform,
      name: 'Mahbubur Rahman',
      phone: '01823456789',
      text: 'আমি পাঞ্জাবি ২টা কনফার্ম করতে চাই। নাম: মাহবুবুর রহমান, ফোন: 01823456789, ঠিকানা: বাড়ি ২৪, রোড ৭, ধানমন্ডি, ঢাকা।',
    },
    {
      title: '💰 Price & Delivery Query (দাম কত?)',
      type: 'message' as const,
      platform: 'facebook' as Platform,
      name: 'Tanvir Ahmed',
      phone: '01712345678',
      text: 'পাঞ্জাবির দাম কত ভাইয়া? ঢাকার বাইরে ডেলিভারি চার্জ কত?',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setEventType(p.type);
    setPlatform(p.platform);
    setCustomerName(p.name);
    setCustomerPhone(p.phone);
    setMessageText(p.text);
    setResult(null);
  };

  const handleSimulate = async () => {
    if (!messageText.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      if (eventType === 'comment') {
        const res = await fetch('/api/comments/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: platform === 'whatsapp' ? 'facebook' : platform,
            commenterName: customerName,
            commentText: messageText,
          }),
        });
        const data = await res.json();
        setResult(data);
      } else {
        const res = await fetch('/api/webhooks/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform,
            customerName,
            customerPhone,
            messageText,
          }),
        });
        const data = await res.json();
        setResult(data);
      }
      if (onEventSimulated) onEventSimulated();
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Social Webhook & Automation Simulator</h3>
              <p className="text-xs text-slate-400">Test Meta, WhatsApp Cloud & Comment-to-DM automations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              ⚡ Quick Test Scenarios (JaduBot & BanglaChatbot Inspired)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition cursor-pointer text-xs"
                >
                  <p className="font-semibold text-slate-200 line-clamp-1">{p.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">
                    [{p.platform.toUpperCase()}] {p.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Form Configuration */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Event Type */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Automation Event Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEventType('message')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    eventType === 'message'
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  📩 Direct Message / Chat Webhook
                </button>
                <button
                  type="button"
                  onClick={() => setEventType('comment')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    eventType === 'comment'
                      ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  💬 Post Comment-to-DM Trigger
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Channel / Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['facebook', 'instagram', 'whatsapp'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition capitalize flex items-center justify-center gap-1.5 cursor-pointer ${
                      platform === p
                        ? p === 'facebook'
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                          : p === 'instagram'
                          ? 'bg-pink-600/30 text-pink-300 border-pink-500'
                          : 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Customer / Commenter Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Phone Number (BD)</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                {eventType === 'comment' ? 'Public Post Comment Text' : 'Message Text (Bengali or English)'}
              </label>
              <textarea
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type text here..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Simulation Output Card */}
          {result && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulated Event Processed & Bot Triggered!</span>
              </div>
              {result.data?.publicReply && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <span className="font-bold text-indigo-400">Public Reply:</span> {result.data.publicReply}
                </div>
              )}
              {result.data?.privateDm && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <span className="font-bold text-pink-400">Private DM:</span> {result.data.privateDm}
                </div>
              )}
              {result.result?.botReplyMessage && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <p className="text-[11px] font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Bot Response:
                  </p>
                  <p className="text-slate-200 whitespace-pre-wrap">{result.result.botReplyMessage.text}</p>
                </div>
              )}
              {result.result?.order && (
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-xs text-emerald-300">
                  <span className="font-bold">✨ Order Auto-Created:</span> #{result.result.order.orderNumber} (Total: ৳{result.result.order.totalAmount})
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            JaduBot Engine Live
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSimulate}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Processing...' : 'Send Event'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
