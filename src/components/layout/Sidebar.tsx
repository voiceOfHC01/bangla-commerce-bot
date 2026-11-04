'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  ShoppingCart,
  Sparkles,
  Calendar,
  LayoutDashboard,
  Zap,
  Radio,
  ExternalLink,
  MessageCircleReply,
  Smartphone,
  BarChart3,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  onOpenSimulator: () => void;
  unreadCount?: number;
  pendingOrdersCount?: number;
}

export function Sidebar({ onOpenSimulator, unreadCount = 4, pendingOrdersCount = 2 }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Unified Inbox',
      href: '/inbox',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      name: 'Comment-to-DM',
      href: '/comments',
      icon: MessageCircleReply,
      badge: 'Auto',
      badgeColor: 'bg-purple-600/30 text-purple-300 border border-purple-500/30',
    },
    {
      name: 'Order Management',
      href: '/orders',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-amber-500 text-slate-900',
    },
    {
      name: 'SMS Gateway (BD)',
      href: '/sms',
      icon: Smartphone,
      badge: '৳485',
      badgeColor: 'bg-teal-600/30 text-teal-300 border border-teal-500/30',
    },
    {
      name: 'AI Copywriter',
      href: '/ai-writer',
      icon: Sparkles,
      badge: 'AI ✨',
      badgeColor: 'bg-pink-600/30 text-pink-300 border border-pink-500/30',
    },
    {
      name: 'Post Scheduler',
      href: '/scheduler',
      icon: Calendar,
      badge: null,
    },
    {
      name: 'Integrations & API',
      href: '/settings',
      icon: Radio,
      badge: 'Connect',
      badgeColor: 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30',
    },
  ];

  // Mobile Bottom Bar items (Matches the Commerce Bot AI mobile app mockup)
  const mobileNav = [
    { name: 'Inbox', href: '/inbox', icon: MessageSquare, badge: unreadCount },
    { name: 'Orders', href: '/orders', icon: ShoppingCart, badge: pendingOrdersCount },
    { name: 'Analytics', href: '/', icon: BarChart3, badge: null },
    { name: 'Settings', href: '/settings', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
        {/* Brand Header */}
        <div className="p-5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none flex items-center gap-1.5">
                Commerce Bot <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">AI</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                24/7 Social Sales Auto-Pilot
              </p>
            </div>
          </Link>

          {/* Channels Status Strip */}
          <div className="mt-5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-300 text-[11px]">24/7 Auto-Pilot Active</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="px-1 py-0.5 bg-blue-950 text-blue-400 rounded border border-blue-800/50">FB</span>
              <span className="px-1 py-0.5 bg-pink-950 text-pink-400 rounded border border-pink-800/50">IG</span>
              <span className="px-1 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-800/50">WA</span>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="mt-5 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href === '/settings' && pathname.startsWith('/settings'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Simulator Button */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={onOpenSimulator}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Simulate Webhook Event</span>
          </button>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300">bKash Verified Engine</span>
              <span className="text-[10px] text-pink-400 font-bold">bKash Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Auto deal closing in Bengali/Banglish across Facebook, Instagram & WhatsApp.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Floating Bottom Navigation Bar (Shown on small screens / Capacitor App) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href || (item.href === '/settings' && pathname.startsWith('/settings'));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer relative ${
                isActive ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight">{item.name}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
