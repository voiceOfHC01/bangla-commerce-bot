import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { 
  FacebookConnectionStatus, 
  InstagramConnectionStatus, 
  WhatsAppConnectionStatus, 
  WhatsAppTemplate, 
  UsageRates, 
  UsageStats 
} from '../types';
import { 
  Share2, Facebook, Instagram, Phone, CheckCircle2, AlertTriangle, 
  RefreshCw, Power, Key, Link2, Copy, Check, ExternalLink, ShieldCheck, 
  Sparkles, Layers, Send, DollarSign, Clock, HelpCircle, CheckCircle, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConnectChannelsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'facebook' | 'instagram' | 'whatsapp'>('all');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Connection Statuses
  const [fbStatus, setFbStatus] = useState<FacebookConnectionStatus | null>(null);
  const [igStatus, setIgStatus] = useState<InstagramConnectionStatus | null>(null);
  const [waStatus, setWaStatus] = useState<WhatsAppConnectionStatus | null>(null);

  // WhatsApp Templates & Rates
  const [waTemplates, setWaTemplates] = useState<WhatsAppTemplate[]>([]);
  const [waStats, setWaStats] = useState<UsageStats | null>(null);
  const [waRates, setWaRates] = useState<UsageRates | null>(null);

  // Facebook Modal State
  const [isFbModalOpen, setIsFbModalOpen] = useState(false);
  const [fbPageId, setFbPageId] = useState('');
  const [fbPageName, setFbPageName] = useState('');
  const [fbAccessToken, setFbAccessToken] = useState('');
  const [fbAutoSend, setFbAutoSend] = useState(false);
  const [fbSaving, setFbSaving] = useState(false);

  // Instagram Modal State
  const [isIgModalOpen, setIsIgModalOpen] = useState(false);
  const [igUserId, setIgUserId] = useState('');
  const [igUsername, setIgUsername] = useState('');
  const [igAccessToken, setIgAccessToken] = useState('');
  const [igAutoSend, setIgAutoSend] = useState(false);
  const [igSaving, setIgSaving] = useState(false);
  const [discoveringIg, setDiscoveringIg] = useState(false);

  // WhatsApp Modal State
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waPhoneId, setWaPhoneId] = useState('');
  const [waWabaId, setWaWabaId] = useState('');
  const [waDisplayPhone, setWaDisplayPhone] = useState('');
  const [waAccessToken, setWaAccessToken] = useState('');
  const [waIsTestNumber, setWaIsTestNumber] = useState(true);
  const [waAutoSend, setWaAutoSend] = useState(false);
  const [waSaving, setWaSaving] = useState(false);

  // Clipboard Copied State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchAllStatus = async () => {
    try {
      setLoading(true);
      const [fb, ig, wa, tpls, stats, rates] = await Promise.all([
        apiClient.facebook.getStatus(),
        apiClient.instagram.getStatus(),
        apiClient.whatsapp.getStatus(),
        apiClient.whatsapp.getTemplates().catch(() => []),
        apiClient.whatsapp.getUsageStats().catch(() => null),
        apiClient.whatsapp.getRates().catch(() => null),
      ]);
      setFbStatus(fb);
      setIgStatus(ig);
      setWaStatus(wa);
      setWaTemplates(tpls || []);
      setWaStats(stats);
      setWaRates(rates);

      if (fb.is_connected) {
        setFbPageId(fb.page_id || '');
        setFbPageName(fb.page_name || '');
        setFbAutoSend(fb.auto_send);
      }
      if (ig.is_connected) {
        setIgUserId(ig.ig_user_id || '');
        setIgUsername(ig.username || '');
        setIgAutoSend(ig.auto_send);
      }
      if (wa.is_connected) {
        setWaPhoneId(wa.phone_number_id || '');
        setWaWabaId(wa.waba_id || '');
        setWaDisplayPhone(wa.phone_number || '');
        setWaIsTestNumber(wa.is_test_number);
        setWaAutoSend(wa.auto_send);
      }
    } catch (err) {
      console.error('Failed to load channel statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStatus();
  }, []);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Facebook Handlers
  const handleConnectFacebook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbSaving(true);
    try {
      await apiClient.facebook.connect({
        page_id: fbPageId,
        page_name: fbPageName,
        page_access_token: fbAccessToken,
        auto_send: fbAutoSend,
      });
      setIsFbModalOpen(false);
      setFbAccessToken('');
      await fetchAllStatus();
      notify('Facebook Page successfully connected!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to connect Facebook Page.');
    } finally {
      setFbSaving(false);
    }
  };

  const handleDisconnectFacebook = async () => {
    if (!confirm('Are you sure you want to disconnect this Facebook Page?')) return;
    try {
      await apiClient.facebook.disconnect();
      await fetchAllStatus();
      notify('Facebook Page disconnected.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to disconnect.');
    }
  };

  const handleToggleFbAutoSend = async (enabled: boolean) => {
    try {
      await apiClient.facebook.updateSettings({ auto_send: enabled });
      setFbAutoSend(enabled);
      setFbStatus(prev => prev ? { ...prev, auto_send: enabled } : null);
      notify(enabled ? 'Facebook Messenger AI Auto-Pilot enabled!' : 'Facebook switched to Human-Review Draft mode.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update Facebook settings.');
    }
  };

  // Instagram Handlers
  const handleConnectInstagram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIgSaving(true);
    try {
      await apiClient.instagram.connect({
        ig_user_id: igUserId,
        username: igUsername,
        access_token: igAccessToken,
        auto_send: igAutoSend,
      });
      setIsIgModalOpen(false);
      setIgAccessToken('');
      await fetchAllStatus();
      notify('Instagram Professional account successfully connected!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to connect Instagram.');
    } finally {
      setIgSaving(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    if (!confirm('Are you sure you want to disconnect this Instagram account?')) return;
    try {
      await apiClient.instagram.disconnect();
      await fetchAllStatus();
      notify('Instagram account disconnected.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to disconnect.');
    }
  };

  const handleDiscoverInstagram = async () => {
    setDiscoveringIg(true);
    try {
      const res = await apiClient.instagram.discoverFromPage();
      if (res.discovered && res.account) {
        setIgUserId(res.account.id || '');
        setIgUsername(res.account.username || '');
        setIsIgModalOpen(true);
        notify(`Discovered Instagram Account: @${res.account.username}`);
      } else {
        alert(res.message || 'No linked Instagram Professional account found on your connected Facebook Page.');
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to discover linked Instagram account.');
    } finally {
      setDiscoveringIg(false);
    }
  };

  const handleToggleIgAutoSend = async (enabled: boolean) => {
    try {
      await apiClient.instagram.updateSettings({ auto_send: enabled });
      setIgAutoSend(enabled);
      setIgStatus(prev => prev ? { ...prev, auto_send: enabled } : null);
      notify(enabled ? 'Instagram DM AI Auto-Pilot enabled!' : 'Instagram switched to Human-Review Draft mode.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update Instagram settings.');
    }
  };

  // WhatsApp Handlers
  const handleConnectWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaSaving(true);
    try {
      await apiClient.whatsapp.connect({
        phone_number_id: waPhoneId,
        waba_id: waWabaId,
        phone_number: waDisplayPhone,
        access_token: waAccessToken,
        is_test_number: waIsTestNumber,
        auto_send: waAutoSend,
      });
      setIsWaModalOpen(false);
      setWaAccessToken('');
      await fetchAllStatus();
      notify('WhatsApp Cloud API account successfully connected!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to connect WhatsApp.');
    } finally {
      setWaSaving(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp Cloud API?')) return;
    try {
      await apiClient.whatsapp.disconnect();
      await fetchAllStatus();
      notify('WhatsApp disconnected.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to disconnect WhatsApp.');
    }
  };

  const handleToggleWaAutoSend = async (enabled: boolean) => {
    try {
      await apiClient.whatsapp.updateSettings({ auto_send: enabled });
      setWaAutoSend(enabled);
      setWaStatus(prev => prev ? { ...prev, auto_send: enabled } : null);
      notify(enabled ? 'WhatsApp AI Auto-Pilot enabled!' : 'WhatsApp switched to Human-Review Draft mode.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update WhatsApp settings.');
    }
  };

  const callbackUrl = fbStatus?.webhook_callback_url || 'https://your-domain.com/api/webhooks/meta';
  const verifyToken = fbStatus?.verify_token || 'sellerbhai_meta_verify_token_2026';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Connect Channels</h1>
              <p className="text-sm text-slate-500">
                Connect and manage your Facebook Page, Instagram Professional, and WhatsApp Business for AI automation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllStatus}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
          <Link
            to="/test-chat"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Test AI Chat</span>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      {/* Live Channel Status Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Facebook Summary Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          fbStatus?.is_connected ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Facebook className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Facebook Page</h3>
                <p className="text-xs text-slate-500">
                  {fbStatus?.is_connected ? (fbStatus.page_name || `Page ID: ${fbStatus.page_id}`) : 'Not connected'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              fbStatus?.is_connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${fbStatus?.is_connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {fbStatus?.is_connected ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Instagram Summary Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          igStatus?.is_connected ? 'bg-pink-50/50 border-pink-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Instagram DM</h3>
                <p className="text-xs text-slate-500">
                  {igStatus?.is_connected ? (`@${igStatus.username || igStatus.ig_user_id}`) : 'Not connected'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              igStatus?.is_connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${igStatus?.is_connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {igStatus?.is_connected ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>

        {/* WhatsApp Summary Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          waStatus?.is_connected ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">WhatsApp Business</h3>
                <p className="text-xs text-slate-500">
                  {waStatus?.is_connected ? (waStatus.phone_number || `ID: ${waStatus.phone_number_id}`) : 'Not connected'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              waStatus?.is_connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${waStatus?.is_connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {waStatus?.is_connected ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All 3 Channels
        </button>
        <button
          onClick={() => setActiveTab('facebook')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'facebook'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Facebook className="w-3.5 h-3.5" />
          <span>Facebook Page</span>
        </button>
        <button
          onClick={() => setActiveTab('instagram')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'instagram'
              ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
          }`}
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram Professional</span>
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>WhatsApp Cloud API</span>
        </button>
      </div>

      {/* 1. FACEBOOK CARD */}
      {(activeTab === 'all' || activeTab === 'facebook') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                <Facebook className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Facebook Page Integration</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    fbStatus?.is_connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {fbStatus?.is_connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect your official Meta Messenger Business Page for customer DMs and auto replies.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {fbStatus?.is_connected ? (
                <>
                  <button
                    onClick={() => setIsFbModalOpen(true)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Edit Token
                  </button>
                  <button
                    onClick={handleDisconnectFacebook}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors flex items-center gap-1.5"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsFbModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Connect Facebook Page</span>
                </button>
              )}
            </div>
          </div>

          {fbStatus?.is_connected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Page Name</span>
                <p className="text-sm font-bold text-slate-900">{fbStatus.page_name || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Page ID</span>
                <p className="text-sm font-mono font-medium text-slate-900">{fbStatus.page_id}</p>
              </div>
            </div>
          )}

          {/* Facebook Auto-Send Switch */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-200/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Messenger AI Dispatch Mode
              </span>
              <p className="text-xs text-blue-700">
                {fbAutoSend
                  ? 'Full Auto-pilot: AI answers and sends replies to customer DMs immediately 24/7.'
                  : 'Approve Before Send: AI generates high-quality drafts in Unified Inbox for your approval.'}
              </p>
            </div>
            <button
              onClick={() => handleToggleFbAutoSend(!fbAutoSend)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                fbAutoSend ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                fbAutoSend ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* 2. INSTAGRAM CARD */}
      {(activeTab === 'all' || activeTab === 'instagram') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Instagram Professional Integration</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    igStatus?.is_connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {igStatus?.is_connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automate Instagram DMs and comment inquiries for your Business or Creator account.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {fbStatus?.is_connected && !igStatus?.is_connected && (
                <button
                  onClick={handleDiscoverInstagram}
                  disabled={discoveringIg}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${discoveringIg ? 'animate-spin' : ''}`} />
                  <span>Discover from Facebook Page</span>
                </button>
              )}

              {igStatus?.is_connected ? (
                <>
                  <button
                    onClick={() => setIsIgModalOpen(true)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Edit Token
                  </button>
                  <button
                    onClick={handleDisconnectInstagram}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors flex items-center gap-1.5"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsIgModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Connect Instagram</span>
                </button>
              )}
            </div>
          </div>

          {igStatus?.is_connected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Username</span>
                <p className="text-sm font-bold text-slate-900">@{igStatus.username || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">IG User ID</span>
                <p className="text-sm font-mono font-medium text-slate-900">{igStatus.ig_user_id}</p>
              </div>
            </div>
          )}

          {/* Instagram Auto-Send Switch */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/60 to-purple-50/60 border border-pink-200/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                Instagram Direct AI Auto-Pilot
              </span>
              <p className="text-xs text-purple-700">
                {igAutoSend
                  ? 'Full Auto-pilot: Automatically answers Instagram DMs and story mentions.'
                  : 'Approve Before Send: Saves Instagram replies as drafts in Unified Inbox.'}
              </p>
            </div>
            <button
              onClick={() => handleToggleIgAutoSend(!igAutoSend)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                igAutoSend ? 'bg-purple-600' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                igAutoSend ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* 3. WHATSAPP CARD */}
      {(activeTab === 'all' || activeTab === 'whatsapp') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">WhatsApp Cloud API</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    waStatus?.is_connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {waStatus?.is_connected ? 'Connected' : 'Not Connected'}
                  </span>
                  {waStatus?.is_test_number && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Sandbox / Test Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official Meta WhatsApp Cloud API for customer messaging, order alerts, and broadcast marketing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {waStatus?.is_connected ? (
                <>
                  <button
                    onClick={() => setIsWaModalOpen(true)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Edit Token
                  </button>
                  <button
                    onClick={handleDisconnectWhatsApp}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors flex items-center gap-1.5"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsWaModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Connect WhatsApp API</span>
                </button>
              )}
            </div>
          </div>

          {waStatus?.is_connected && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Display Number</span>
                <p className="text-sm font-bold text-slate-900">{waStatus.phone_number || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phone Number ID</span>
                <p className="text-sm font-mono font-medium text-slate-900">{waStatus.phone_number_id}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">WABA ID</span>
                <p className="text-sm font-mono font-medium text-slate-900">{waStatus.waba_id || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* WhatsApp Auto-Send Switch */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/60 border border-emerald-200/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp AI Auto-Pilot
              </span>
              <p className="text-xs text-emerald-700">
                {waAutoSend
                  ? 'Full Auto-pilot: Instantly responds to customer messages on WhatsApp 24/7.'
                  : 'Approve Before Send: AI generates responses as drafts in Unified Inbox.'}
              </p>
            </div>
            <button
              onClick={() => handleToggleWaAutoSend(!waAutoSend)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                waAutoSend ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                waAutoSend ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* Meta Webhook Configuration Box for All 3 Channels */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Meta Developer Portal Webhook Setup</h2>
            <p className="text-xs text-slate-400">
              One unified webhook endpoint receives customer messages for Facebook, Instagram, and WhatsApp.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Callback URL */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Callback URL</span>
              <button
                onClick={() => copyToClipboard(callbackUrl, 'url')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'url' ? 'Copied!' : 'Copy URL'}</span>
              </button>
            </div>
            <p className="text-xs font-mono text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 break-all select-all">
              {callbackUrl}
            </p>
          </div>

          {/* Verify Token */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Verify Token</span>
              <button
                onClick={() => copyToClipboard(verifyToken, 'token')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copiedKey === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'token' ? 'Copied!' : 'Copy Token'}</span>
              </button>
            </div>
            <p className="text-xs font-mono text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 break-all select-all">
              {verifyToken}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/40 p-4 rounded-xl border border-slate-800/60 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-300">Meta Webhook Subscriptions Required:</span>
            <p className="text-slate-400">
              In Meta Developer Console under Webhooks, subscribe to <span className="text-blue-300 font-mono">messages</span> and <span className="text-blue-300 font-mono">messaging_postbacks</span> for Messenger & Instagram, and <span className="text-emerald-300 font-mono">messages</span> for WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: Facebook Connect */}
      {isFbModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Facebook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Connect Facebook Page</h3>
                  <p className="text-xs text-slate-500">Provide your Facebook Page credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsFbModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectFacebook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 102938475610293"
                  value={fbPageId}
                  onChange={(e) => setFbPageId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Page Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. My Online Store"
                  value={fbPageName}
                  onChange={(e) => setFbPageName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Page Access Token (Permanent / Long-lived) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="EAA..."
                  value={fbAccessToken}
                  onChange={(e) => setFbAccessToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Obtained from Meta Graph API Explorer or Meta Business Manager.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Direct Auto-Reply</span>
                  <p className="text-[11px] text-slate-500">Send AI replies directly without manual approval</p>
                </div>
                <input
                  type="checkbox"
                  checked={fbAutoSend}
                  onChange={(e) => setFbAutoSend(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFbModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fbSaving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {fbSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{fbSaving ? 'Connecting...' : 'Save & Connect'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Instagram Connect */}
      {isIgModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Connect Instagram Professional</h3>
                  <p className="text-xs text-slate-500">Link your Instagram Business or Creator account</p>
                </div>
              </div>
              <button
                onClick={() => setIsIgModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectInstagram} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instagram User ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 17841400000000000"
                  value={igUserId}
                  onChange={(e) => setIgUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Handle / Username</label>
                <input
                  type="text"
                  placeholder="e.g. yourbrand.bd"
                  value={igUsername}
                  onChange={(e) => setIgUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Access Token (Meta Graph) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="EAA..."
                  value={igAccessToken}
                  onChange={(e) => setIgAccessToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Direct Auto-Reply</span>
                  <p className="text-[11px] text-slate-500">Send AI replies directly to Instagram DMs</p>
                </div>
                <input
                  type="checkbox"
                  checked={igAutoSend}
                  onChange={(e) => setIgAutoSend(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIgModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={igSaving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {igSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{igSaving ? 'Connecting...' : 'Save & Connect'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WhatsApp Connect */}
      {isWaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Connect WhatsApp Cloud API</h3>
                  <p className="text-xs text-slate-500">Configure Meta WhatsApp Business Platform</p>
                </div>
              </div>
              <button
                onClick={() => setIsWaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectWhatsApp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100000000000001"
                  value={waPhoneId}
                  onChange={(e) => setWaPhoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Business Account ID (WABA ID)</label>
                <input
                  type="text"
                  placeholder="e.g. 200000000000002"
                  value={waWabaId}
                  onChange={(e) => setWaWabaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Display Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. +880 1700-000000"
                  value={waDisplayPhone}
                  onChange={(e) => setWaDisplayPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Access Token *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="EAA..."
                  value={waAccessToken}
                  onChange={(e) => setWaAccessToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800">Test / Sandbox Mode</span>
                  <p className="text-[11px] text-slate-500">Enable if using Meta Developer Test phone number</p>
                </div>
                <input
                  type="checkbox"
                  checked={waIsTestNumber}
                  onChange={(e) => setWaIsTestNumber(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800">Direct Auto-Reply</span>
                  <p className="text-[11px] text-slate-500">AI replies directly to WhatsApp chats</p>
                </div>
                <input
                  type="checkbox"
                  checked={waAutoSend}
                  onChange={(e) => setWaAutoSend(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWaModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={waSaving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {waSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{waSaving ? 'Connecting...' : 'Save & Connect'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
