'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WebhookSimulatorModal } from '@/components/layout/WebhookSimulatorModal';
import { OrderStats } from '@/components/orders/OrderStats';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { NewOrderModal } from '@/components/orders/NewOrderModal';
import { Order, OrderStatus } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Check URL query params for new order pre-fill from inbox
  const initialCustomerName = searchParams.get('customerName') || '';
  const initialPhone = searchParams.get('phone') || '';
  const initialDistrict = searchParams.get('district') || 'Dhaka';

  useEffect(() => {
    if (searchParams.get('newOrder') === 'true') {
      setIsNewOrderModalOpen(true);
    }
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar onOpenSimulator={() => setIsSimulatorOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="Order Management & Analytics"
          description="Track social orders, courier status, BD phone validation & delivery fulfillment"
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <OrderStats orders={orders} />

          <OrdersTable
            orders={orders}
            onStatusChange={handleStatusChange}
            onDeleteOrder={handleDeleteOrder}
            onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)}
            statusFilter={statusFilter}
            onStatusFilterChange={(s) => setStatusFilter(s)}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            onOrderUpdated={fetchOrders}
          />
        </main>
      </div>

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onOrderCreated={fetchOrders}
        initialCustomerName={initialCustomerName}
        initialPhone={initialPhone}
        initialDistrict={initialDistrict}
      />

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onEventSimulated={fetchOrders}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
