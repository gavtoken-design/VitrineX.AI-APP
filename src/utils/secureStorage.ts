/**
 * SecureStorage Utility
 * Uses Web Crypto API to encrypt sensitive data before storing in localStorage.
 * Generates a device-specific key for encryption.
 */

const ALGORITHM = 'AES-GCM';
const KEY_STORAGE_NAME = 'vitrinex_secure_cek';

// Helper: Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Helper: Convert Hex String to ArrayBuffer
function hexToBuffer(hex: string): ArrayBuffer {
    const tokens = hex.match(/.{1,2}/g);
    if (!tokens) return new ArrayBuffer(0);
    return new Uint8Array(tokens.map(byte => parseInt(byte, 16))).buffer;
}

class SecureStorageImpl {
    private key: CryptoKey | null = null;

    private async getEncryptionKey(): Promise<CryptoKey> {
        if (this.key) return this.key;

        // Try to load existing key material from localStorage (simulated persistence for demo)
        // In a real high-security app, this would be derived from a user password or PIN.
        // For this demo, we generate a random key and store it (obfuscated) to allow persistence across reloads.
        // NOTE: Storing the key next to the lock is not "true" security against a device compromise,
        // but protects against casual XSS/Inspection scanning for plain text "API_KEY" strings.

        let rawKey = localStorage.getItem(KEY_STORAGE_NAME);

        if (!rawKey) {
            const newKey = await window.crypto.subtle.generateKey(
                { name: ALGORITHM, length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            const exported = await window.crypto.subtle.exportKey('jwk', newKey);
            localStorage.setItem(KEY_STORAGE_NAME, JSON.stringify(exported));
            this.key = newKey;
            return newKey;
        }

        try {
            const jwk = JSON.parse(rawKey);
            this.key = await window.crypto.subtle.importKey(
                'jwk',
                jwk,
                { name: ALGORITHM, length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            return this.key;
        } catch (e) {
            console.error('Failed to recover secure key, generating new one. Data loss may occur.', e);
            localStorage.removeItem(KEY_STORAGE_NAME);
            return this.getEncryptionKey();
        }
    }

    async setItem(key: string, value: any): Promise<void> {
        try {
            const cryptoKey = await this.getEncryptionKey();
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encodedValue = new TextEncoder().encode(JSON.stringify(value));

            const encryptedContent = await window.crypto.subtle.encrypt(
                { name: ALGORITHM, iv },
                cryptoKey,
                encodedValue
            );

            const payload = {
                iv: bufferToHex(iv.buffer),
                data: bufferToHex(encryptedContent)
            };

            localStorage.setItem(key, JSON.stringify(payload));
        } catch (e) {
            console.error('SecureStorage Set Error:', e);
            throw new Error('Failed to encrypt data');
        }
    }

    async getItem<T>(key: string): Promise<T | null> {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        try {
            // Attempt to parse as encrypted payload
            const payload = JSON.parse(raw);

            // Legacy/Migration check: If it's a plain array or object not matching our schema, return it directly
            if (!payload.iv || !payload.data) {
                return payload as T;
            }

            const cryptoKey = await this.getEncryptionKey();
            const iv = hexToBuffer(payload.iv);
            const data = hexToBuffer(payload.data);

            const decryptedContent = await window.crypto.subtle.decrypt(
                { name: ALGORITHM, iv },
                cryptoKey,
                data
            );

            const decodedString = new TextDecoder().decode(decryptedContent);
            return JSON.parse(decodedString) as T;
        } catch (e) {
            console.warn('SecureStorage: Failed to decrypt or parse item. Returning null or legacy value.', e);
            // Fallback: try filtering for unencrypted legacy data if JSON parse succeeded but decrypt failed? 
            // Ideally we return null to be safe.
            return null;
        }
    }

    async removeItem(key: string): Promise<void> {
        localStorage.removeItem(key);
    }
}

export const SecureStorage = new SecureStorageImpl();
