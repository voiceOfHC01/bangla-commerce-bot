import { ExtractedOrderData, ConversationIntent, Product } from './types';

// BD 64 Districts in English and Bengali
export const BD_DISTRICTS = [
  { en: 'Dhaka', bn: 'ঢাকা' },
  { en: 'Gazipur', bn: 'গাজীপুর' },
  { en: 'Narayanganj', bn: 'নারায়ণগঞ্জ' },
  { en: 'Chattogram', bn: 'চট্টগ্রাম' },
  { en: 'Chittagong', bn: 'চট্টগ্রাম' },
  { en: 'Sylhet', bn: 'সিলেট' },
  { en: 'Rajshahi', bn: 'রাজশাহী' },
  { en: 'Khulna', bn: 'খুলনা' },
  { en: 'Barishal', bn: 'বরিশাল' },
  { en: 'Rangpur', bn: 'রংপুর' },
  { en: 'Mymensingh', bn: 'ময়মনসিংহ' },
  { en: 'Bogura', bn: 'বগুড়া' },
  { en: 'Bogra', bn: 'বগুড়া' },
  { en: 'Cumilla', bn: 'কুমিল্লা' },
  { en: 'Comilla', bn: 'কুমিল্লা' },
  { en: 'Coxs Bazar', bn: 'কক্সবাজার' },
  { en: 'Feni', bn: 'ফেনী' },
  { en: 'Noakhali', bn: 'নোয়াখালী' },
  { en: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া' },
  { en: 'Tangail', bn: 'টাঙ্গাইল' },
  { en: 'Faridpur', bn: 'ফরিদপুর' },
  { en: 'Jessore', bn: 'যশোর' },
  { en: 'Jashore', bn: 'যশোর' },
  { en: 'Kushtia', bn: 'কুষ্টিয়া' },
  { en: 'Pabna', bn: 'পাবনা' },
  { en: 'Sirajganj', bn: 'সিরাজগঞ্জ' },
  { en: 'Dinajpur', bn: 'দিনাজপুর' },
  { en: 'Narsingdi', bn: 'নরসিংদী' },
  { en: 'Munshiganj', bn: 'মুন্সীগঞ্জ' },
  { en: 'Manikganj', bn: 'মানিকগঞ্জ' },
];

export const COMMON_DHAKA_THANAS = [
  'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Badda', 'Tejgaon',
  'Motijheel', 'Old Dhaka', 'Lalbagh', 'Khilgaon', 'Bashundhara', 'Rampura', 'Malibagh',
  'ধানমন্ডি', 'গুলশান', 'বনানী', 'উত্তরা', 'মিরপুর', 'মোহাম্মদপুর', 'বাড্ডা', 'তেজগাঁও', 'বসুন্ধরা'
];

// Helper to convert Bengali digits to English
export function convertBanglaDigitsToEnglish(input: string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return input.replace(/[০-৯]/g, (w) => banglaDigits.indexOf(w).toString());
}

/**
 * Validates and normalizes Bangladeshi phone numbers
 * Accepts: 01712345678, +8801712345678, 8801712345678, or Bengali numerals
 * Valid BD prefixes: 013, 014, 015, 016, 017, 018, 019
 */
export function extractAndValidateBdPhone(text: string): string | null {
  const normalized = convertBanglaDigitsToEnglish(text);
  
  // Match +8801[3-9]\d{8} or 8801[3-9]\d{8} or 01[3-9]\d{8}
  const regex = /(?:\+?88)?(01[3-9]\d{8})\b/;
  const match = normalized.match(regex);
  
  if (match && match[1]) {
    return match[1]; // Standard 11 digit: 01XXXXXXXXX
  }
  return null;
}

/**
 * Extract Delivery District and Thana
 */
export function extractAddressDetails(text: string): { district?: string; thana?: string; fullAddress?: string } {
  let matchedDistrict: string | undefined;
  let matchedThana: string | undefined;

  // Search districts
  for (const d of BD_DISTRICTS) {
    const regEn = new RegExp(`\\b${d.en}\\b`, 'i');
    if (regEn.test(text) || text.includes(d.bn)) {
      matchedDistrict = d.en;
      break;
    }
  }

  // Search thanas
  for (const t of COMMON_DHAKA_THANAS) {
    const reg = new RegExp(`\\b${t}\\b`, 'i');
    if (reg.test(text) || text.includes(t)) {
      matchedThana = t;
      if (!matchedDistrict) matchedDistrict = 'Dhaka';
      break;
    }
  }

  let fullAddress: string | undefined;
  const addressMarkers = /(?:ঠিকানা|address|বাসা|রোড|হাউস|বাড়ি|village|gram|road|house|holding)[:\s\-]+([^\n,]+(?:,[^\n,]+)*)/i;
  const addressMatch = text.match(addressMarkers);
  if (addressMatch && addressMatch[1]) {
    fullAddress = addressMatch[1].trim();
  } else if (matchedDistrict || matchedThana) {
    fullAddress = text.trim();
  }

  return { district: matchedDistrict, thana: matchedThana, fullAddress };
}

/**
 * Extract quantity from text
 */
export function extractQuantity(text: string): number {
  const normalized = convertBanglaDigitsToEnglish(text);
  const qtyPatterns = [
    /(\d+)\s*(?:টা|টি|piece|pcs|pc|qty|ta|ti)/i,
    /(?:qty|পরিমাণ|কোয়ান্টিটি)[:\s]*(\d+)/i,
    /\b(\d+)\s*(?:sets?|পিস)\b/i
  ];

  for (const pat of qtyPatterns) {
    const m = normalized.match(pat);
    if (m && m[1]) {
      const q = parseInt(m[1], 10);
      if (q > 0 && q < 100) return q;
    }
  }
  return 1;
}

/**
 * Extract customer name from text
 */
export function extractCustomerName(text: string, fallbackName?: string): string | undefined {
  const namePatterns = [
    /(?:নাম|name)[:\s\-]+([A-Za-z\s\u0980-\u09FF]{2,30})/i,
    /(?:আমি|আমার নাম)[:\s]+([A-Za-z\s\u0980-\u09FF]{2,30})/i,
  ];

  for (const pat of namePatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      const cleaned = m[1].trim().replace(/\n.*/, '');
      if (cleaned.length >= 3 && !cleaned.toLowerCase().includes('order') && !cleaned.toLowerCase().includes('bkash')) {
        return cleaned;
      }
    }
  }

  return fallbackName;
}

