import { KeywordTrigger } from './types';

export const DEFAULT_KEYWORD_TRIGGERS: KeywordTrigger[] = [
  {
    id: 'trig-1',
    title: 'Price Query (দাম কত)',
    keywords: ['price', 'দাম কত', 'dam koto', 'dam', 'rate', 'cost', 'koto', 'মূল্য কত', 'দাম'],
    responseText: 'আমাদের প্রিমিয়াম কালেকশনের স্পেশাল অফার প্রাইজ মাত্র ১২৫০ টাকা (রেগুলার প্রাইজ ১৪৫০ টাকা)! আপনি কি অর্ডার কনফার্ম করতে চান? 😊',
    action: 'reply',
    active: true,
    matchCount: 42,
  },
  {
    id: 'trig-2',
    title: 'Order Intent (কিনতে চাই / অর্ডার)',
    keywords: ['order', 'কিনতে চাই', 'kinte chai', 'order korbo', 'buy', 'অর্ডার', 'অর্ডার করব', 'নিতে চাই'],
    responseText: 'অর্ডার কনফার্ম করতে অনুগ্রহ করে আপনার:\n১. নাম\n২. ১১ ডিজিটের মোবাইল নম্বর\n৩. সম্পূর্ণ ডেলিভারি ঠিকানা দিন।\n\nআমরা দ্রুততম সময়ে হোম ডেলিভারি পাঠিয়ে দেব! 🚚',
    action: 'ask_order_details',
    active: true,
    matchCount: 78,
  },
  {
    id: 'trig-3',
    title: 'Delivery Charge & Time (ডেলিভারি চার্জ)',
    keywords: ['delivery charge', 'ডেলিভারি চার্জ', 'delivery', 'kobe pabo', 'কবে পাব', 'পৌঁছাবে', 'shipping charge', 'ডেলিভারি'],
    responseText: 'আমাদের ডেলিভারি চার্জ:\n📍 ঢাকার ভেতরে: ৮০ টাকা (২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি)\n📍 ঢাকার বাইরে: ১৫০ টাকা (২-৩ দিনের মধ্যে হোম ডেলিভারি)\n\nক্যাশ অন ডেলিভারি সুবিধা রয়েছে! 📦',
    action: 'reply',
    active: true,
    matchCount: 35,
  },
  {
    id: 'trig-4',
    title: 'Payment Query (পেমেন্ট পদ্ধতি)',
    keywords: ['bkash', 'বিকাশ', 'cod', 'cash on delivery', 'payment', 'টাকা কিভাবে দেব', 'nagad', 'ক্যাশ অন ডেলিভারি'],
    responseText: 'আপনি পণ্য হাতে পেয়ে দেখে সম্পূর্ণ টাকা ক্যাশ অন ডেলিভারিতে দিতে পারবেন! এছাড়া bKash বা Nagad-এ অগ্রিম পেমেন্টের সুবিধাও রয়েছে। 💳',
    action: 'reply',
    active: true,
    matchCount: 19,
  },
  {
    id: 'trig-5',
    title: 'Stock / Availability (স্টকে আছে?)',
    keywords: ['available', 'stock', 'stock ache', 'আছে কি', 'পাওয়া যাবে', 'stock e ache', 'স্টক'],
    responseText: 'জি প্রিয় কাস্টমার, পণ্যটি বর্তমানে রেডি স্টকে অ্যাভেইলেবল রয়েছে! স্টক শেষ হওয়ার আগেই আপনার অর্ডারটি কনফার্ম করুন। ✨',
    action: 'reply',
    active: true,
    matchCount: 27,
  },
];

export interface KeywordMatchResult {
  matched: boolean;
  trigger?: KeywordTrigger;
  replyText?: string;
  action?: 'reply' | 'ask_order_details' | 'human_handoff' | 'send_mini_store';
}

/**
 * Matches a user message against active keyword rules
 */
export function matchKeywords(text: string, triggers: KeywordTrigger[] = DEFAULT_KEYWORD_TRIGGERS): KeywordMatchResult {
  const lowerText = text.toLowerCase().trim();

  for (const trigger of triggers) {
    if (!trigger.active) continue;

    for (const kw of trigger.keywords) {
      const lowerKw = kw.toLowerCase().trim();
      // Check substring or word boundary
      if (lowerText.includes(lowerKw)) {
        return {
          matched: true,
          trigger,
          replyText: trigger.responseText,
          action: trigger.action,
        };
      }
    }
  }

  return { matched: false };
}
