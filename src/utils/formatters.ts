
import { formatDateInMadrid, formatDateTimeInMadrid } from './timezone';

// Utility function for formatting currency
export const formatCurrency = (amount: number | null): string => {
  if (amount === null) return "Не указано";
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Utility function for formatting date in Madrid timezone
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "—";
  return formatDateInMadrid(dateString);
};

// Utility function for formatting datetime in Madrid timezone
export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return "—";
  return formatDateTimeInMadrid(dateString);
};
