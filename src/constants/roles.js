/**
 * SATENGKA PASUNG EWS — Role & Status Constants
 * Konstanta standar multi-peran faskes Puskesmas Kokop
 */

export const ROLES = {
  NAKES: 'NAKES',
  ADMIN: 'ADMIN',
  KADER: 'KADER',
  GURU: 'GURU',
  RATO: 'RATO'
};

export const ROLE_LABELS = {
  NAKES: 'Nakes (Petugas Faskes)',
  ADMIN: 'Administrator Sistem',
  KADER: "Bhupa' Bhabu' (Kader Jiwa)",
  GURU: 'Ghuru (Tokoh Agama / Kiai)',
  RATO: "Rato' (Kepala Desa / Linmas)"
};

export const STATUS_EWS = {
  NEW: 'NEW',
  REPORTED: 'REPORTED',
  VALIDATED: 'VALIDATED',
  SIAGA: 'SIAGA',
  COORDINATION: 'COORDINATION',
  READY_FOR_EVACUATION: 'READY_FOR_EVACUATION',
  EVACUATION: 'EVACUATION',
  MONITORING: 'MONITORING',
  CLOSED: 'CLOSED'
};

export const PRIORITY_EWS = {
  EMERGENCY: 'EMERGENCY',
  HIGH: 'HIGH',
  NORMAL: 'NORMAL',
  LOW: 'LOW'
};
