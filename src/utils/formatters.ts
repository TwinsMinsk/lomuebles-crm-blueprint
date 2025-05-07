
// Utility function for formatting currency
export const formatCurrency = (amount: number | null): string => {
  if (amount === null) return "Не указано";
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Utility function for formatting date
export const formatDate = (dateString: string): string => {
  try {
    return new Intl.DateTimeFormat('ru-RU').format(new Date(dateString));
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};
