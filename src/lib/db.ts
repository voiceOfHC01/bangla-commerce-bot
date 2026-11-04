import fs from 'fs';
import path from 'path';
import {
  Conversation,
  Message,
  Order,
  KeywordTrigger,
  ScheduledPost,
  ConversationStatus,
  Platform,
  OrderStatus,
  Product,
  CommentAutomationRule,
  CommentLog,
  SmsLog,
  SmsGatewayConfig,
} from './types';
import {
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  SEED_ORDERS,
  SEED_POSTS,
  SEED_PRODUCTS,
  SEED_COMMENT_RULES,
  SEED_COMMENT_LOGS,
  SEED_SMS_GATEWAY,
  SEED_SMS_LOGS,
} from './seed-data';
import { DEFAULT_KEYWORD_TRIGGERS } from './keyword-engine';

export interface DatabaseSchema {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  orders: Order[];
  triggers: KeywordTrigger[];
  posts: ScheduledPost[];
  products: Product[];
  commentRules: CommentAutomationRule[];
  commentLogs: CommentLog[];
  smsGateway: SmsGatewayConfig;
  smsLogs: SmsLog[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

function ensureDataDirectory(): void {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getInitialData(): DatabaseSchema {
  return {
    conversations: SEED_CONVERSATIONS,
    messages: SEED_MESSAGES,
    orders: SEED_ORDERS,
    triggers: DEFAULT_KEYWORD_TRIGGERS,
    posts: SEED_POSTS,
    products: SEED_PRODUCTS,
    commentRules: SEED_COMMENT_RULES,
    commentLogs: SEED_COMMENT_LOGS,
    smsGateway: SEED_SMS_GATEWAY,
    smsLogs: SEED_SMS_LOGS,
  };
}

export function readDb(): DatabaseSchema {
  ensureDataDirectory();
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    // Merge in any missing collections if upgraded
    let changed = false;
    if (!parsed.products) { parsed.products = SEED_PRODUCTS; changed = true; }
    if (!parsed.commentRules) { parsed.commentRules = SEED_COMMENT_RULES; changed = true; }
    if (!parsed.commentLogs) { parsed.commentLogs = SEED_COMMENT_LOGS; changed = true; }
    if (!parsed.smsGateway) { parsed.smsGateway = SEED_SMS_GATEWAY; changed = true; }
    if (!parsed.smsLogs) { parsed.smsLogs = SEED_SMS_LOGS; changed = true; }

    if (changed) {
      writeDb(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Error reading database file, returning default schema:', error);
    return getInitialData();
  }
}

export function writeDb(data: DatabaseSchema): void {
  ensureDataDirectory();
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// Conversation Operations
export async function getConversations(filter?: {
  platform?: Platform | 'all';
  status?: ConversationStatus | 'all';
  search?: string;
}): Promise<Conversation[]> {
  const db = readDb();
  let list = db.conversations;

  if (filter?.platform && filter.platform !== 'all') {
    list = list.filter((c) => c.platform === filter.platform);
  }

  if (filter?.status && filter.status !== 'all') {
    list = list.filter((c) => c.status === filter.status);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        (c.customerPhone && c.customerPhone.includes(q)) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }

  return list.sort(
    (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const db = readDb();
  return db.conversations.find((c) => c.id === id) || null;
}

export async function updateConversation(
  id: string,
  updates: Partial<Conversation>
): Promise<Conversation | null> {
  const db = readDb();
  const index = db.conversations.findIndex((c) => c.id === id);
  if (index === -1) return null;

  db.conversations[index] = { ...db.conversations[index], ...updates };
  writeDb(db);
  return db.conversations[index];
}

export async function createConversation(conv: Conversation): Promise<Conversation> {
  const db = readDb();
  db.conversations.unshift(conv);
  if (!db.messages[conv.id]) {
    db.messages[conv.id] = [];
  }
  writeDb(db);
  return conv;
}

// Message Operations
export async function getMessages(conversationId: string): Promise<Message[]> {
  const db = readDb();
  return db.messages[conversationId] || [];
}

export async function addMessage(message: Message): Promise<Message> {
  const db = readDb();
  if (!db.messages[message.conversationId]) {
    db.messages[message.conversationId] = [];
  }
  db.messages[message.conversationId].push(message);

  const convIndex = db.conversations.findIndex((c) => c.id === message.conversationId);
  if (convIndex !== -1) {
    db.conversations[convIndex].lastMessage = message.text;
    db.conversations[convIndex].lastMessageTime = message.timestamp;
    if (message.sender === 'customer') {
      db.conversations[convIndex].unreadCount = (db.conversations[convIndex].unreadCount || 0) + 1;
      if (db.conversations[convIndex].status === 'replied') {
        db.conversations[convIndex].status = 'unread';
      }
    } else {
      db.conversations[convIndex].unreadCount = 0;
      if (db.conversations[convIndex].status === 'unread') {
        db.conversations[convIndex].status = 'replied';
      }
    }
  }

  writeDb(db);
  return message;
}

// Order Operations
export async function getOrders(filter?: {
  status?: OrderStatus | 'all';
  search?: string;
  platform?: string;
}): Promise<Order[]> {
  const db = readDb();
  let list = db.orders;

  if (filter?.status && filter.status !== 'all') {
    list = list.filter((o) => o.status === filter.status);
  }

  if (filter?.platform && filter.platform !== 'all') {
    list = list.filter((o) => o.platform === filter.platform);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.deliveryAddress.district.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = readDb();
  return db.orders.find((o) => o.id === id) || null;
}

export async function createOrder(order: Order): Promise<Order> {
  const db = readDb();
  db.orders.unshift(order);
  writeDb(db);
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const db = readDb();
  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  db.orders[index].status = status;
  db.orders[index].updatedAt = new Date().toISOString();
  writeDb(db);
  return db.orders[index];
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const db = readDb();
  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  db.orders[index] = { ...db.orders[index], ...updates, updatedAt: new Date().toISOString() };
  writeDb(db);
  return db.orders[index];
}

export async function deleteOrder(id: string): Promise<boolean> {
  const db = readDb();
  const initialLength = db.orders.length;
  db.orders = db.orders.filter((o) => o.id !== id);
  if (db.orders.length !== initialLength) {
    writeDb(db);
    return true;
  }
  return false;
}

// Product Operations (Mini Store)
export async function getProducts(): Promise<Product[]> {
  const db = readDb();
  return db.products || SEED_PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = readDb();
  return (db.products || SEED_PRODUCTS).find((p) => p.id === id) || null;
}

// Comment Automation Rules & Logs (Comment-to-DM)
export async function getCommentRules(): Promise<CommentAutomationRule[]> {
  const db = readDb();
  return db.commentRules || SEED_COMMENT_RULES;
}

export async function saveCommentRule(rule: CommentAutomationRule): Promise<CommentAutomationRule> {
  const db = readDb();
  if (!db.commentRules) db.commentRules = [];
  const idx = db.commentRules.findIndex((r) => r.id === rule.id);
  if (idx >= 0) {
    db.commentRules[idx] = rule;
  } else {
    db.commentRules.push(rule);
  }
  writeDb(db);
  return rule;
}

export async function deleteCommentRule(id: string): Promise<boolean> {
  const db = readDb();
  if (!db.commentRules) return false;
  const initial = db.commentRules.length;
  db.commentRules = db.commentRules.filter((r) => r.id !== id);
  if (db.commentRules.length !== initial) {
    writeDb(db);
    return true;
  }
  return false;
}

export async function getCommentLogs(): Promise<CommentLog[]> {
  const db = readDb();
  return (db.commentLogs || SEED_COMMENT_LOGS).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function addCommentLog(log: CommentLog): Promise<CommentLog> {
  const db = readDb();
  if (!db.commentLogs) db.commentLogs = [];
  db.commentLogs.unshift(log);

  // Increment rule statistics
  if (db.commentRules) {
    const rIdx = db.commentRules.findIndex((r) => r.id === log.ruleId);
    if (rIdx >= 0) {
      db.commentRules[rIdx].totalCommentsHandled = (db.commentRules[rIdx].totalCommentsHandled || 0) + 1;
      db.commentRules[rIdx].totalDmsSent = (db.commentRules[rIdx].totalDmsSent || 0) + 1;
    }
  }

  writeDb(db);
  return log;
}

// SMS Gateway & SMS Logs
export async function getSmsConfig(): Promise<SmsGatewayConfig> {
  const db = readDb();
  return db.smsGateway || SEED_SMS_GATEWAY;
}

export async function updateSmsConfig(config: Partial<SmsGatewayConfig>): Promise<SmsGatewayConfig> {
  const db = readDb();
  db.smsGateway = { ...(db.smsGateway || SEED_SMS_GATEWAY), ...config };
  writeDb(db);
  return db.smsGateway;
}

export async function getSmsLogs(): Promise<SmsLog[]> {
  const db = readDb();
  return (db.smsLogs || SEED_SMS_LOGS).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function addSmsLog(log: SmsLog): Promise<SmsLog> {
  const db = readDb();
  if (!db.smsLogs) db.smsLogs = [];
  db.smsLogs.unshift(log);

  // Deduct balance from SMS gateway
  if (db.smsGateway) {
    db.smsGateway.balanceBDT = Math.max(0, (db.smsGateway.balanceBDT || 500) - (log.costBDT || 0.35));
  }

  writeDb(db);
  return log;
}

// Keyword Trigger Operations
export async function getKeywordTriggers(): Promise<KeywordTrigger[]> {
  const db = readDb();
  return db.triggers;
}

export async function saveKeywordTrigger(trigger: KeywordTrigger): Promise<KeywordTrigger> {
  const db = readDb();
  const index = db.triggers.findIndex((t) => t.id === trigger.id);
  if (index >= 0) {
    db.triggers[index] = trigger;
  } else {
    db.triggers.push(trigger);
  }
  writeDb(db);
  return trigger;
}

export async function incrementTriggerMatch(triggerId: string): Promise<void> {
  const db = readDb();
  const index = db.triggers.findIndex((t) => t.id === triggerId);
  if (index >= 0) {
    db.triggers[index].matchCount = (db.triggers[index].matchCount || 0) + 1;
    writeDb(db);
  }
}

// Scheduled Posts
export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  const db = readDb();
  return db.posts.sort(
    (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );
}

export async function createScheduledPost(post: ScheduledPost): Promise<ScheduledPost> {
  const db = readDb();
  db.posts.push(post);
  writeDb(db);
  return post;
}

export async function updateScheduledPost(
  id: string,
  updates: Partial<ScheduledPost>
): Promise<ScheduledPost | null> {
  const db = readDb();
  const index = db.posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  db.posts[index] = { ...db.posts[index], ...updates };
  writeDb(db);
  return db.posts[index];
}

export async function deleteScheduledPost(id: string): Promise<boolean> {
  const db = readDb();
  const initialLen = db.posts.length;
  db.posts = db.posts.filter((p) => p.id !== id);
  if (db.posts.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}
