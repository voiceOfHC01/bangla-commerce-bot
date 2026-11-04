'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WebhookSimulatorModal } from '@/components/layout/WebhookSimulatorModal';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Video,
  Hash,
  Layers,
  Flame,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { GeneratedCaptionResponse } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AiWriterPage() {
  const router = useRouter();
  const [productName, setProductName] = useState('Executive Cotton Semi-fitted Panjabi');
  const [keyFeatures, setKeyFeatures] = useState(
    '100% pure breathable cotton, stylish embroidery collar, 20% Eid discount, Cash on Delivery nationwide'
  );
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok'>('facebook');
  const [language, setLanguage] = useState<'bengali' | 'english' | 'banglish'>('bengali');
  const [tone, setTone] = useState<'urgent_promotional' | 'casual_friendly' | 'storytelling_luxury'>('urgent_promotional');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedCaptionResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const presets = [
    {
      name: 'Executive Panjabi (ঈদের কালেকশন)',
      features: '১০০% পিওর সুতি কাপড়, প্রিমিয়াম এমব্রয়ডারি কলার, ২০% ঈদ ডিসকাউন্ট, ফ্রি ডেলিভারি',
      platform: 'facebook' as const,
      lang: 'bengali' as const,
      tone: 'urgent_promotional' as const,
    },
    {
      name: 'Original Dhakai Jamdani Handloom Sharee',
      features: '84 count fine cotton, royal gold zari border, handwoven by Narayanganj artisans, luxury packaging',
      platform: 'instagram' as const,
      lang: 'english' as const,
      tone: 'storytelling_luxury' as const,
    },
    {
      name: 'TWS Wireless Earbuds Pro (Active Noise Cancelling)',
      features: '30 hours playtime, deep bass, water resistant, 6 months warranty, COD available',
      platform: 'tiktok' as const,
      lang: 'banglish' as const,
      tone: 'casual_friendly' as const,
    },
    {
      name: 'Sundarban Pure Organic Floral Honey',
      features: '১০০% প্রাকৃতিক সুন্দরবনের চাকের খাঁটি মধু, কোনো প্রিজারভেটিভ নেই, ল্যাব টেস্টেড গ্যারান্টি',
      platform: 'facebook' as const,
      lang: 'bengali' as const,
      tone: 'urgent_promotional' as const,
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setProductName(p.name);
    setKeyFeatures(p.features);
    setPlatform(p.platform);
    setLanguage(p.lang);
    setTone(p.tone);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          keyFeatures,
          platform,
          language,
          tone,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendToScheduler = (captionText: string, hashtags: string[]) => {
    const fullPost = `${captionText}\n\n${hashtags.join(' ')}`;
    // Store in sessionStorage or query param
    sessionStorage.setItem('prefill_caption', fullPost);
    router.push('/scheduler?fromAiWriter=true');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar onOpenSimulator={() => setIsSimulatorOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="AI Caption, Title & Hashtag Generator"
          description="Generate high-converting e-commerce copy, reel hooks, and hashtags in Bengali, English & Banglish"
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Presets Row */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Quick Product Presets:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
                    >
                      {p.name.split(' ')[0]} {p.name.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generator Form Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Executive Cotton Panjabi"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Key Features, Pricing & Special Offer *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={keyFeatures}
                      onChange={(e) => setKeyFeatures(e.target.value)}
                      placeholder="e.g. 100% pure cotton, 15% discount, free delivery inside Dhaka"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Target Platform */}
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Target Social Platform
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['facebook', 'instagram', 'tiktok'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatform(p)}
                          className={`py-2 px-3 rounded-xl capitalize font-semibold border transition cursor-pointer ${
                            platform === p
                              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Output Language
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'bengali', label: 'বাংলা (Bengali)' },
                        { id: 'english', label: 'English' },
                        { id: 'banglish', label: 'বাংলিশ (Banglish)' },
                      ].map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setLanguage(l.id as any)}
                          className={`py-2 px-1 text-[11px] rounded-xl font-semibold border transition text-center cursor-pointer ${
                            language === l.id
                              ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Copywriting Tone
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'urgent_promotional', label: '🔥 Urgent & Promo' },
                        { id: 'casual_friendly', label: '😊 Casual & Friendly' },
                        { id: 'storytelling_luxury', label: '💎 Luxury & Story' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTone(t.id as any)}
                          className={`py-2 px-1 text-[11px] rounded-xl font-semibold border transition text-center cursor-pointer ${
                            tone === t.id
                              ? 'bg-pink-600/30 text-pink-300 border-pink-500'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating High-Converting Copy...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Social Media Package ✨</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Generated Results Column (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {!results && !loading && (
                <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-300">Ready to Generate</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Fill out the product information on the left or click one of the quick presets, then tap Generate.
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
                  <p className="text-sm font-semibold text-slate-300">
                    Crafting 3 conversion-focused angles, reel hooks, and targeted hashtags...
                  </p>
                </div>
              )}

              {results && (
                <div className="space-y-6">
                  {/* Captions List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>3 High-Converting Captions & CTAs</span>
                    </h3>

                    {results.captions.map((cap) => {
                      const allHashtags = [
                        ...results.hashtags.broad,
                        ...results.hashtags.niche,
                        ...results.hashtags.trending,
                      ];
                      return (
                        <div
                          key={cap.id}
                          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                              {cap.title}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyToClipboard(cap.content, `cap-${cap.id}`)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition cursor-pointer"
                              >
                                {copiedId === `cap-${cap.id}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleSendToScheduler(cap.content, allHashtags)}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[11px] font-semibold text-white shadow-sm transition cursor-pointer"
                              >
                                <span>Schedule</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {cap.content}
                          </p>

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                            <span className="font-bold text-pink-400 text-[11px]">CTA: </span>
                            <span className="text-slate-300 text-[11px]">{cap.callToAction}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reel & Video Titles */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-pink-400" />
                      <span>Reel & Short Video Hooks / Titles</span>
                    </h3>
                    <div className="space-y-2">
                      {results.reelTitles.map((title, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="font-medium text-slate-200">{title}</span>
                          <button
                            onClick={() => copyToClipboard(title, `title-${idx}`)}
                            className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                            title="Copy title"
                          >
                            {copiedId === `title-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categorized Hashtags */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Hash className="w-4 h-4 text-emerald-400" />
                        <span>Categorized High-Performing Hashtags</span>
                      </h3>
                      <button
                        onClick={() => {
                          const all = [
                            ...results.hashtags.broad,
                            ...results.hashtags.niche,
                            ...results.hashtags.trending,
                          ].join(' ');
                          copyToClipboard(all, 'all-tags');
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        {copiedId === 'all-tags' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">All Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy All Hashtags</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Broad */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          🌐 Broad Reach
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {results.hashtags.broad.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Niche */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          🎯 Niche & Local BD
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {results.hashtags.niche.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-800 text-pink-300 text-[11px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Trending */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          🔥 Trending Now
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {results.hashtags.trending.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 text-[11px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}