/**
 * Extract size or color variant
 */
export function extractVariant(text: string): string | undefined {
  const variants = ['Small', 'Medium', 'Large', 'XL', 'XXL', '40', '42', '44', 'Black', 'Navy Blue', 'Maroon', 'White', 'Red', 'Blue', 'ম', 'এল', 'এক্স এল', 'কালো', 'নেভি ব্লু'];
  for (const v of variants) {
    const reg = new RegExp(`\\b${v}\\b`, 'i');
    if (reg.test(text) || text.includes(v)) {
      return v;
    }
  }
  return undefined;
}

/**
 * bKash Payment Details Extractor
 * Extracts:
 * - bKash TrxID (e.g., TrxID 9K72J8Q1, BL88A92K)
 * - Sender Number or last 4 digits
 * - Payment Method ('bKash' or 'COD')
 */
export function extractBkashDetails(text: string): {
  isBkash: boolean;
  trxId?: string;
  senderNumber?: string;
  paymentStatus: 'Unpaid' | 'Pending Verification' | 'Paid';
} {
  const lower = text.toLowerCase();
  const normalized = convertBanglaDigitsToEnglish(text);

  // Check bKash keywords
  const isBkashMention = /bkash|বিকাশ|trx|transaction|ট্রানজেকশন/i.test(lower);

  // Extract TrxID: usually 8 to 11 alphanumeric characters (e.g. 9K72J8Q1, BL789X2K, BLA98231, etc.)
  const trxMatch = normalized.match(/(?:trx\s*id|trxid|transaction\s*id|আইডি)[:\s\-]*([A-Za-z0-9]{7,12})\b/i) ||
                   normalized.match(/\b([A-Z0-9]{8,11})\b/);

  let trxId: string | undefined;
  if (trxMatch && trxMatch[1]) {
    const candidate = trxMatch[1].toUpperCase();
    // Exclude common words like "FACEBOOK", "WHATSAPP", "INSTAGRAM"
    if (!['FACEBOOK', 'WHATSAPP', 'INSTAGRAM', 'PRODUCTS', 'BANGLADESH'].includes(candidate)) {
      trxId = candidate;
    }
  }

  // Extract Sender number or last 4 digits
  let senderNumber: string | undefined;
  const phone = extractAndValidateBdPhone(text);
  if (phone) {
    senderNumber = phone;
  } else {
    const lastDigitsMatch = normalized.match(/(?:last\s*4|লাস্ট|শেষ|sender)[:\s\-]*(\d{4,11})/i);
    if (lastDigitsMatch && lastDigitsMatch[1]) {
      senderNumber = lastDigitsMatch[1];
    }
  }

  let paymentStatus: 'Unpaid' | 'Pending Verification' | 'Paid' = 'Unpaid';
  if (trxId) {
    paymentStatus = 'Pending Verification';
  }

  return {
    isBkash: isBkashMention || !!trxId,
    trxId,
    senderNumber,
    paymentStatus,
  };
}

