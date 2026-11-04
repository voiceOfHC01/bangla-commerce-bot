'use client';

import React from 'react';
import { X, Sparkles, Send, Zap } from 'lucide-react';

interface QuickRepliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (text: string) => void;
}

export function QuickRepliesModal({ isOpen, onClose, onSelectTemplate }: QuickRepliesModalProps) {
  if (!isOpen) return null;

  const templates = [
    {
      category: '📦 ডেলিভারি ও চার্জ',
      items: [
        {
          title: 'ঢাকার ভেতরে ও বাইরে ডেলিভারি চার্জ',
          text: 'আমাদের ডেলিভারি চার্জ:\n📍 ঢাকার ভেতরে: ৮০ টাকা (২৪-৪৮ ঘণ্টায় হোম ডেলিভারি)\n📍 ঢাকার বাইরে: ১৫০ টাকা (২-৩ দিনে হোম ডেলিভারি)\n\nক্যাশ অন ডেলিভারি সুবিধা রয়েছে! 🚚',
        },
        {
          title: 'ডেলিভারি ট্র্যাকিং আপডেট',
          text: 'প্রিয় কাস্টমার, আপনার পার্সেলটি কুরিয়ারে বুকিং করা হয়েছে। খুব শীঘ্রই কুরিয়ার ডেলিভারি রাইডার আপনার সাথে ফোনে যোগাযোগ করবে। 📦',
        },
      ],
    },
    {
      category: '💰 মূল্য ও অফার',
      items: [
        {
          title: 'স্পেশাল ডিসকাউন্ট প্রাইজ',
          text: 'আসসালামু আলাইকুম! আমাদের এই কালেকশনে বর্তমানে বিশেষ অফার চলছে। অফার মূল্য মাত্র ১২৫০ টাকা! স্টক সীমিত, এখনই অর্ডার কনফার্ম করুন। ✨',
        },
        {
          title: 'কম্বো অফার বিস্তারিত',
          text: 'যেকোনো ২টি প্রোডাক্ট একসাথে অর্ডার করলেই পাচ্ছেন ডেলিভারি চার্জ সম্পূর্ণ ফ্রি! আপনি কি কম্বো অফারে অর্ডার করতে চান? 🎉',
        },
      ],
    },
    {
      category: '🛍️ অর্ডার কনফার্মেশন',
      items: [
        {
          title: 'অর্ডারের তথ্য চাওয়া (নাম, ফোন, ঠিকানা)',
          text: 'অর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার:\n১. নাম\n২. ১১ ডিজিটের মোবাইল নম্বর\n৩. সম্পূর্ণ ডেলিভারি ঠিকানা (জেলা ও থানা সহ) প্রদান করুন।\n\nআমরা দ্রুত হোম ডেলিভারি পাঠিয়ে দেব! 🛍️',
        },
        {
          title: 'অর্ডার সফল কনফার্মেশন মেসেজ',
          text: 'ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে। আমাদের টিম খুব দ্রুত কল করে প্যাকেজটি পাঠিয়ে দেবে। সাথে থাকার জন্য ধন্যবাদ! 🌸',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Quick Reply Templates</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {templates.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {cat.category}
              </h4>
              <div className="space-y-2">
                {cat.items.map((it, itemIdx) => (
                  <div
                    key={itemIdx}
                    onClick={() => {
                      onSelectTemplate(it.text);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition">
                        {it.title}
                      </p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-indigo-300">
                        Use template <Send className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {it.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
