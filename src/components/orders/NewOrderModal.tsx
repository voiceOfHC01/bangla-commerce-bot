'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { BD_DISTRICTS } from '@/lib/order-extractor';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { OrderItem } from '@/lib/types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
  initialCustomerName?: string;
  initialPhone?: string;
  initialDistrict?: string;
}

export function NewOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
  initialCustomerName = '',
  initialPhone = '',
  initialDistrict = 'Dhaka',
}: NewOrderModalProps) {
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [district, setDistrict] = useState(initialDistrict || 'Dhaka');
  const [thana, setThana] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'whatsapp' | 'manual'>('manual');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 'it-1',
      name: SEED_PRODUCTS[0].name,
      price: SEED_PRODUCTS[0].price,
      quantity: 1,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const isInsideDhaka = district.toLowerCase() === 'dhaka';
  const deliveryCharge = isInsideDhaka ? 80 : 150;
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const totalAmount = subtotal + deliveryCharge;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        name: SEED_PRODUCTS[0].name,
        price: SEED_PRODUCTS[0].price,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleProductSelect = (idx: number, prodName: string) => {
    const prod = SEED_PRODUCTS.find((p) => p.name === prodName);
    if (prod) {
      setItems((prev) =>
        prev.map((it, i) => (i === idx ? { ...it, name: prod.name, price: prod.price } : it))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !fullAddress) {
      alert('Please fill out customer name, phone, and address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          platform,
          deliveryAddress: {
            district,
            thana,
            fullAddress,
          },
          items,
          deliveryCharge,
          paymentMethod,
          notes,
          status: 'pending',
        }),
      });

      const json = await res.json();
      if (json.success) {
        onOrderCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Create New Order</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Tanzim Rahman"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Phone Number (11-digit BD) *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Order Channel</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="facebook">Facebook Messenger</option>
                <option value="instagram">Instagram Direct</option>
                <option value="whatsapp">WhatsApp Cloud</option>
                <option value="manual">Manual / Phone Order</option>
              </select>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">District *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                {BD_DISTRICTS.map((d, i) => (
                  <option key={i} value={d.en}>
                    {d.en} ({d.bn})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Thana / Upazila</label>
              <input
                type="text"
                value={thana}
                onChange={(e) => setThana(e.target.value)}
                placeholder="e.g. Mirpur / Dhanmondi"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="cod">Cash on Delivery (ক্যাশ অন ডেলিভারি)</option>
                <option value="bkash">bKash (বিকাশ)</option>
                <option value="nagad">Nagad (নগদ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Full Delivery Address *</label>
            <textarea
              rows={2}
              required
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="House, Road, Block/Sector, Area details..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Products List */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">Order Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <select
                  value={item.name}
                  onChange={(e) => handleProductSelect(idx, e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  {SEED_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} - ৳{p.price}
                    </option>
                  ))}
                </select>

                <div className="w-20">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const q = parseInt(e.target.value, 10) || 1;
                      setItems((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, quantity: q } : it))
                      );
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs text-center"
                  />
                </div>

                <div className="w-24 text-right font-bold text-slate-200">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Price Calculation Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Delivery Charge ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
              <span>৳{deliveryCharge}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-1 border-t border-slate-800">
              <span>Total Payable:</span>
              <span className="text-emerald-400">৳{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Customer / Courier Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Call before delivery, deliver after 4 PM"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer shadow-md shadow-indigo-600/30"
            >
              {submitting ? 'Creating Order...' : 'Confirm Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
