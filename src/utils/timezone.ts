
import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// Madrid timezone
export const MADRID_TIMEZONE = 'Europe/Madrid';

/**
 * Format a date string or Date object in Madrid timezone
 */
export const formatInMadridTime = (
  date: string | Date | null,
  formatString: string = 'dd.MM.yyyy HH:mm'
): string => {
  if (!date) return '—';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatInTimeZone(dateObj, MADRID_TIMEZONE, formatString, { locale: es });
  } catch (error) {
    console.error('Error formatting date in Madrid time:', error);
    return '—';
  }
};

/**
 * Format a date for display in Madrid timezone (short format)
 */
export const formatDateInMadrid = (date: string | Date | null): string => {
  return formatInMadridTime(date, 'dd.MM.yyyy');
};

/**
 * Format a datetime for display in Madrid timezone
 */
export const formatDateTimeInMadrid = (date: string | Date | null): string => {
  return formatInMadridTime(date, 'dd.MM.yyyy HH:mm');
};

/**
 * Convert a Date object from Madrid timezone to UTC for database storage
 */
export const fromMadridTimeToUTC = (date: Date): Date => {
  return fromZonedTime(date, MADRID_TIMEZONE);
};

/**
 * Convert a UTC date to Madrid timezone
 */
export const toMadridTime = (date: string | Date): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, MADRID_TIMEZONE);
};

/**
 * Get current date/time in Madrid timezone
 */
export const nowInMadrid = (): Date => {
  return toZonedTime(new Date(), MADRID_TIMEZONE);
};

/**
 * Create start and end of day boundaries in Madrid timezone for filtering
 */
export const getMadridDayBoundaries = (date: Date) => {
  const madridDate = toZonedTime(date, MADRID_TIMEZONE);
  
  // Start of day in Madrid time
  const startOfDay = new Date(madridDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  // End of day in Madrid time
  const endOfDay = new Date(madridDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Convert back to UTC for database queries
  return {
    start: fromMadridTimeToUTC(startOfDay),
    end: fromMadridTimeToUTC(endOfDay)
  };
};

/**
 * Get today's boundaries in Madrid timezone (useful for dashboard filtering)
 */
export const getTodayInMadrid = () => {
  return getMadridDayBoundaries(nowInMadrid());
};
