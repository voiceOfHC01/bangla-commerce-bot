'use client';

import React from 'react';
import { Radio, Bell, Store, Clock } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
  onOpenSimulator?: () => void;
}

export function Header({ title, description, onOpenSimulator }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        {description && (
          <p className="text-xs text-slate-400 font-normal">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Dhaka Time Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">Dhaka (GMT+6)</span>
        </div>

        {/* Live Simulator Shortcut */}
        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition cursor-pointer"
            title="Simulate incoming Facebook, Instagram, or WhatsApp message"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">Simulate Message</span>
          </button>
        )}

        {/* Store Identifier */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200">
          <Store className="w-3.5 h-3.5 text-pink-400" />
          <span className="font-semibold text-slate-100 hidden sm:inline">SocialBazaar Store</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>
      </div>
    </header>
  );
}
