'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WebhookSimulatorModal } from '@/components/layout/WebhookSimulatorModal';
import {
  MessageSquare,
  Sparkles,
  Plus,
  Trash2,
  Send,
  Zap,
  CheckCircle2,
  Radio,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { CommentAutomationRule, CommentLog } from '@/lib/types';
import Link from 'next/link';

export default function CommentAutomationPage() {
  const [rules, setRules] = useState<CommentAutomationRule[]>([]);
  const [logs, setLogs] = useState<CommentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Simulation form states
  const [simPlatform, setSimPlatform] = useState<'facebook' | 'instagram'>('facebook');
  const [simName, setSimName] = useState('Nadim Mahmud');
  const [simComment, setSimComment] = useState('পাঞ্জাবির দাম কত ভাইয়া? সাইজ ৪২ কি আছে?');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/comments/rules');
      const json = await res.json();
      if (json.success) setRules(json.data);

      const logsRes = await fetch('/api/comments/rules'); // or get logs
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimResult(null);

    try {
      const res = await fetch('/api/comments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: simPlatform,
          commenterName: simName,
          commentText: simComment,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSimResult(json.data);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleToggleRule = async (rule: CommentAutomationRule) => {
    try {
      await fetch('/api/comments/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, active: !rule.active }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar onOpenSimulator={() => setIsSimulatorOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="Comment-to-DM Automation (JaduBot Suite)"
          description="Auto-reply to public post comments & instantly dispatch private DMs with In-Chat Store catalog"
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>JaduBot 24/7 Comment-to-Inbox Converter</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-xs text-slate-400">
                  Turns post engagements into direct sales conversations with In-Chat Mini Store ordering.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
                100% Meta Graph API Compliant
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Active Comment Rules (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Active Comment Automation Campaigns ({rules.length})</span>
                </h3>
              </div>

              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={rule.postThumbnail}
                          alt="Thumbnail"
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                rule.platform === 'facebook'
                                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                                  : 'bg-pink-900/60 text-pink-300 border border-pink-700/50'
                              }`}
                            >
                              {rule.platform}
                            </span>
                            <h4 className="text-xs font-bold text-white">{rule.campaignName}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{rule.postTitle}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleRule(rule)}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                          rule.active ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                            rule.active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Keywords */}
                    <div className="text-xs">
                      <span className="text-[11px] font-semibold text-slate-400">Trigger Keywords: </span>
                      <div className="inline-flex flex-wrap gap-1 ml-1">
                        {rule.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-300 font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Templates Snippet */}
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <p className="text-[10px] font-bold text-indigo-400 mb-0.5">💬 Public Auto-Comment Reply:</p>
                        <p className="text-[11px] text-slate-300">{rule.publicReplyTemplate}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <p className="text-[10px] font-bold text-pink-400 mb-0.5 flex items-center justify-between">
                          <span>📩 Private Auto-DM (Includes In-Chat Mini Store):</span>
                          {rule.includeMiniStore && (
                            <span className="text-emerald-400 font-semibold text-[10px]">
                              🛍️ Mini Store Active
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-300">{rule.privateDmMessage}</p>
                      </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>Comments Handled: <strong className="text-white">{rule.totalCommentsHandled}</strong></span>
                      <span>DMs Delivered: <strong className="text-emerald-400">{rule.totalDmsSent}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Comment Simulator Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Simulate Post Comment (Live Test)</span>
              </h3>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <form onSubmit={handleSimulateComment} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Platform</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSimPlatform('facebook')}
                        className={`p-2 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          simPlatform === 'facebook'
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        Facebook Page Post
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimPlatform('instagram')}
                        className={`p-2 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          simPlatform === 'instagram'
                            ? 'bg-pink-600/30 text-pink-300 border-pink-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        Instagram Reel / Post
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Commenter Name</label>
                    <input
                      type="text"
                      required
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      placeholder="e.g. Nadim Mahmud"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      Customer Comment on Post (Bangla or English)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={simComment}
                      onChange={(e) => setSimComment(e.target.value)}
                      placeholder="e.g. দাম কত ভাইয়া? ডেলিভারি চার্জ কত?"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={simLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{simLoading ? 'Triggering Automation...' : 'Trigger Comment-to-DM ⚡'}</span>
                  </button>
                </form>

                {/* Simulation Output Card */}
                {simResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-in fade-in text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Automation Executed Successfully!</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <p className="text-[10px] font-bold text-indigo-400 mb-0.5">💬 Public Reply Posted:</p>
                        <p className="text-slate-200">{simResult.publicReply}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <p className="text-[10px] font-bold text-pink-400 mb-0.5">📩 Private DM Dispatched with Mini Store:</p>
                        <p className="text-slate-200">{simResult.privateDm}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">Open conversation in Inbox:</span>
                      <Link
                        href="/inbox"
                        className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                      >
                        <span>Open Inbox</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
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
