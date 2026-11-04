import {
  getCommentRules,
  addCommentLog,
  getConversations,
  createConversation,
  addMessage,
  getProducts,
} from './db';
import { CommentLog, Message, Platform } from './types';

export interface ProcessCommentParams {
  platform: 'facebook' | 'instagram';
  postTitle?: string;
  commenterName: string;
  commentText: string;
  commenterHandle?: string;
  commenterAvatar?: string;
}

export interface CommentAutomationResult {
  matched: boolean;
  ruleTitle?: string;
  publicReply: string;
  privateDm: string;
  conversationId: string;
  miniStoreIncluded: boolean;
  log: CommentLog;
}

export async function processCommentAutomation(
  params: ProcessCommentParams
): Promise<CommentAutomationResult> {
  const {
    platform,
    postTitle = platform === 'facebook'
      ? '🌙 ঈদ এক্সক্লুসিভ পাঞ্জাবি কালেকশন ২০২৬! (Post #FB-8821)'
      : '✨ Handloom Jamdani Reels Video (Post #IG-3319)',
    commenterName,
    commentText,
    commenterHandle = `@${commenterName.toLowerCase().replace(/\s+/g, '.')}`,
    commenterAvatar = platform === 'facebook'
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  } = params;

  const rules = await getCommentRules();
  const lowerText = commentText.toLowerCase().trim();

  // Find matching rule for this platform and keywords
  let matchedRule = rules.find((r) => {
    if (!r.active || r.platform !== platform) return false;
    return r.keywords.some((kw) => lowerText.includes(kw.toLowerCase().trim()));
  });

  // Fallback to first active rule for this platform
  if (!matchedRule) {
    matchedRule = rules.find((r) => r.active && r.platform === platform) || rules[0];
  }

  // Format public comment reply
  const publicReply = matchedRule.publicReplyTemplate.replace(
    /@\[username\]/g,
    `@${commenterName}`
  );

  // Format private DM
  const privateDm = matchedRule.privateDmMessage.replace(/\[Name\]/g, commenterName);

  // Find or create conversation in Unified Inbox
  const conversations = await getConversations();
  let conv = conversations.find(
    (c) =>
      c.platform === platform &&
      (c.customerHandle === commenterHandle || c.customerName === commenterName)
  );

  if (!conv) {
    conv = {
      id: `conv-cdm-${Date.now()}`,
      platform,
      customerName: commenterName,
      customerHandle: commenterHandle,
      customerAvatar: commenterAvatar,
      lastMessage: privateDm,
      lastMessageTime: new Date().toISOString(),
      unreadCount: 1,
      status: 'unread',
      botActive: true,
      source: 'comment_to_dm',
      commentPostId: postTitle,
    };
    await createConversation(conv);
  }

  // 1. Add notification message about the public comment
  const commentNoticeMessage: Message = {
    id: `msg-comm-${Date.now()}-1`,
    conversationId: conv.id,
    sender: 'customer',
    senderName: commenterName,
    text: `💬 [Commented on Post: "${postTitle}"]:\n"${commentText}"`,
    timestamp: new Date().toISOString(),
    status: 'read',
  };
  await addMessage(commentNoticeMessage);

  // 2. Add automated private DM reply
  const products = await getProducts();
  const dmMessage: Message = {
    id: `msg-comm-${Date.now()}-2`,
    conversationId: conv.id,
    sender: 'bot',
    senderName: 'JaduBot Comment Engine 🤖',
    text: `⚡ [Comment-to-DM Auto-Sent]\nPublic Reply: "${publicReply}"\n\n${privateDm}`,
    timestamp: new Date().toISOString(),
    status: 'delivered',
    messageType: matchedRule.includeMiniStore ? 'mini_store_carousel' : 'text',
    productData: matchedRule.includeMiniStore ? products.slice(0, 4) : undefined,
  };
  await addMessage(dmMessage);

  // 3. Record log
  const log: CommentLog = {
    id: `clog-${Date.now()}`,
    ruleId: matchedRule.id,
    platform,
    postTitle,
    commenterName,
    commentText,
    publicReplySent: publicReply,
    dmSent: privateDm,
    timestamp: new Date().toISOString(),
    conversationId: conv.id,
  };
  await addCommentLog(log);

  return {
    matched: true,
    ruleTitle: matchedRule.campaignName,
    publicReply,
    privateDm,
    conversationId: conv.id,
    miniStoreIncluded: matchedRule.includeMiniStore,
    log,
  };
}
