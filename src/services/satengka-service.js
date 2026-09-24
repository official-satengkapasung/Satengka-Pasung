/**
 * SATENGKA PASUNG — Service Layer Facade (ES6 Module)
 * Menyatukan akses data kasus, laporan, dan otentikasi Firebase secara seragam & modular.
 */

export * from './ews-service.js';
import * as ewsService from './ews-service.js';

export const SatengkaService = ewsService;
export default SatengkaService;

if (typeof window !== 'undefined') {
  window.SatengkaService = SatengkaService;
}
