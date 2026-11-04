'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WebhookSimulatorModal } from '@/components/layout/WebhookSimulatorModal';
import {
  Key,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  Save,
  Radio,
  Globe,
  Smartphone,
  Sparkles,
  RefreshCw,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Zap,
} from 'lucide-react';

interface PingResult {
  status: 'connected' | 'error' | 'testing';
  message: string;
  latencyMs?: number;
}

export default function IntegrationsSettingsPage() {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states - Meta (Facebook & Instagram)
  const [metaAppId, setMetaAppId] = useState('109283746592019');
  const [metaAppSecret, setMetaAppSecret] = useState('9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d');
  const [metaPageId, setMetaPageId] = useState('page_bangla_commerce_01');
  const [metaPageAccessToken, setMetaPageAccessToken] = useState('EAAO...system_never_expiring_token_bd');
  const [metaVerifyToken, setMetaVerifyToken] = useState('socialbazaar_meta_verify_token_2026');
  const [instagramAccountId, setInstagramAccountId] = useState('ig_bangla_biz_official');

  // Form states - WhatsApp Cloud API
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('109876543210987');
  const [whatsappBusinessAccountId, setWhatsappBusinessAccountId] = useState('waba_998877665544');
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('EAAN...wa_permanent_token_2026');
  const [whatsappVerifyToken, setWhatsappVerifyToken] = useState('socialbazaar_wa_token_2026');

  // Form states - AI Engine
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');

  // Form states - bKash Payment Gateway & Manual Verification
  const [bkashNumber, setBkashNumber] = useState('01799001122');
  const [bkashAccountType, setBkashAccountType] = useState<'Personal' | 'Agent' | 'Merchant'>('Merchant');
  const [bkashPaymentPolicy, setBkashPaymentPolicy] = useState<'Full COD' | 'Advance Delivery Charge via bKash' | 'Full bKash Pre-payment'>('Advance Delivery Charge via bKash');
  const [bkashAdvanceAmount, setBkashAdvanceAmount] = useState<number>(130);

  // Tunnel URL
  const [tunnelUrl, setTunnelUrl] = useState('https://your-domain.ngrok-free.app');

  // Real-time ping test states
  const [metaPing, setMetaPing] = useState<PingResult | null>(null);
  const [waPing, setWaPing] = useState<PingResult | null>(null);
  const [aiPing, setAiPing] = useState<PingResult | null>(null);
  const [bkashPing, setBkashPing] = useState<PingResult | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          if (d.metaAppId) setMetaAppId(d.metaAppId);
          if (d.metaAppSecret) setMetaAppSecret(d.metaAppSecret);
          if (d.metaPageId) setMetaPageId(d.metaPageId);
          if (d.metaPageAccessToken) setMetaPageAccessToken(d.metaPageAccessToken);
          if (d.metaVerifyToken) setMetaVerifyToken(d.metaVerifyToken);
          if (d.instagramAccountId) setInstagramAccountId(d.instagramAccountId);

          if (d.whatsappPhoneNumberId) setWhatsappPhoneNumberId(d.whatsappPhoneNumberId);
          if (d.whatsappBusinessAccountId) setWhatsappBusinessAccountId(d.whatsappBusinessAccountId);
          if (d.whatsappAccessToken) setWhatsappAccessToken(d.whatsappAccessToken);
          if (d.whatsappVerifyToken) setWhatsappVerifyToken(d.whatsappVerifyToken);

          if (d.geminiApiKey) setGeminiApiKey(d.geminiApiKey);
          if (d.openAiApiKey) setOpenAiApiKey(d.openAiApiKey);

          if (d.bkashNumber) setBkashNumber(d.bkashNumber);
          if (d.bkashAccountType) setBkashAccountType(d.bkashAccountType);
          if (d.bkashPaymentPolicy) setBkashPaymentPolicy(d.bkashPaymentPolicy);
          if (d.bkashAdvanceAmount) setBkashAdvanceAmount(d.bkashAdvanceAmount);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTestConnection = async (platform: 'meta' | 'whatsapp' | 'ai' | 'bkash') => {
    const setter =
      platform === 'meta'
        ? setMetaPing
        : platform === 'whatsapp'
        ? setWaPing
        : platform === 'ai'
        ? setAiPing
        : setBkashPing;

    setter({ status: 'testing', message: 'Pinging platform endpoint...' });

    try {
      const credentials: Record<string, unknown> = {};
      if (platform === 'meta') {
        credentials.metaPageId = metaPageId;
        credentials.metaPageAccessToken = metaPageAccessToken;
        credentials.instagramAccountId = instagramAccountId;
      } else if (platform === 'whatsapp') {
        credentials.whatsappPhoneNumberId = whatsappPhoneNumberId;
        credentials.whatsappBusinessAccountId = whatsappBusinessAccountId;
        credentials.whatsappAccessToken = whatsappAccessToken;
      } else if (platform === 'ai') {
        credentials.geminiApiKey = geminiApiKey;
        credentials.openAiApiKey = openAiApiKey;
      } else if (platform === 'bkash') {
        credentials.bkashNumber = bkashNumber;
        credentials.bkashAccountType = bkashAccountType;
        credentials.bkashPaymentPolicy = bkashPaymentPolicy;
      }

      const res = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, credentials }),
      });
      const data = await res.json();

      if (data.success) {
        setter({
          status: 'connected',
          message: data.message || 'Connected successfully!',
          latencyMs: data.latencyMs,
        });
      } else {
        setter({
          status: 'error',
          message: data.message || 'Connection failed. Please check credentials.',
        });
      }
    } catch {
      setter({
        status: 'error',
        message: 'Network error while attempting connection test.',
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaAppId,
          metaAppSecret,
          metaPageId,
          metaPageAccessToken,
          metaVerifyToken,
          instagramAccountId,
          whatsappPhoneNumberId,
          whatsappBusinessAccountId,
          whatsappAccessToken,
          whatsappVerifyToken,
          geminiApiKey,
          openAiApiKey,
          bkashNumber,
          bkashAccountType,
          bkashPaymentPolicy,
          bkashAdvanceAmount,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar onOpenSimulator={() => setIsSimulatorOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="Account Integration & Plugin Settings"
          description="Connect Facebook, Instagram, WhatsApp Cloud API, AI Engine & bKash Gateway"
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Public Tunneling & Webhook Callback Setup Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Webhook Callback Generator & Tunneling (24/7 Live Social Listening)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Enter your public domain or tunnel URL (e.g. <code className="text-indigo-300 font-mono">ngrok</code>, <code className="text-indigo-300 font-mono">localtunnel</code>, or production domain) to generate instant verified webhook callback URLs for Meta and WhatsApp.
                </p>

                <div className="mt-3 flex flex-col sm:flex-row items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium shrink-0">Your Public Host / Tunnel URL:</span>
                  <input
                    type="text"
                    value={tunnelUrl}
                    onChange={(e) => setTunnelUrl(e.target.value)}
                    placeholder="https://your-domain.ngrok-free.app"
                    className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Facebook & Instagram Plugin */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Facebook & Instagram Plugin</h3>
                    <p className="text-[11px] text-slate-400">Meta Graph API v21.0 Webhooks & Page Automation</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('meta')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold cursor-pointer transition shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${metaPing?.status === 'testing' ? 'animate-spin' : ''}`} />
                    <span>Test Meta Connection</span>
                  </button>
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1"
                  >
                    <span>Developer Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Status Ping Feedback */}
              {metaPing && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    metaPing.status === 'connected'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : metaPing.status === 'testing'
                      ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {metaPing.status === 'connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>{metaPing.message}</span>
                  </div>
                  {metaPing.latencyMs && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40">
                      Ping: {metaPing.latencyMs}ms
                    </span>
                  )}
                </div>
              )}

              {/* Generated Callback URL & Verify Token */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400">Callback URL Generator (/api/webhooks/meta):</p>
                  <div className="flex items-center justify-between gap-2 font-mono text-indigo-300 text-[11px]">
                    <span className="truncate">{tunnelUrl}/api/webhooks/meta</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${tunnelUrl}/api/webhooks/meta`, 'meta-url')}
                      className="p-1 hover:text-white cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedField === 'meta-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400">Webhook Verify Token:</p>
                  <div className="flex items-center justify-between gap-2 font-mono text-emerald-400 text-[11px]">
                    <span className="truncate">{metaVerifyToken}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(metaVerifyToken, 'meta-tok')}
                      className="p-1 hover:text-white cursor-pointer"
                      title="Copy Token"
                    >
                      {copiedField === 'meta-tok' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Meta Credentials Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Meta App ID</label>
                  <input
                    type="text"
                    value={metaAppId}
                    onChange={(e) => setMetaAppId(e.target.value)}
                    placeholder="e.g. 109283746592019"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Meta App Secret</label>
                  <input
                    type="password"
                    value={metaAppSecret}
                    onChange={(e) => setMetaAppSecret(e.target.value)}
                    placeholder="App secret key"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Facebook Page ID</label>
                  <input
                    type="text"
                    value={metaPageId}
                    onChange={(e) => setMetaPageId(e.target.value)}
                    placeholder="e.g. page_bangla_01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Instagram Business Account ID</label>
                  <input
                    type="text"
                    value={instagramAccountId}
                    onChange={(e) => setInstagramAccountId(e.target.value)}
                    placeholder="e.g. 1784140029384"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="font-semibold text-slate-300 block mb-1">
                    Page Access Token (Never-expiring system user token)
                  </label>
                  <input
                    type="password"
                    value={metaPageAccessToken}
                    onChange={(e) => setMetaPageAccessToken(e.target.value)}
                    placeholder="EAAO..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. WhatsApp Cloud API Plugin */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                  <div>
                    <h3 className="text-sm font-bold text-white">WhatsApp Cloud API Plugin</h3>
                    <p className="text-[11px] text-slate-400">Meta WABA Official Cloud API Integration</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('whatsapp')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold cursor-pointer transition shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${waPing?.status === 'testing' ? 'animate-spin' : ''}`} />
                    <span>Test WhatsApp Ping</span>
                  </button>
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                    Official Free Tier: 1,000 Chats/Mo
                  </span>
                </div>
              </div>

              {/* Status Ping Feedback */}
              {waPing && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    waPing.status === 'connected'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : waPing.status === 'testing'
                      ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {waPing.status === 'connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>{waPing.message}</span>
                  </div>
                  {waPing.latencyMs && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40">
                      Ping: {waPing.latencyMs}ms
                    </span>
                  )}
                </div>
              )}

              {/* WhatsApp Callback URL & Verify Token */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400">Callback URL Generator (/api/webhooks/whatsapp):</p>
                  <div className="flex items-center justify-between gap-2 font-mono text-emerald-300 text-[11px]">
                    <span className="truncate">{tunnelUrl}/api/webhooks/whatsapp</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${tunnelUrl}/api/webhooks/whatsapp`, 'wa-url')}
                      className="p-1 hover:text-white cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedField === 'wa-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400">Webhook Verify Token:</p>
                  <div className="flex items-center justify-between gap-2 font-mono text-emerald-400 text-[11px]">
                    <span className="truncate">{whatsappVerifyToken}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(whatsappVerifyToken, 'wa-tok')}
                      className="p-1 hover:text-white cursor-pointer"
                      title="Copy Token"
                    >
                      {copiedField === 'wa-tok' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp Credentials Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">WhatsApp Phone Number ID</label>
                  <input
                    type="text"
                    value={whatsappPhoneNumberId}
                    onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                    placeholder="e.g. 109876543210987"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">WhatsApp Business Account ID (WABA)</label>
                  <input
                    type="text"
                    value={whatsappBusinessAccountId}
                    onChange={(e) => setWhatsappBusinessAccountId(e.target.value)}
                    placeholder="e.g. waba_998877665544"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Permanent System Access Token</label>
                  <input
                    type="password"
                    value={whatsappAccessToken}
                    onChange={(e) => setWhatsappAccessToken(e.target.value)}
                    placeholder="EAAN..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. AI Engine Credentials */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Deal-Closing Engine Credentials</h3>
                    <p className="text-[11px] text-slate-400">Google Gemini 1.5 Flash / Pro or OpenAI GPT-4o</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTestConnection('ai')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold cursor-pointer transition shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${aiPing?.status === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Test AI Engine</span>
                </button>
              </div>

              {/* Status Ping Feedback */}
              {aiPing && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    aiPing.status === 'connected'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : aiPing.status === 'testing'
                      ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {aiPing.status === 'connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>{aiPing.message}</span>
                  </div>
                  {aiPing.latencyMs && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40">
                      Response: {aiPing.latencyMs}ms
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-300">Google Gemini API Key (Recommended)</label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <span>Get Free Gemini Key</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Powering natural Bengali/Banglish deals, intent tracking & instant negotiation replies.
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">OpenAI API Key (Optional)</label>
                  <input
                    type="password"
                    value={openAiApiKey}
                    onChange={(e) => setOpenAiApiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Alternate model fallback for high concurrency environments.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. bKash Payment Gateway & Manual Verification Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-pink-950/20 to-slate-900 border border-pink-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-pink-600/30">
                    ৳
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>bKash Account & Payment Verification Settings</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40">
                        BD Standard
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Configure owner's bKash wallet, account tier & automated payment policy</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTestConnection('bkash')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 text-xs font-semibold cursor-pointer transition shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${bkashPing?.status === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Verify bKash Setup</span>
                </button>
              </div>

              {/* Status Ping Feedback */}
              {bkashPing && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    bkashPing.status === 'connected'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : bkashPing.status === 'testing'
                      ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {bkashPing.status === 'connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>{bkashPing.message}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* bKash Phone Number */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">bKash Number (Owner Wallet)</label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-pink-500 text-sm font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This number will be sent to customers for payments.</p>
                </div>

                {/* Account Type */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Account Type</label>
                  <select
                    value={bkashAccountType}
                    onChange={(e) => setBkashAccountType(e.target.value as 'Personal' | 'Agent' | 'Merchant')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-pink-500 font-medium"
                  >
                    <option value="Personal">Personal (Send Money)</option>
                    <option value="Agent">Agent (Cash In)</option>
                    <option value="Merchant">Merchant (Make Payment)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Sets whether customer should Send Money or Make Payment.</p>
                </div>

                {/* Advance Amount */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Advance Delivery Charge (BDT)</label>
                  <input
                    type="number"
                    value={bkashAdvanceAmount}
                    onChange={(e) => setBkashAdvanceAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Commonly ৳130 (outside Dhaka courier booking advance).</p>
                </div>
              </div>

              {/* Payment Policy Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="font-semibold text-slate-300 text-xs block">Default Store Payment Policy</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'Full COD',
                      title: 'Full Cash on Delivery (COD)',
                      desc: 'Customer pays entire amount to the courier rider upon delivery. No advance needed.',
                    },
                    {
                      id: 'Advance Delivery Charge via bKash',
                      title: 'Advance Delivery Charge via bKash (e.g. ৳130)',
                      desc: 'AI politely requests delivery charge via bKash to lock genuine orders and prevent courier return loss.',
                    },
                    {
                      id: 'Full bKash Pre-payment',
                      title: 'Full bKash Pre-payment',
                      desc: 'Orders are confirmed only after 100% full invoice amount is paid via bKash with TrxID.',
                    },
                  ].map((policy) => {
                    const isSelected = bkashPaymentPolicy === policy.id;
                    return (
                      <div
                        key={policy.id}
                        onClick={() => setBkashPaymentPolicy(policy.id as typeof bkashPaymentPolicy)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between ${
                          isSelected
                            ? 'bg-pink-950/40 border-pink-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <input
                            type="radio"
                            name="payment_policy"
                            checked={isSelected}
                            onChange={() => {}}
                            className="text-pink-600 focus:ring-0"
                          />
                          <span className="font-bold text-xs text-white">{policy.title}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-80">{policy.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {savedSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-pulse">
                  <Check className="w-4 h-4" /> Credentials and Settings saved successfully!
                </span>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        </main>
      </div>

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}
