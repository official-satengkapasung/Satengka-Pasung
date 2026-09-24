/**
 * SATENGKA PASUNG — Toast Notification Component (ES6 Module)
 * Bertema Estetika Khas Batik Gentongan Tanjung Bumi, Bangkalan, Madura.
 */

export { showToast, showBatikConfirm } from './tanjung-bumi-toast.js';
import { showToast, showBatikConfirm } from './tanjung-bumi-toast.js';

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.showBatikConfirm = showBatikConfirm;
}
