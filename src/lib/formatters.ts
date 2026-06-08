import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), "MMM d, yyyy");
}

export function formatDateTime(isoDate: string): string {
  return format(parseISO(isoDate), "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(isoDate: string): string {
  return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPhone(digits: string): string {
  const cleaned = digits.replace(/\D/g, "").slice(0, 10);
  if (cleaned.length < 4) return cleaned;
  if (cleaned.length < 7) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  }
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

export function parsePhoneToDigits(phone: string): string {
  return phone.replace(/\D/g, "").slice(0, 10);
}

export function isValidPhone(phone: string): boolean {
  return parsePhoneToDigits(phone).length === 10;
}
