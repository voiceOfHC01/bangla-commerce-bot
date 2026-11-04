'use client';

import React, { useState } from 'react';
import { Product, Conversation, Order } from '@/lib/types';
import { ShoppingBag, Star, Check, Zap, MapPin, Phone, Truck, ShieldCheck, X } from 'lucide-react';
import { BD_DISTRICTS } from '@/lib/order-extractor';

interface InChatMiniStoreProps {
  products: Product[];
  conversation: Conversation;
  onOrderSuccess: (order: Order) => void;
}

export function InChatMiniStore({
  products,
  conversation,
  onOrderSuccess,
}: InChatMiniStoreProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout form states
  const [customerName, setCustomerName] = useState(conversation.customerName || '');
  const [phone, setPhone] = useState(conversation.customerPhone || '');
  const [district, setDistrict] = useState(conversation.deliveryAddress?.district || 'Dhaka');
  const [thana, setThana] = useState(conversation.deliveryAddress?.thana || '');
  const [fullAddress, setFullAddress] = useState(conversation.deliveryAddress?.fullAddress || '');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCheckout = (product: Product) => {
    setSelectedProduct(product);
    setCustomerName(conversation.customerName || '');
    setPhone(conversation.customerPhone || '');
    setDistrict(conversation.deliveryAddress?.district || 'Dhaka');
    setFullAddress(conversation.deliveryAddress?.fullAddress || '');
    setIsCheckoutOpen(true);
  };

  const isInsideDhaka = district.toLowerCase() === 'dhaka';
  const deliveryCharge = isInsideDhaka ? 80 : 150;
  const subtotal = selectedProduct ? selectedProduct.price * quantity : 0;
  const totalAmount = subtotal + deliveryCharge;

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!phone || !fullAddress) {
      alert('Please enter your phone number and delivery address');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || conversation.customerName,
          customerPhone: phone,
          platform: conversation.platform,
          deliveryAddress: {
            district,
            thana: thana || (isInsideDhaka ? 'Mirpur' : 'Sadar'),
            fullAddress,
          },
          items: [
            {
              id: `item-${Date.now()}`,
              name: selectedProduct.name,
              price: selectedProduct.price,
              quantity,
              image: selectedProduct.image,
            },
          ],
          deliveryCharge,
          paymentMethod,
          status: 'confirmed',
          notes: 'Ordered directly via In-Chat Mini Store.',
        }),
      });

      const orderJson = await orderRes.json();
      if (orderJson.success) {
        const createdOrder: Order = orderJson.data;

        // Auto-send confirmation SMS
        await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: createdOrder.id,
            phone: createdOrder.customerPhone,
            customerName: createdOrder.customerName,
            messageType: 'order_confirmation',
          }),
        });

        // Add receipt message in chat
        await fetch(`/api/conversations/${conversation.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: 'bot',
            senderName: 'In-Chat Checkout Bot 🛍️',
            text: `🎉 অভিনন্দন ${createdOrder.customerName}! আপনার ইন-চ্যাট অর্ডার সফলভাবে সম্পন্ন হয়েছে!\n\n📋 অর্ডার নং: #${createdOrder.orderNumber}\n📦 প্রোডাক্ট: ${selectedProduct.name} (${quantity} টি)\n💰 মোট মূল্য: ৳${createdOrder.totalAmount} (${paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'bKash'})\n📍 ঠিকানা: ${createdOrder.deliveryAddress.fullAddress}\n\n📲 আপনার ফোনে (${createdOrder.customerPhone}) একটি কনফার্মেশন SMS পাঠানো হয়েছে!`,
          }),
        });

        setIsCheckoutOpen(false);
        onOrderSuccess(createdOrder);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-2 space-y-2">
      {/* Header Badge */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
        <span className="flex items-center gap-1.5 text-indigo-400">
          <ShoppingBag className="w-4 h-4" />
          <span>In-Chat Mini Store ({products.length} Products)</span>
        </span>
        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
          Direct Checkout Enabled
        </span>
      </div>

      {/* Visual Product Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="w-56 shrink-0 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition group"
          >
            {/* Image & Badge */}
            <div className="relative h-32 w-full overflow-hidden bg-slate-950">
              <img
                src={prod.image}
                alt={prod.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              {prod.badge && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-sm text-amber-300 border border-amber-500/30">
                  {prod.badge}
                </span>
              )}
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-900/90 text-slate-300 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {prod.rating}
              </span>
            </div>

            {/* Product Details */}
            <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1 leading-tight">
                  {prod.bengaliName || prod.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {prod.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-emerald-400">
                    ৳{prod.price.toLocaleString()}
                  </span>
                  {prod.regularPrice && (
                    <span className="text-[10px] text-slate-500 line-through ml-1.5">
                      ৳{prod.regularPrice}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenCheckout(prod)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Order Now</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inline Quick Checkout Modal */}
      {isCheckoutOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">In-Chat Instant Checkout</h3>
                  <p className="text-[11px] text-slate-400">Order directly without leaving Messenger/Chat</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmOrder} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              {/* Product Summary Snippet */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-14 h-14 rounded-lg object-cover ring-1 ring-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-100 truncate">{selectedProduct.name}</h4>
                  <p className="text-[11px] text-emerald-400 font-extrabold mt-0.5">
                    ৳{selectedProduct.price} × {quantity} = ৳{(selectedProduct.price * quantity).toLocaleString()}
                  </p>
                </div>
                {/* Quantity adjuster */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">11-Digit BD Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">District *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {BD_DISTRICTS.map((d, i) => (
                      <option key={i} value={d.en}>
                        {d.en} ({d.bn})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Thana / Area</label>
                  <input
                    type="text"
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    placeholder="e.g. Mirpur / Dhanmondi"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Cash on Delivery (COD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'bkash'
                        ? 'bg-pink-600/20 text-pink-300 border-pink-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>bKash Payment 💳</span>
                  </button>
                </div>
              </div>

              {/* Cost Calculation & SMS Alert Notice */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                  <span>৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-slate-800">
                  <span>Total Amount:</span>
                  <span className="text-emerald-400">৳{totalAmount.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-indigo-400 pt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Real-time SMS confirmation will be sent to {phone || 'your phone'}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-900/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Placing Order...' : 'Confirm Order & Send SMS'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
