import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'RON') {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('ro-RO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function calculateCommission(grossRevenue: number, commissionPct: number = 10): number {
  return (grossRevenue * commissionPct) / 100;
}

export function checkEventOverlap(
  event1: { dateStart: Date; dateEnd: Date },
  event2: { dateStart: Date; dateEnd: Date }
): boolean {
  return event1.dateStart < event2.dateEnd && event1.dateEnd > event2.dateStart;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    CONFIRMED: 'bg-green-100 text-green-800 border-green-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    CONTRACT_SIGNED: 'bg-blue-100 text-blue-800 border-blue-300',
    FIRST_INVOICE_PAID: 'bg-purple-100 text-purple-800 border-purple-300',
    ALL_PAID: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
    SENT: 'bg-blue-100 text-blue-800 border-blue-300',
    PARTIAL: 'bg-orange-100 text-orange-800 border-orange-300',
    PAID: 'bg-green-100 text-green-800 border-green-300',
    OVERDUE: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}