/**
 * AI Intent Classifier for Deal-Closing Sales Agent
 * Categorizes message into 5 key pipeline stages:
 * - Inquiry
 * - Product Exploration
 * - Negotiation/Questions
 * - Checkout/Order
 * - Order Confirmed
 */
export function classifyConversationIntent(text: string): ConversationIntent {
  const lower = text.toLowerCase();
  const bkash = extractBkashDetails(text);
  const phone = extractAndValidateBdPhone(text);

  if (bkash.trxId || lower.includes('payment complete') || lower.includes('টাকা পাঠিয়েছি') || lower.includes('taka pathaisi')) {
    return 'Order Confirmed';
  }

  if (phone || lower.includes('order confirm') || lower.includes('অর্ডার কনফার্ম') || lower.includes('ঠিকানা') || lower.includes('address')) {
    return 'Checkout/Order';
  }

  if (
    lower.includes('discount') ||
    lower.includes('ছাড়') ||
    lower.includes('দাম কম') ||
    lower.includes('delivery charge') ||
    lower.includes('ডেলিভারি চার্জ') ||
    lower.includes('কবে পাব') ||
    lower.includes('how many days') ||
    lower.includes('tk kom')
  ) {
    return 'Negotiation/Questions';
  }

  if (
    lower.includes('size') ||
    lower.includes('সাইজ') ||
    lower.includes('colour') ||
    lower.includes('color') ||
    lower.includes('কালার') ||
    lower.includes('stock') ||
    lower.includes('আবেদন') ||
    lower.includes('available') ||
    lower.includes('পাঞ্জাবি') ||
    lower.includes('শাড়ি') ||
    lower.includes('মধু') ||
    lower.includes('earbuds') ||
    lower.includes('wallet')
  ) {
    return 'Product Exploration';
  }

  return 'Inquiry';
}

/**
 * Complete Order Extractor from conversation or text message
 */
