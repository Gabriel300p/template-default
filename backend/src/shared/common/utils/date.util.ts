import {
  format,
  parseISO,
  isValid,
  addDays,
  addHours,
  addMinutes,
  subDays,
  subHours,
  subMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isAfter,
  isBefore,
  isEqual,
  formatDistanceToNow,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class DateUtil {
  /**
   * Format date to Brazilian format (DD/MM/YYYY)
   */
  static formatToBrazilian(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      throw new Error('Data inválida');
    }
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  }

  /**
   * Format date and time to Brazilian format (DD/MM/YYYY HH:mm)
   */
  static formatDateTimeToBrazilian(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      throw new Error('Data inválida');
    }
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  }

  /**
   * Format date to ISO string
   */
  static formatToISO(date: Date): string {
    if (!isValid(date)) {
      throw new Error('Data inválida');
    }
    return date.toISOString();
  }

  /**
   * Parse ISO string to Date
   */
  static parseFromISO(dateString: string): Date {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      throw new Error('String de data inválida');
    }
    return date;
  }

  /**
   * Check if date is valid
   */
  static isValidDate(date: any): boolean {
    if (date instanceof Date) {
      return isValid(date);
    }
    if (typeof date === 'string') {
      return isValid(parseISO(date));
    }
    return false;
  }

  /**
   * Get current date in Brazil timezone
   */
  static now(): Date {
    return new Date();
  }

  /**
   * Get today at start of day
   */
  static todayStart(): Date {
    return startOfDay(new Date());
  }

  /**
   * Get today at end of day
   */
  static todayEnd(): Date {
    return endOfDay(new Date());
  }

  /**
   * Add days to date
   */
  static addDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  /**
   * Add hours to date
   */
  static addHours(date: Date, hours: number): Date {
    return addHours(date, hours);
  }

  /**
   * Add minutes to date
   */
  static addMinutes(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
  }

  /**
   * Subtract days from date
   */
  static subtractDays(date: Date, days: number): Date {
    return subDays(date, days);
  }

  /**
   * Subtract hours from date
   */
  static subtractHours(date: Date, hours: number): Date {
    return subHours(date, hours);
  }

  /**
   * Subtract minutes from date
   */
  static subtractMinutes(date: Date, minutes: number): Date {
    return subMinutes(date, minutes);
  }

  /**
   * Get start of week
   */
  static startOfWeek(date: Date): Date {
    return startOfWeek(date, { weekStartsOn: 1 }); // Monday
  }

  /**
   * Get end of week
   */
  static endOfWeek(date: Date): Date {
    return endOfWeek(date, { weekStartsOn: 1 }); // Monday
  }

  /**
   * Get start of month
   */
  static startOfMonth(date: Date): Date {
    return startOfMonth(date);
  }

  /**
   * Get end of month
   */
  static endOfMonth(date: Date): Date {
    return endOfMonth(date);
  }

  /**
   * Calculate difference in days
   */
  static daysDifference(dateLeft: Date, dateRight: Date): number {
    return differenceInDays(dateLeft, dateRight);
  }

  /**
   * Calculate difference in hours
   */
  static hoursDifference(dateLeft: Date, dateRight: Date): number {
    return differenceInHours(dateLeft, dateRight);
  }

  /**
   * Calculate difference in minutes
   */
  static minutesDifference(dateLeft: Date, dateRight: Date): number {
    return differenceInMinutes(dateLeft, dateRight);
  }

  /**
   * Check if date is after another date
   */
  static isAfter(date: Date, dateToCompare: Date): boolean {
    return isAfter(date, dateToCompare);
  }

  /**
   * Check if date is before another date
   */
  static isBefore(date: Date, dateToCompare: Date): boolean {
    return isBefore(date, dateToCompare);
  }

  /**
   * Check if dates are equal
   */
  static isEqual(dateLeft: Date, dateRight: Date): boolean {
    return isEqual(dateLeft, dateRight);
  }

  /**
   * Format distance to now in Portuguese
   */
  static timeAgo(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      throw new Error('Data inválida');
    }
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: ptBR 
    });
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date): boolean {
    return isBefore(date, new Date());
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date): boolean {
    return isAfter(date, new Date());
  }

  /**
   * Get age from birth date
   */
  static getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Create date range
   */
  static createDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * Get business days between two dates (excluding weekends)
   */
  static getBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Format duration in milliseconds to human readable format
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

