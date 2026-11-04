'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WebhookSimulatorModal } from '@/components/layout/WebhookSimulatorModal';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  X,
  Share2,
  Image as ImageIcon,
  Send,
  Eye,
  Filter,
} from 'lucide-react';
import { ScheduledPost, Platform, PostStatus } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

function SchedulerContent() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

  // Composer Form States
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['facebook', 'instagram']);
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if sent from AI Writer
  useEffect(() => {
    if (searchParams.get('fromAiWriter') === 'true') {
      const prefilled = sessionStorage.getItem('prefill_caption');
      if (prefilled) {
        setCaption(prefilled);
        sessionStorage.removeItem('prefill_caption');
      }
      setIsComposerOpen(true);
    }
  }, [searchParams]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleTogglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleCreatePost = async (publishImmediately: boolean = false) => {
    if (!caption.trim()) {
      alert('Please enter a caption for your post');
      return;
    }
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one social media platform');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledIso = publishImmediately
        ? new Date().toISOString()
        : new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          platforms: selectedPlatforms,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
          scheduledTime: scheduledIso,
          status: publishImmediately ? 'published' : 'scheduled',
        }),
      });

      const json = await res.json();
      if (json.success) {
        await fetchPosts();
        setIsComposerOpen(false);
        setCaption('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled post?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'facebook':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300">Facebook</span>;
      case 'instagram':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-900/60 text-pink-300">Instagram</span>;
      case 'whatsapp':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300">WhatsApp</span>;
    }
  };

  const sampleImages = [
    { label: 'Panjabi', url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600' },
    { label: 'Sharee', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
    { label: 'Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600' },
    { label: 'Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600' },
    { label: 'Wallet', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar onOpenSimulator={() => setIsSimulatorOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="Multi-Platform Post Publisher & Scheduler"
          description="Schedule and broadcast promotions across Meta Pages, Instagram & WhatsApp channels"
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            {/* View Switcher & Status Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'calendar'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Calendar View</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {(['all', 'scheduled', 'published', 'draft'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                      statusFilter === s
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* + Compose Button */}
            <button
              onClick={() => setIsComposerOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Social Post</span>
            </button>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  <span>November 2026 Scheduled Social Calendar</span>
                </h3>
                <span className="text-xs text-slate-400">Timezone: Asia/Dhaka (+06:00)</span>
              </div>

              {/* Calendar Grid (Days of Week + Days 1-30) */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="p-2 text-center text-xs font-semibold text-slate-400 uppercase">
                    {d}
                  </div>
                ))}

                {/* Blank days for Nov 2026 (Starts on Sunday) */}
                {Array.from({ length: 30 }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayDateStr = `2026-11-${String(dayNum).padStart(2, '0')}`;
                  const dayPosts = posts.filter((p) => p.scheduledTime.startsWith(dayDateStr));
                  const isToday = dayNum === 4;

                  return (
                    <div
                      key={dayNum}
                      onClick={() => {
                        setScheduledDate(dayDateStr);
                        setIsComposerOpen(true);
                      }}
                      className={`min-h-[100px] p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isToday
                          ? 'bg-indigo-950/40 border-indigo-500/60 shadow-inner'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold text-indigo-400">TODAY</span>
                        )}
                      </div>

                      {/* Posts on this date */}
                      <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-none">
                        {dayPosts.map((dp) => (
                          <div
                            key={dp.id}
                            className={`p-1.5 rounded-lg text-[10px] truncate font-medium ${
                              dp.status === 'published'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                                : 'bg-indigo-900/60 text-indigo-200 border border-indigo-700/50'
                            }`}
                            title={dp.caption}
                          >
                            <span className="font-bold">
                              {new Date(dp.scheduledTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>{' '}
                            {dp.caption.slice(0, 18)}...
                          </div>
                        ))}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 opacity-0 hover:opacity-100">
                          + Schedule
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Posts List Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <span>All Scheduled & Published Posts ({filteredPosts.length})</span>
            </h3>

            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                <CalendarIcon className="w-8 h-8 mx-auto stroke-1 mb-2" />
                <p className="text-xs">No posts found for the selected filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Card Header: Platforms & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {post.platforms.map((p) => (
                            <span key={p}>{getPlatformIcon(p)}</span>
                          ))}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            post.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : post.status === 'scheduled'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>

                      {/* Image Preview & Caption */}
                      <div className="flex gap-4">
                        {post.mediaUrls.length > 0 && (
                          <img
                            src={post.mediaUrls[0]}
                            alt="Media Preview"
                            className="w-20 h-20 rounded-xl object-cover ring-1 ring-slate-800 shrink-0"
                          />
                        )}
                        <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap flex-1">
                          {post.caption}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Date & Delete Action */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>
                          {new Date(post.scheduledTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {post.likes !== undefined && (
                          <span className="text-[11px] text-slate-400">
                            ❤️ {post.likes} • 💬 {post.comments}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Post Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Compose & Schedule Social Post</h3>
              </div>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Platforms Checkbox */}
              <div>
                <label className="font-semibold text-slate-300 block mb-2">Publish To:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['facebook', 'instagram', 'whatsapp'] as Platform[]).map((p) => {
                    const isChecked = selectedPlatforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleTogglePlatform(p)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold capitalize flex items-center justify-center gap-2 transition cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 shadow-sm'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="accent-indigo-500 pointer-events-none"
                        />
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Caption Editor */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Post Caption & Call-to-Action *
                </label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write your promotional caption with hashtags..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none text-xs"
                />
              </div>

              {/* Media URL & Samples */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Product Image Media URL
                </label>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400">Sample Photos:</span>
                  {sampleImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMediaUrl(img.url)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
                {mediaUrl && (
                  <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden ring-1 ring-slate-700">
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Schedule Date & Time */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Schedule Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Schedule Time (BST)</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreatePost(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                >
                  Publish Immediately 🚀
                </button>
                <button
                  type="button"
                  onClick={() => handleCreatePost(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save & Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onEventSimulated={fetchPosts}
      />
    </div>
  );
}

export default function SchedulerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading scheduler...</div>}>
      <SchedulerContent />
    </Suspense>
  );
}
