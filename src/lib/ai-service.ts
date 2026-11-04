import { CaptionGenerationRequest, GeneratedCaptionResponse, Product, ConversationIntent } from './types';
import { getAppSettings } from './settings-store';

/**
 * AI Caption, Title & Hashtag Generator
 */
export async function generateSocialCaptions(
  request: CaptionGenerationRequest
): Promise<GeneratedCaptionResponse> {
  const { productName, keyFeatures, platform, language, tone } = request;
  const settings = getAppSettings();
  const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY || '';

  if (apiKey) {
    try {
      const prompt = `You are an elite Bangladeshi e-commerce copywriter & social media automation expert.
Generate high-converting social media content for:
Product Name: ${productName}
Key Features/Offer: ${keyFeatures}
Target Platform: ${platform}
Language: ${language} (bengali, english, or banglish)
Tone: ${tone}

Return ONLY valid JSON with no markdown backticks, in this exact format:
{
  "captions": [
    {
      "id": 1,
      "title": "Short catchy angle name",
      "content": "Engaging full caption with emojis and persuasive copy",
      "callToAction": "Direct action CTA"
    },
    {
      "id": 2,
      "title": "Second angle",
      "content": "Second full caption",
      "callToAction": "Second CTA"
    },
    {
      "id": 3,
      "title": "Third angle",
      "content": "Third full caption",
      "callToAction": "Third CTA"
    }
  ],
  "reelTitles": [
    "Hook 1 for Reel/Shorts",
    "Hook 2 for Reel/Shorts",
    "Hook 3 for Reel/Shorts"
  ],
  "hashtags": {
    "broad": ["#tag1", "#tag2", "#tag3", "#tag4"],
    "niche": ["#niche1", "#niche2", "#niche3", "#niche4"],
    "trending": ["#trend1", "#trend2", "#trend3"]
  }
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const parsed = JSON.parse(candidate);
          return parsed as GeneratedCaptionResponse;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, using fallback generator:', err);
    }
  }

  return getFallbackGeneratedCaptions(request);
}

function getFallbackGeneratedCaptions(request: CaptionGenerationRequest): GeneratedCaptionResponse {
  const { productName, keyFeatures } = request;

  return {
    captions: [
      {
        id: 1,
        title: '🔥 ধামাকা অফার & লিমিটেড স্টক',
        content: `ঈদ ও বৈশাখ উপলক্ষে আমাদের হট-সেলিং ${productName} এখন বিশেষ ছাড়ে পাওয়া যাচ্ছে! 🌟\n\nকেন আমাদের থেকে নিবেন:\n✨ ${keyFeatures}\n✨ ১০০% অরিজিনাল কোয়ালিটি নিশ্চয়তা\n✨ সমগ্র বাংলাদেশে দ্রুততম ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধের সুবিধা)\n\n⚡ সীমিত স্টক! স্টক শেষ হওয়ার আগেই আপনার পছন্দের প্রোডাক্টটি অর্ডার করুন।`,
        callToAction: '👉 অর্ডার করতে ইনবক্সে মেসেজ দিন অথবা "অর্ডার" লিখে কমেন্ট করুন!',
      },
      {
        id: 2,
        title: '💎 প্রিমিয়াম কোয়ালিটি লাইফস্টাইল',
        content: `আপনার প্রতিদিনের লাইফস্টাইলে প্রিমিয়াম লুক আনুন আমাদের এক্সক্লুসিভ ${productName} দিয়ে। 😍\n\nহাইলাইটস:\n${keyFeatures}\n\nঢাকা ও ঢাকার বাইরে হোম ডেলিভারি এভেইলেবল।\n🚚 ২৪ থেকে ৪৮ ঘণ্টার মধ্যে সুপারফাস্ট ডেলিভারি!`,
        callToAction: '📩 এখনই মেসেজ দিয়ে আপনার সাইজ ও কালার কনফার্ম করুন!',
      },
      {
        id: 3,
        title: '⚡ স্পেশাল ডিসকাউন্ট ডিল',
        content: `বিশেষ অফারে ${productName} পাচ্ছেন সেরা দামে! 🔥\n\nবৈশিষ্ট্য:\n✅ ${keyFeatures}\n✅ ক্যাশ অন ডেলিভারি সুবিধা\n✅ ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি!\n\nদেরি না করে আজই নিয়ে নিন।`,
        callToAction: '🛍️ অর্ডার কনফার্ম করতে সরাসরি ইনবক্স করুন!',
      },
    ],
    reelTitles: [
      `এতো কম দামে ${productName} কীভাবে সম্ভব? দেখে নিন! 👀`,
      `কেন ${productName} আপনার এখনই কেনা উচিত? সেরা ৩টি কারণ! 🔥`,
      `আনবক্সিং ও রিভিউ: ${productName} আসল না নকল? 📦`,
    ],
    hashtags: {
      broad: ['#BanglaCommerce', '#OnlineShoppingBD', '#DhakaTrends', '#SmartDealsBD'],
      niche: [`#${productName.replace(/\s+/g, '')}`, '#BestPriceBD', '#FCommerceBD'],
      trending: ['#ViralBD', '#ForYouBangladesh', '#TrendingNow'],
    },
  };
}

