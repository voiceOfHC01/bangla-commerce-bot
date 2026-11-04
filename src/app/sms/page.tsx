'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WebhookSimulatorModal } from '@/components/layout/WebhookSimulatorModal';
import {
  Smartphone,
  Send,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { SmsLog, SmsGatewayConfig } from '@/lib/types';

export default function SmsGatewayPage() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [config, setConfig] = useState<SmsGatewayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Form states
  const [phone, setPhone] = useState('01712345678');
  const [customerName, setCustomerName] = useState('Kamrul Hasan');
  const [customText, setCustomText] = useState(
    'প্রিয় Kamrul Hasan, SocialBazaar-এ আপনার অর্ডার #BD-2026-9921 কনফার্ম হয়েছে। মোট: ৳১৫৩০ (ক্যাশ অন ডেলিভারি)। ট্র্যাকিং: https://socialbazaar.bd/track/9921'
  );
  const [sending, setSending] = useState(false);
  const [selectedPreviewText, setSelectedPreviewText] = useState('');

  const fetchSmsData = async () => {
    try {
      const res = await fetch('/api/sms/logs');
      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs);
        setConfig(json.data.config);
        if (json.data.logs.length > 0 && !selectedPreviewText) {
          setSelectedPreviewText(json.data.logs[0].messageText);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmsData();
  }, []);

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !customText) return;

    setSending(true);
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          customerName,
          customText,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedPreviewText(customText);
        await fetchSmsData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar onOpenSimulator={() => setIsSimulatorOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="Bangladeshi SMS Gateway & Notification Engine"
          description="Greenweb BD, SSL Wireless & MIM SMS automated order confirmations & delivery tracking alerts"
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Gateway Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Gateway Provider</p>
                <h3 className="text-lg font-bold text-white mt-1 tracking-tight">
                  {config?.gateway || 'Greenweb BD'}
                </h3>
                <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> API Active & Connected
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Masking Sender ID</p>
                <h3 className="text-lg font-mono font-bold text-indigo-400 mt-1 tracking-tight">
                  {config?.senderId || 'SocialBazaar'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">BTRC Approved Masking</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Gateway Balance</p>
                <h3 className="text-xl font-black text-emerald-400 mt-1 tracking-tight">
                  ৳{config?.balanceBDT?.toFixed(2) || '485.50'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Rate: ৳0.35 / SMS</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Total SMS Dispatched</p>
                <h3 className="text-xl font-black text-white mt-1 tracking-tight">
                  {logs.length}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">100% Delivery Rate</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Dispatch Form + Phone Screen Mockup (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-teal-400" />
                <span>Instant SMS Dispatch Test</span>
              </h3>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <form onSubmit={handleSendSms} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Recipient Phone Number (BD)</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      SMS Content (Supports Bangla Unicode & English)
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={customText}
                      onChange={(e) => {
                        setCustomText(e.target.value);
                        setSelectedPreviewText(e.target.value);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-teal-500 resize-none"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>Characters: {customText.length}</span>
                      <span>Cost: ~৳0.35</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{sending ? 'Dispatching via Gateway...' : 'Send Live SMS 📲'}</span>
                  </button>
                </form>
              </div>

              {/* Phone Mockup Screen */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>Customer Phone Screen Mockup</span>
                </p>

                {/* Smartphone Mockup */}
                <div className="mx-auto max-w-[280px] rounded-3xl bg-slate-950 border-4 border-slate-800 p-3 shadow-2xl space-y-3">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 pt-1">
                    <span>1:55 PM</span>
                    <span className="font-bold">Grameenphone 4G</span>
                  </div>

                  {/* SMS Header */}
                  <div className="text-center pb-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">SocialBazaar</p>
                    <p className="text-[10px] text-emerald-400 font-medium">Official Masked SMS</p>
                  </div>

                  {/* SMS Message Bubble */}
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                    <p>{selectedPreviewText || customText}</p>
                    <p className="text-[9px] text-slate-400 text-right">Just now • Delivered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: SMS Logs History Table (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>SMS Delivery History & Logs ({logs.length})</span>
                </h3>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-semibold uppercase">
                        <th className="py-3 px-3.5">Recipient</th>
                        <th className="py-3 px-3.5">Message Content</th>
                        <th className="py-3 px-3.5">Status</th>
                        <th className="py-3 px-3.5">Cost</th>
                        <th className="py-3 px-3.5">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {logs.map((log) => (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedPreviewText(log.messageText)}
                          className="hover:bg-slate-800/40 transition cursor-pointer"
                        >
                          <td className="py-3 px-3.5 font-mono">
                            <p className="font-bold text-slate-100">{log.recipientName}</p>
                            <p className="text-[11px] text-emerald-400">{log.recipientPhone}</p>
                          </td>

                          <td className="py-3 px-3.5 max-w-xs">
                            <p className="text-[11px] text-slate-300 line-clamp-2">
                              {log.messageText}
                            </p>
                          </td>

                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> {log.status}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 font-mono text-slate-400 text-[11px]">
                            ৳{log.costBDT.toFixed(2)}
                          </td>

                          <td className="py-3 px-3.5 text-slate-400 text-[10px] shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onEventSimulated={fetchSmsData}
      />
    </div>
  );
}
