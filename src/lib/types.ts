export type Platform = 'facebook' | 'instagram' | 'whatsapp';

export type ConversationStatus = 
  | 'unread' 
  | 'replied' 
  | 'pending_order' 
  | 'ai_handled' 
  | 'order_closed' 
  | 'needs_human_review' 
  | 'bkash_paid';

export type ConversationIntent = 
  | 'Inquiry' 
  | 'Product Exploration' 
  | 'Negotiation/Questions' 
  | 'Checkout/Order' 
  | 'Order Confirmed';

export type SenderRole = 'customer' | 'agent' | 'bot';

export interface MessageAttachment {
  type: 'image' | 'video' | 'file' | 'audio';
  url: string;
  name?: string;
}

export interface Product {
  id: string;
  name: string;
  bengaliName?: string;
  price: number;
  regularPrice?: number;
  discount?: number;
  stock?: number;
  image: string;
  description: string;
  sku: string;
  inStock: boolean;
  category: string;
  rating: number;
  variants?: string[];
  badge?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: SenderRole;
  senderName?: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  messageType?: 'text' | 'mini_store_carousel' | 'product_card' | 'order_receipt' | 'bkash_prompt';
  productData?: Product | Product[];
  orderData?: Partial<Order>;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  platform: Platform;
  customerName: string;
  customerPhone?: string;
  customerAvatar: string;
  customerHandle?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: ConversationStatus;
  botActive: boolean;
  intent?: ConversationIntent;
  deliveryAddress?: {
    district?: string;
    thana?: string;
    fullAddress?: string;
  };
  productInterest?: string;
  assignedAgent?: string;
  source?: 'direct_message' | 'comment_to_dm' | 'whatsapp_cloud';
  commentPostId?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  image?: string;
  variant?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. BD-2026-1042
  conversationId?: string;
  platform: Platform | 'manual';
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    district: string;
    thana: string;
    fullAddress: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  // bKash payment verification fields
  payment_method?: 'COD' | 'bKash';
  bkash_sender_number?: string;
  bkash_trx_id?: string;
  payment_status?: 'Unpaid' | 'Pending Verification' | 'Paid';
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  smsSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordTrigger {
  id: string;
  title: string;
  keywords: string[];
  responseText: string;
  action: 'reply' | 'ask_order_details' | 'human_handoff' | 'send_mini_store';
  active: boolean;
  matchCount: number;
}

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface ScheduledPost {
  id: string;
  caption: string;
  platforms: Platform[];
  mediaUrls: string[];
  scheduledTime: string;
  status: PostStatus;
  createdAt: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface CaptionGenerationRequest {
  productName: string;
  keyFeatures: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
  language: 'bengali' | 'english' | 'banglish';
  tone: 'urgent_promotional' | 'casual_friendly' | 'storytelling_luxury';
}

export interface GeneratedCaptionResponse {
  captions: {
    id: number;
    title: string;
    content: string;
    callToAction: string;
  }[];
  reelTitles: string[];
  hashtags: {
    broad: string[];
    niche: string[];
    trending: string[];
  };
}

export interface ExtractedOrderData {
  customerName?: string;
  customerPhone?: string;
  district?: string;
  thana?: string;
  fullAddress?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  isComplete: boolean;
  missingFields: string[];
}

// Jadubot Features: Comment to DM Automation
export interface CommentAutomationRule {
  id: string;
  platform: 'facebook' | 'instagram';
  campaignName: string;
  postTitle: string;
  postThumbnail: string;
  keywords: string[];
  publicReplyTemplate: string;
  privateDmMessage: string;
  includeMiniStore: boolean;
  autoLikeComment: boolean;
  active: boolean;
  totalCommentsHandled: number;
  totalDmsSent: number;
  createdAt: string;
}

export interface CommentLog {
  id: string;
  ruleId: string;
  platform: 'facebook' | 'instagram';
  postTitle: string;
  commenterName: string;
  commentText: string;
  publicReplySent: string;
  dmSent: string;
  timestamp: string;
  conversationId: string;
}

// Jadubot Features: SMS Marketing & Notifications
export interface SmsGatewayConfig {
  gateway: 'Greenweb BD' | 'SSL Wireless' | 'MIM SMS' | 'BulkSMS BD';
  senderId: string;
  apiKey: string;
  balanceBDT: number;
  ratePerSms: number;
  enabled: boolean;
}

export interface SmsLog {
  id: string;
  orderId?: string;
  recipientPhone: string;
  recipientName: string;
  gateway: 'Greenweb BD' | 'SSL Wireless' | 'MIM SMS' | 'BulkSMS BD';
  senderId: string;
  messageText: string;
  status: 'delivered' | 'sent' | 'failed';
  costBDT: number;
  timestamp: string;
  trackingUrl?: string;
}
