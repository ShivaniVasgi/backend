const crypto = require('crypto');
const fs = require('fs');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'); // 32 chars
const IV_LENGTH = 16; 

const encryptBuffer = (buffer) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
};

const decryptBuffer = (buffer) => {
    try {
        const iv = buffer.slice(0, IV_LENGTH);
        const encryptedText = buffer.slice(IV_LENGTH);
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted;
    } catch (e) {
        console.error('Decryption failed', e);
        return null;
    }
};

module.exports = { encryptBuffer, decryptBuffer };
