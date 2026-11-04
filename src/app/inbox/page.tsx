'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WebhookSimulatorModal } from '@/components/layout/WebhookSimulatorModal';
import { ConversationList } from '@/components/inbox/ConversationList';
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { Conversation, Message, Platform, ConversationStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function InboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Filters
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ConversationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = async (maintainSelectedId?: string) => {
    try {
      const params = new URLSearchParams();
      if (selectedPlatform !== 'all') params.set('platform', selectedPlatform);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/conversations?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setConversations(json.data);
        if (json.data.length > 0) {
          if (maintainSelectedId) {
            const found = json.data.find((c: Conversation) => c.id === maintainSelectedId);
            if (found) setSelectedConversation(found);
          } else if (!selectedConversation) {
            setSelectedConversation(json.data[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      const json = await res.json();
      if (json.success) {
        setMessages(json.data.messages || []);
        setSelectedConversation(json.data.conversation);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [selectedPlatform, selectedStatus, searchQuery]);

  useEffect(() => {
    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  const handleSendMessage = async (text: string, sender: 'agent' | 'customer') => {
    if (!selectedConversation) return;
    try {
      const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh messages
        await fetchMessages(selectedConversation.id);
        await fetchConversations(selectedConversation.id);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleToggleBot = async (active: boolean) => {
    if (!selectedConversation) return;
    try {
      const res = await fetch(`/api/conversations/${selectedConversation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botActive: active }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedConversation((prev) => (prev ? { ...prev, botActive: active } : null));
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversation.id ? { ...c, botActive: active } : c))
        );
      }
    } catch (err) {
      console.error('Failed to toggle bot:', err);
    }
  };

  const handleCreateOrderShortcut = (conv: Conversation) => {
    router.push(`/orders?newOrder=true&customerName=${encodeURIComponent(conv.customerName)}&phone=${encodeURIComponent(conv.customerPhone || '')}&district=${encodeURIComponent(conv.deliveryAddress?.district || '')}`);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar onOpenSimulator={() => setIsSimulatorOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="Unified Social Inbox"
          description="Meta Messenger, Instagram Direct & WhatsApp Cloud live chat"
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        <div className="flex-1 flex overflow-hidden">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?.id || null}
            onSelect={(conv) => setSelectedConversation(conv)}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={(p) => setSelectedPlatform(p)}
            selectedStatus={selectedStatus}
            onSelectStatus={(s) => setSelectedStatus(s)}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
          />

          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            onToggleBot={handleToggleBot}
            onCreateOrderShortcut={handleCreateOrderShortcut}
            loadingMessages={loadingMessages}
          />
        </div>
      </div>

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onEventSimulated={() => {
          fetchConversations(selectedConversation?.id);
          if (selectedConversation) fetchMessages(selectedConversation.id);
        }}
      />
    </div>
  );
}