export function extractOrderFromMessage(
  messageText: string,
  contextCustomerName?: string,
  knownProductCatalog: Product[] = []
): ExtractedOrderData & {
  variant?: string;
  paymentMethod: 'COD' | 'bKash';
  bkashTrxId?: string;
  bkashSenderNumber?: string;
  paymentStatus: 'Unpaid' | 'Pending Verification' | 'Paid';
} {
  const phone = extractAndValidateBdPhone(messageText);
  const addressInfo = extractAddressDetails(messageText);
  const quantity = extractQuantity(messageText);
  const name = extractCustomerName(messageText, contextCustomerName);
  const variant = extractVariant(messageText);
  const bkashInfo = extractBkashDetails(messageText);

  // Match known product
  let matchedProduct: string | undefined;
  let unitPrice = 0;

  for (const prod of knownProductCatalog) {
    if (
      messageText.toLowerCase().includes(prod.name.toLowerCase()) ||
      (prod.bengaliName && messageText.includes(prod.bengaliName)) ||
      (prod.sku && messageText.toLowerCase().includes(prod.sku.toLowerCase()))
    ) {
      matchedProduct = prod.name;
      unitPrice = prod.price;
      break;
    }
  }

  // Price detection fallback
  const normalized = convertBanglaDigitsToEnglish(messageText);
  const priceMatch = normalized.match(/(?:৳|tk|taka|টাকা)[:\s]*(\d+)/i) || normalized.match(/(\d+)\s*(?:tk|taka|টাকা)/i);
  if (priceMatch && priceMatch[1] && unitPrice === 0) {
    unitPrice = parseInt(priceMatch[1], 10);
  }

  const missingFields: string[] = [];
  if (!name) missingFields.push('Customer Name');
  if (!phone) missingFields.push('11-digit Phone Number');
  if (!addressInfo.district && !addressInfo.fullAddress) missingFields.push('Delivery Address');
  if (!matchedProduct && unitPrice === 0) missingFields.push('Product Details');

  const isComplete = missingFields.length === 0;

  return {
    customerName: name,
    customerPhone: phone || undefined,
    district: addressInfo.district,
    thana: addressInfo.thana,
    fullAddress: addressInfo.fullAddress,
    productName: matchedProduct,
    quantity,
    unitPrice: unitPrice > 0 ? unitPrice : undefined,
    totalPrice: unitPrice > 0 ? unitPrice * quantity : undefined,
    isComplete,
    missingFields,
    variant,
    paymentMethod: bkashInfo.isBkash ? 'bKash' : 'COD',
    bkashTrxId: bkashInfo.trxId,
    bkashSenderNumber: bkashInfo.senderNumber,
    paymentStatus: bkashInfo.paymentStatus,
  };
}

/**
 * Build a helpful response asking for missing details
 */
export function generateMissingInfoPrompt(missing: string[], policy?: string, bkashNumber?: string): string {
  const parts: string[] = [];
  if (missing.includes('Customer Name')) parts.push('আপনার পূর্ণ নাম');
  if (missing.includes('11-digit Phone Number')) parts.push('১১ ডিজিটের সক্রিয় মোবাইল নম্বর (০১৭xxxxxxxx)');
  if (missing.includes('Delivery Address')) parts.push('সম্পূর্ণ ঠিকানা (বাসা/রোড নম্বর, থানা ও জেলা)');
  if (missing.includes('Product Details')) parts.push('প্রোডাক্টের নাম, সাইজ/কালার ও পরিমাণ');

  let policyNote = 'ঢাকার ভিতরে ডেলিভারি চার্জ ৮০ টাকা, ঢাকার বাইরে ১৫০ টাকা। ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে! 🛍️';
  if (policy === 'Advance Delivery Charge via bKash' && bkashNumber) {
    policyNote = `ঢাকার ভিতরে ডেলিভারি চার্জ ৮০ টাকা, ঢাকার বাইরে ১৩০ টাকা। অনুগ্রহ করে ডেলিভারি চার্জ আমাদের বিকাশ মার্চেন্ট নম্বরে (${bkashNumber}) সেন্ড মানি করে TrxID জানিয়ে দিন। বাকি টাকা ক্যাশ অন ডেলিভারিতে দিতে পারবেন! 💳`;
  }

  return `ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত করতে অনুগ্রহ করে নিচের তথ্যগুলো প্রদান করুন:\n\n${parts.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}\n\n${policyNote}`;
}
