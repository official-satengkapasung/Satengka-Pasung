/**
 * SATENGKA PASUNG EWS — Cloudflare Pages Build Script
 * Memastikan firebase-config.js siap digunakan di Cloudflare Pages.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', 'firebase-config.js');
const examplePath = path.join(__dirname, '..', 'firebase-config.example.js');

console.log('[CLOUDFLARE BUILD] Memulai build pre-process SATENGKA PASUNG EWS...');

if (fs.existsSync(configPath)) {
  console.log('[CLOUDFLARE BUILD] ✅ firebase-config.js sudah ada.');
} else {
  console.log('[CLOUDFLARE BUILD] ⚙️ Membangun firebase-config.js untuk Cloudflare Pages...');
  const configContent = `/**
 * Konfigurasi Firebase Production Resmi (Cloudflare Pages)
 */
export const firebaseConfig = {
  apiKey: "${process.env.FIREBASE_API_KEY || 'AIzaSyBBCm2kCwr_cj7G8d6JZILQRPlZSPdlb6c'}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || 'satengkapasung.firebaseapp.com'}",
  projectId: "${process.env.FIREBASE_PROJECT_ID || 'satengkapasung'}",
  storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || 'satengkapasung.firebasestorage.app'}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || '701459980489'}",
  appId: "${process.env.FIREBASE_APP_ID || '1:701459980489:web:c8921023f3b39ca5e12d18'}"
};

export const APP_MODE = 'FIREBASE';
`;
  fs.writeFileSync(configPath, configContent, 'utf-8');
  console.log('[CLOUDFLARE BUILD] ✅ firebase-config.js resmi berhasil dipasang.');
}

console.log('[CLOUDFLARE BUILD] ✅ Build Cloudflare Pages selesai dan siap disajikan!');
