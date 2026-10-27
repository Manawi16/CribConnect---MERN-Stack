import CryptoJS from 'crypto-js';
const SECRET_KEY = '123'; // dev only; don’t rely on this for real security

export function encryptMessage(text) {
  try { return CryptoJS.AES.encrypt(text, SECRET_KEY).toString(); }
  catch (e) { return text; }
}

export function decryptMessage(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    return plain || encrypted;
  } catch (e) {
    return encrypted;
  }
}
