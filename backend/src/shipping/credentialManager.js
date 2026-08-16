import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { logger } from '../utils/logger.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits for GCM

/**
 * Validates that the encryption key is present and correctly sized (32 bytes).
 */
function getEncryptionKey() {
    const keyStr = process.env.CREDENTIAL_ENCRYPTION_KEY;
    if (!keyStr) {
        throw new Error('CREDENTIAL_ENCRYPTION_KEY is missing from environment. Cannot process API credentials.');
    }
    // Pad or truncate to 32 bytes for AES-256
    const key = Buffer.from(keyStr, 'utf-8');
    if (key.length === 32) return key;
    
    const paddedKey = Buffer.alloc(32);
    key.copy(paddedKey);
    return paddedKey;
}

/**
 * Encrypts a plain text string.
 * Format: iv(hex):authTag(hex):encryptedData(hex)
 */
function encrypt(text) {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted string.
 */
function decrypt(encryptedText) {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted format.');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Gets the active Velocity credentials (username + password).
 * Priority: 
 * 1. Database encrypted credentials (active=true)
 * 2. .env VELOCITY_USERNAME + VELOCITY_PASSWORD (fallback for dev)
 * 
 * Throws if neither exists.
 */
export async function getVelocityCredentials() {
    try {
        const { data, error } = await supabaseAdmin
            .from('shipping_credentials')
            .select('encrypted_username, encrypted_api_key, shipping_providers!inner(code)')
            .eq('active', true)
            .eq('shipping_providers.code', 'velocity')
            .single();

        if (data) {
            // New format: both username and password stored
            if (data.encrypted_username && data.encrypted_api_key) {
                return {
                    username: decrypt(data.encrypted_username),
                    password: decrypt(data.encrypted_api_key)
                };
            }
            // Legacy fallback: only api_key stored (treated as password, no username)
            if (data.encrypted_api_key) {
                logger.warn('Legacy credential format detected (API key only). Please update to username+password via admin panel.');
                return null;
            }
        }
    } catch (err) {
        if (err.code !== 'PGRST116') {
            logger.warn('Error reading credentials from database, checking env fallback', { message: err.message });
        }
    }

    // Env var fallback (development only)
    const envUser = process.env.VELOCITY_USERNAME;
    const envPass = process.env.VELOCITY_PASSWORD;
    if (envUser && envPass) {
        return { username: envUser, password: envPass };
    }

    return null;
}

/**
 * Saves new Velocity credentials (username + password) to the database,
 * deactivating previous ones.
 */
export async function saveVelocityCredentials(username, password, adminId) {
    if (!username || username.trim() === '') {
        throw new Error('Username cannot be empty.');
    }
    if (!password || password.trim() === '') {
        throw new Error('Password cannot be empty.');
    }

    const encryptedUsername = encrypt(username.trim());
    const encryptedPassword = encrypt(password.trim());
    const lastFour = username.trim().slice(-4).padStart(4, '0');

    // Get velocity provider id
    const { data: providerData, error: providerError } = await supabaseAdmin
        .from('shipping_providers')
        .select('id')
        .eq('code', 'velocity')
        .single();
        
    if (providerError || !providerData) {
        throw new Error('Velocity provider not found in database.');
    }
    
    const providerId = providerData.id;

    // Deactivate existing
    await supabaseAdmin
        .from('shipping_credentials')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('provider_id', providerId)
        .eq('active', true);

    // Insert new
    const { data, error } = await supabaseAdmin
        .from('shipping_credentials')
        .insert([{
            provider_id: providerId,
            encrypted_username: encryptedUsername,
            encrypted_api_key: encryptedPassword,
            key_last_four: lastFour,
            active: true,
            created_by_admin_id: adminId,
            updated_by_admin_id: adminId
        }])
        .select('id')
        .single();

    if (error) {
        throw error;
    }

    logger.info(`Velocity credentials updated by admin ${adminId}`);
    return data;
}

/**
 * Updates the test status of the active credential.
 */
export async function updateCredentialTestStatus(status) {
    const { data: providerData } = await supabaseAdmin
        .from('shipping_providers')
        .select('id')
        .eq('code', 'velocity')
        .single();
        
    if (!providerData) return;

    await supabaseAdmin
        .from('shipping_credentials')
        .update({
            test_status: status,
            last_tested_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('provider_id', providerData.id)
        .eq('active', true);
}
