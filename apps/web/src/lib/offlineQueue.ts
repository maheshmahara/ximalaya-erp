export interface OfflineIntakeRecord {
  idempotency_key: string;
  farmer_code: string;
  farmer_name: string;
  plot_label: string;
  raw_variety: string;
  harvest_time: string;
  gross_weight_kg: number;
  sack_count: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  brix_reading: number;
  floaters_pct: number;
  grade: string;
  rate_per_kg: number;
  total_payable_npr: number;
  payment_method: string;
  created_at: string;
}

const STORAGE_KEY = 'xcc_offline_intakes_queue_v1';

export const getOfflineQueue = (): OfflineIntakeRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const enqueueOfflineIntake = (record: OfflineIntakeRecord): void => {
  const current = getOfflineQueue();
  current.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};
