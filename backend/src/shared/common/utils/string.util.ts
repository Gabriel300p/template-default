export class StringUtil {
  /**
   * Capitalize first letter of a string
   */
  static capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert string to title case
   */
  static toTitleCase(str: string): string {
    if (!str) return str;
    return str
      .toLowerCase()
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  /**
   * Convert string to camelCase
   */
  static toCamelCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Convert string to snake_case
   */
  static toSnakeCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  }

  /**
   * Convert string to kebab-case
   */
  static toKebabCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-');
  }

  /**
   * Remove accents from string
   */
  static removeAccents(str: string): string {
    if (!str) return str;
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Generate slug from string
   */
  static generateSlug(str: string): string {
    if (!str) return str;
    return this.removeAccents(str)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Truncate string with ellipsis
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (!str || str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Truncate string at word boundary
   */
  static truncateWords(str: string, wordCount: number, suffix: string = '...'): string {
    if (!str) return str;
    const words = str.split(' ');
    if (words.length <= wordCount) return str;
    return words.slice(0, wordCount).join(' ') + suffix;
  }

  /**
   * Mask email address
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1)
      : username;
    return `${maskedUsername}@${domain}`;
  }

  /**
   * Mask phone number
   */
  static maskPhone(phone: string): string {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return phone;
    
    const visibleStart = cleaned.substring(0, 2);
    const visibleEnd = cleaned.substring(cleaned.length - 2);
    const masked = '*'.repeat(cleaned.length - 4);
    
    return visibleStart + masked + visibleEnd;
  }

  /**
   * Mask CPF (Brazilian tax ID)
   */
  static maskCPF(cpf: string): string {
    if (!cpf) return cpf;
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    
    return `${cleaned.substring(0, 3)}.***.**${cleaned.substring(9)}`;
  }

  /**
   * Format CPF
   */
  static formatCPF(cpf: string): string {
    if (!cpf) return cpf;
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Format phone number (Brazilian format)
   */
  static formatPhone(phone: string): string {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  /**
   * Extract numbers from string
   */
  static extractNumbers(str: string): string {
    if (!str) return str;
    return str.replace(/\D/g, '');
  }

  /**
   * Extract letters from string
   */
  static extractLetters(str: string): string {
    if (!str) return str;
    return str.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  }

  /**
   * Check if string is empty or whitespace
   */
  static isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Check if string contains only numbers
   */
  static isNumeric(str: string): boolean {
    if (!str) return false;
    return /^\d+$/.test(str);
  }

  /**
   * Check if string is a valid email
   */
  static isEmail(str: string): boolean {
    if (!str) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Check if string is a valid URL
   */
  static isURL(str: string): boolean {
    if (!str) return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate random string
   */
  static generateRandom(length: number = 8, includeNumbers: boolean = true): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const chars = includeNumbers ? letters + numbers : letters;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Count words in string
   */
  static countWords(str: string): number {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count characters excluding spaces
   */
  static countCharacters(str: string, excludeSpaces: boolean = false): number {
    if (!str) return 0;
    return excludeSpaces ? str.replace(/\s/g, '').length : str.length;
  }

  /**
   * Reverse string
   */
  static reverse(str: string): string {
    if (!str) return str;
    return str.split('').reverse().join('');
  }

  /**
   * Check if string is palindrome
   */
  static isPalindrome(str: string): boolean {
    if (!str) return false;
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === this.reverse(cleaned);
  }

  /**
   * Escape HTML characters
   */
  static escapeHtml(str: string): string {
    if (!str) return str;
    const htmlEscapes: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return str.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
  }

  /**
   * Unescape HTML characters
   */
  static unescapeHtml(str: string): string {
    if (!str) return str;
    const htmlUnescapes: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/'
    };
    
    return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (match) => htmlUnescapes[match]);
  }

  /**
   * Pluralize word based on count
   */
  static pluralize(word: string, count: number, plural?: string): string {
    if (count === 1) return word;
    return plural || word + 's';
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