/**
 * Autonomous Deal-Closing Sales Agent Engine
 * Handles Bengali/Banglish conversation, intent state progression,
 * stock verification, negotiation, bKash payments & order closing.
 */
export async function generateSmartChatReply(params: {
  customerMessage: string;
  customerName?: string;
  previousMessages?: { sender: string; text: string }[];
  platform: string;
  products?: Product[];
  intent?: ConversationIntent;
}): Promise<string> {
  const { customerMessage, customerName, previousMessages = [], products = [], intent } = params;
  const settings = getAppSettings();
  const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY || '';

  // Stock and Catalog Summary for the AI
  const catalogSummary = products
    .map(
      (p) =>
        `- ${p.name} (${p.bengaliName || ''}): Price ৳${p.price} (Regular ৳${p.regularPrice || p.price + 300}), Stock: ${p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}`
    )
    .join('\n');

  if (apiKey) {
    try {
      const prompt = `You are "BanglaBot", an expert Bengali/Banglish AI Deal-Closing Sales Agent for a premier Bangladeshi e-commerce brand.
You talk politely, enthusiastically, and persuasively in natural Bengali/Banglish with warm Bengali hospitality ("জি ভাইয়া/আপু", "অবশ্যই", "আজকের মধ্যে অর্ডার করলে কালকেই পেয়ে যাবেন").

Current Context:
- Customer Name: ${customerName || 'সম্মানিত কাস্টমার'}
- Detected Intent: ${intent || 'Product Exploration'}
- Customer Message: "${customerMessage}"

Our Live Product Catalog & Stock:
${catalogSummary || 'Executive Panjabi ৳1450, Jamdani Sharee ৳3800, TWS Earbuds ৳1450, Honey 1kg ৳850, Leather Wallet ৳950'}

Store Policies:
- Delivery charge: Dhaka ৳80 (24-48 hrs), Outside Dhaka ৳130-150 (2-3 days).
- Payment Policy: ${settings.bkashPaymentPolicy}
- Our bKash Number: ${settings.bkashNumber} (${settings.bkashAccountType})
${
  settings.bkashPaymentPolicy === 'Advance Delivery Charge via bKash'
    ? `- For outside Dhaka, ask customer politely to send ৳${settings.bkashAdvanceAmount || 130} delivery charge via bKash to our number ${settings.bkashNumber} and share the TrxID & sender number. The rest is Cash on Delivery.`
    : `- Full Cash on Delivery available, or they can pay via bKash ${settings.bkashNumber}.`
}

Sales Rules:
1. Always check stock: if out of stock, politely offer an alternative; if in stock, emphasize quality, limited stock, and offer to book now.
2. If customer asks for discount, offer free delivery or mention this is already a discounted flash-deal.
3. If customer wants to order, ask for: Full Name, 11-digit Phone (01xxxxxxxxx), and Full Address with Thana & District.
4. If customer shares a bKash TrxID, thank them, confirm that payment verification is logged, and state that their order is now locked and ready for packaging.
5. Answer in warm, conversational Bengali or Banglish matching the customer's language. Keep answers under 4-5 sentences.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate.trim();
      }
    } catch (err) {
      console.warn('Gemini chat reply failed, using state-based Banglish sales engine:', err);
    }
  }

  // High-converting State-Based Banglish Sales Engine (Offline & Fallback)
  const lower = customerMessage.toLowerCase();
  const cName = customerName ? customerName : 'প্রিয় কাস্টমার';

  // 1. bKash payment / TrxID received
  if (/trx|trxid|transaction|বিকাশ|টাকা পাঠিয়েছি|taka pathaisi|paid/i.test(lower)) {
    return `🎉 ধন্যবাদ ${cName}! আপনার বিকাশ পেমেন্ট তথ্য সফলভাবে গ্রহণ করা হয়েছে। আমাদের টিম ট্রানজেকশন ভেরিফাই করে পার্সেলটি প্যাকেজিংয়ের জন্য পাঠিয়ে দিচ্ছে। খুব শীঘ্রই আপনি ট্র্যাকিং লিংক সহ কনফার্মেশন SMS পেয়ে যাবেন! 🚚📦`;
  }

  // 2. Intent: Negotiation / Discount
  if (intent === 'Negotiation/Questions' || /discount|ছাড়|কম|kom|koto kom|offer|dam/i.test(lower)) {
    return `জি ${cName}, আমাদের প্রোডাক্টগুলো ১০০% অরিজিনাল প্রিমিয়াম কোয়ালিটির এবং বর্তমান মূল্যটি অলরেডি মেগা ডিসকাউন্টে দেওয়া আছে! 🔥 আজই অর্ডার কনফার্ম করলে আপনি দ্রুত ডেলিভারি পাবেন। আপনার কি ডেলিভারি ঢাকার ভেতরে নাকি বাইরে লাগবে? 🛍️`;
  }

  // 3. Intent: Checkout / Order capture
  if (intent === 'Checkout/Order' || /order|অর্ডার|নিতে চাই|kinbo|confirm/i.test(lower)) {
    let paymentText = 'ক্যাশ অন ডেলিভারিতে নিতে পারবেন!';
    if (settings.bkashPaymentPolicy === 'Advance Delivery Charge via bKash') {
      paymentText = `ডেলিভারি চার্জ ৳${settings.bkashAdvanceAmount || 130} আমাদের বিকাশ মার্চেন্ট নম্বরে (${settings.bkashNumber}) পাঠিয়ে TrxID জানালে বাকি টাকা ক্যাশ অন ডেলিভারিতে দিতে পারবেন!`;
    }
    return `দারুণ পছন্দ ${cName}! অর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার:
১. পূর্ণ নাম
২. ১১ ডিজিটের মোবাইল নম্বর
৩. সম্পূর্ণ ঠিকানা (থানা ও জেলা সহ)
লিখে পাঠিয়ে দিন। ${paymentText} 🚚✨`;
  }

  // 4. Intent: Product Exploration & Stock checking
  if (intent === 'Product Exploration' || /size|সাইজ|color|কালার|stock|আছে|available/i.test(lower)) {
    return `জি ${cName}, আমাদের এই প্রোডাক্টের সকল কালার ও রেগুলার সাইজ এই মুহূর্তে স্টকে সম্পূর্ণ রেডি আছে! কাপড় এবং ফিনিশিং ১০০% কোয়ালিটি নিশ্চিত। স্টক দ্রুত শেষ হয়ে যাচ্ছে, আপনার কোন সাইজ বা কালারটি লাগবে জানাবেন কি? 😊`;
  }

  // 5. Default Inquiry / Greetings
  return `আসসালামু আলাইকুম ${cName}! আমাদের সোশ্যাল কমার্স স্টোরে আপনাকে স্বাগতম। আমাদের সব প্রিমিয়াম প্রোডাক্টে ক্যাশ অন ডেলিভারি সুবিধা চলছে। আপনি কোন প্রোডাক্টটি দেখতে চান বা অর্ডার করতে চান জানাবেন কি? 🛍️✨`;
}
