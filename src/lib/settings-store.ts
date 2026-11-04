import fs from 'fs';
import path from 'path';

export interface AppSettings {
  geminiApiKey: string;
  openAiApiKey: string;
  metaAppId: string;
  metaAppSecret: string;
  metaPageId: string;
  metaPageAccessToken: string;
  metaVerifyToken: string;
  instagramAccountId: string;
  whatsappPhoneNumberId: string;
  whatsappBusinessAccountId: string;
  whatsappAccessToken: string;
  whatsappVerifyToken: string;
  // bKash Account Settings
  bkashNumber: string;
  bkashAccountType: 'Personal' | 'Agent' | 'Merchant';
  bkashPaymentPolicy: 'Full COD' | 'Advance Delivery Charge via bKash' | 'Full bKash Pre-payment';
  bkashAdvanceAmount: number;
  // SMS
  smsGateway: string;
  smsApiKey: string;
  smsSenderId: string;
  autoPilotActive: boolean;
}

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  metaAppId: '109283746592019',
  metaAppSecret: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
  metaPageId: 'page_bangla_commerce_01',
  metaPageAccessToken: 'EAAO...system_never_expiring_token_bd',
  metaVerifyToken: 'socialbazaar_meta_verify_token_2026',
  instagramAccountId: 'ig_bangla_biz_official',
  whatsappPhoneNumberId: '109876543210987',
  whatsappBusinessAccountId: 'waba_998877665544',
  whatsappAccessToken: 'EAAN...wa_permanent_token_2026',
  whatsappVerifyToken: 'socialbazaar_wa_token_2026',
  // Default bKash settings for BD commerce
  bkashNumber: '01799001122',
  bkashAccountType: 'Merchant',
  bkashPaymentPolicy: 'Advance Delivery Charge via bKash',
  bkashAdvanceAmount: 130,
  smsGateway: 'Greenweb BD',
  smsApiKey: '',
  smsSenderId: 'BanglaBot',
  autoPilotActive: true,
};

export function getAppSettings(): AppSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  try {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return DEFAULT_SETTINGS;
  }
}
