import CryptoJS from 'crypto-js';

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || 'default-secret-key';

/**
 * Encrypt data before storing in localStorage
 */
export const encryptData = (data: any): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, STORAGE_KEY).toString();
};

/**
 * Decrypt data from localStorage
 */
export const decryptData = <T>(encryptedData: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, STORAGE_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) return null;
    return JSON.parse(decryptedString) as T;
  } catch {
    return null;
  }
};

/**
 * Store encrypted data in localStorage
 */
export const setSecureItem = (key: string, data: any): void => {
  if (typeof window === 'undefined') return;
  try {
    const encrypted = encryptData(data);
    localStorage.setItem(key, encrypted);
  } catch {
    // Ignore storage errors
  }
};

/**
 * Get and decrypt data from localStorage
 */
export const getSecureItem = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return decryptData<T>(encrypted);
  } catch {
    return null;
  }
};

/**
 * Remove item from localStorage
 */
export const removeSecureItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user_data',
} as const;
