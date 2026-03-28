/**
 * Telegram WebApp API Type Declarations (API 8.0 compatible)
 * @see https://core.telegram.org/bots/webapps
 */

export {};

interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramWebAppChat {
  id: number;
  type: string;
  title: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  receiver?: TelegramWebAppUser;
  chat?: TelegramWebAppChat;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

interface TelegramBackButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isProgressVisible: boolean;
  isActive: boolean;
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: {
    text?: string;
    color?: string;
    text_color?: string;
    is_active?: boolean;
    is_visible?: boolean;
  }): void;
}

interface TelegramSecondaryButton extends TelegramMainButton {
  position: 'top' | 'left' | 'right' | 'bottom';
  hasShineEffect: boolean;
  setParams(params: {
    text?: string;
    color?: string;
    text_color?: string;
    is_active?: boolean;
    is_visible?: boolean;
    has_shine_effect?: boolean;
    position?: 'top' | 'left' | 'right' | 'bottom';
  }): void;
}

interface TelegramSettingsButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: (err: Error | null, success: boolean) => void): void;
  getItem(key: string, callback: (err: Error | null, value: string | null) => void): void;
  getItems(keys: string[], callback: (err: Error | null, values: Record<string, string>) => void): void;
  removeItem(key: string, callback?: (err: Error | null, success: boolean) => void): void;
  removeItems(keys: string[], callback?: (err: Error | null, success: boolean) => void): void;
  getKeys(callback: (err: Error | null, keys: string[]) => void): void;
}

interface TelegramBiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: 'fingerprint' | 'face' | 'unknown';
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  deviceId: string;
  init(callback?: () => void): void;
  requestAccess(params: { reason?: string }, callback?: (granted: boolean) => void): void;
  authenticate(params: { reason?: string }, callback?: (success: boolean, token?: string) => void): void;
  updateBiometricToken(token: string, callback?: (success: boolean) => void): void;
  openSettings(): void;
}

interface TelegramSafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramWebAppInitData;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  isFullscreen: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  safeAreaInset: TelegramSafeAreaInset;
  contentSafeAreaInset: TelegramSafeAreaInset;
  
  BackButton: TelegramBackButton;
  MainButton: TelegramMainButton;
  SecondaryButton: TelegramSecondaryButton;
  SettingsButton: TelegramSettingsButton;
  HapticFeedback: TelegramHapticFeedback;
  CloudStorage: TelegramCloudStorage;
  BiometricManager: TelegramBiometricManager;

  ready(): void;
  expand(): void;
  close(): void;
  requestFullscreen(): void;
  exitFullscreen(): void;
  lockOrientation(): void;
  unlockOrientation(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  enableVerticalSwipes(): void;
  disableVerticalSwipes(): void;
  onEvent(eventType: string, eventHandler: (params?: any) => void): void;
  offEvent(eventType: string, eventHandler: (params?: any) => void): void;
  sendData(data: string): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  shareToStory(media_url: string, params?: { text?: string; widget_link?: { url: string; name?: string } }): void;
  shareMessage(prepared_id: string, callback?: (success: boolean) => void): void;
  setEmojiStatus(custom_emoji_id: string, params?: { duration?: number }, callback?: (success: boolean) => void): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (sent: boolean) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  showScanQrPopup(params: {
    text?: string;
  }, callback?: (data: string) => void): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (data: string) => void): void;
  invokeCustomMethod(method: string, params?: object, callback?: (result: object) => void): void;
  addToHomeScreen(): void;
  checkHomeScreenStatus(callback?: (status: 'unsupported' | 'unknown' | 'added' | 'missed') => void): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
