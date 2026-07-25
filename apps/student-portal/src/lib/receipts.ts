// Helper for persisting electronic payment receipts across Student and Admin portals

export interface PaymentReceipt {
  transactionId: string;
  studentId: string;
  studentEmail?: string;
  faculty?: string;
  career?: string;
  amount: number;
  currency: string;
  type: string;
  date: string;
  stripeReference: string;
  status: 'COMPLETED' | 'PENDING';
  coordinatorApproval: string;
}

const STORAGE_KEY = 'uce_scholarship_payment_receipts';

export function getReceipts(): Record<string, PaymentReceipt> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function getReceiptByStudentId(studentId: string): PaymentReceipt | null {
  const receipts = getReceipts();
  return receipts[studentId] || null;
}

export function saveReceipt(receipt: PaymentReceipt): void {
  if (typeof window === 'undefined') return;
  const receipts = getReceipts();
  receipts[receipt.studentId] = receipt;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
    // Dispatch custom event for cross-component real-time updates in the same browser session
    window.dispatchEvent(new CustomEvent('receipt_updated', { detail: receipt }));
  } catch (e) {
    console.error('Failed to save receipt:', e);
  }
}

export function generateStripeHash(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 12; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `pi_3M${rand}_secret_${rand.substring(0, 6)}`;
}
