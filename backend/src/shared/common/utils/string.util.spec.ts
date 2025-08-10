import { StringUtil } from './string.util';

describe('StringUtil', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(StringUtil.capitalize('hello')).toBe('Hello');
      expect(StringUtil.capitalize('HELLO')).toBe('Hello');
      expect(StringUtil.capitalize('hELLO')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(StringUtil.capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(StringUtil.capitalize('a')).toBe('A');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(StringUtil.toTitleCase('hello world')).toBe('Hello World');
      expect(StringUtil.toTitleCase('HELLO WORLD')).toBe('Hello World');
      expect(StringUtil.toTitleCase('hello WORLD')).toBe('Hello World');
    });

    it('should handle empty string', () => {
      expect(StringUtil.toTitleCase('')).toBe('');
    });
  });

  describe('toCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(StringUtil.toCamelCase('hello world')).toBe('helloWorld');
      expect(StringUtil.toCamelCase('Hello World')).toBe('helloWorld');
      expect(StringUtil.toCamelCase('HELLO WORLD')).toBe('helloWorld');
    });

    it('should handle empty string', () => {
      expect(StringUtil.toCamelCase('')).toBe('');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert to snake_case', () => {
      expect(StringUtil.toSnakeCase('hello world')).toBe('hello_world');
      expect(StringUtil.toSnakeCase('Hello World')).toBe('hello_world');
      expect(StringUtil.toSnakeCase('helloWorld')).toBe('hello_world');
    });

    it('should handle empty string', () => {
      expect(StringUtil.toSnakeCase('')).toBe('');
    });
  });

  describe('toKebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(StringUtil.toKebabCase('hello world')).toBe('hello-world');
      expect(StringUtil.toKebabCase('Hello World')).toBe('hello-world');
      expect(StringUtil.toKebabCase('helloWorld')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(StringUtil.toKebabCase('')).toBe('');
    });
  });

  describe('removeAccents', () => {
    it('should remove accents from string', () => {
      expect(StringUtil.removeAccents('café')).toBe('cafe');
      expect(StringUtil.removeAccents('naïve')).toBe('naive');
      expect(StringUtil.removeAccents('résumé')).toBe('resume');
      expect(StringUtil.removeAccents('João')).toBe('Joao');
    });

    it('should handle string without accents', () => {
      expect(StringUtil.removeAccents('hello')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(StringUtil.removeAccents('')).toBe('');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from string', () => {
      expect(StringUtil.generateSlug('Hello World')).toBe('hello-world');
      expect(StringUtil.generateSlug('Hello, World!')).toBe('hello-world');
      expect(StringUtil.generateSlug('  Hello   World  ')).toBe('hello-world');
    });

    it('should handle accented characters', () => {
      expect(StringUtil.generateSlug('Café com Açúcar')).toBe('cafe-com-acucar');
    });

    it('should handle empty string', () => {
      expect(StringUtil.generateSlug('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate string with ellipsis', () => {
      expect(StringUtil.truncate('Hello World', 8)).toBe('Hello...');
      expect(StringUtil.truncate('Hello World', 5)).toBe('He...');
    });

    it('should not truncate if string is shorter', () => {
      expect(StringUtil.truncate('Hello', 10)).toBe('Hello');
    });

    it('should use custom suffix', () => {
      expect(StringUtil.truncate('Hello World', 8, '***')).toBe('Hello***');
    });

    it('should handle empty string', () => {
      expect(StringUtil.truncate('', 5)).toBe('');
    });
  });

  describe('truncateWords', () => {
    it('should truncate by word count', () => {
      expect(StringUtil.truncateWords('Hello beautiful world', 2)).toBe('Hello beautiful...');
      expect(StringUtil.truncateWords('One two three four', 3)).toBe('One two three...');
    });

    it('should not truncate if word count is sufficient', () => {
      expect(StringUtil.truncateWords('Hello world', 3)).toBe('Hello world');
    });

    it('should use custom suffix', () => {
      expect(StringUtil.truncateWords('Hello beautiful world', 2, '***')).toBe('Hello beautiful***');
    });
  });

  describe('maskEmail', () => {
    it('should mask email address', () => {
      expect(StringUtil.maskEmail('test@example.com')).toBe('t**t@example.com');
      expect(StringUtil.maskEmail('john.doe@company.com')).toBe('j******e@company.com');
    });

    it('should handle short usernames', () => {
      expect(StringUtil.maskEmail('ab@example.com')).toBe('ab@example.com');
    });

    it('should handle invalid email', () => {
      expect(StringUtil.maskEmail('invalid-email')).toBe('invalid-email');
    });

    it('should handle empty string', () => {
      expect(StringUtil.maskEmail('')).toBe('');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone number', () => {
      expect(StringUtil.maskPhone('11999999999')).toBe('11*******99');
      expect(StringUtil.maskPhone('(11) 99999-9999')).toBe('11*******99');
    });

    it('should handle short phone numbers', () => {
      expect(StringUtil.maskPhone('123')).toBe('123');
    });

    it('should handle empty string', () => {
      expect(StringUtil.maskPhone('')).toBe('');
    });
  });

  describe('formatCPF', () => {
    it('should format CPF', () => {
      expect(StringUtil.formatCPF('12345678901')).toBe('123.456.789-01');
    });

    it('should handle already formatted CPF', () => {
      expect(StringUtil.formatCPF('123.456.789-01')).toBe('123.456.789-01');
    });

    it('should handle invalid CPF', () => {
      expect(StringUtil.formatCPF('123')).toBe('123');
    });
  });

  describe('formatPhone', () => {
    it('should format 10-digit phone', () => {
      expect(StringUtil.formatPhone('1199999999')).toBe('(11) 9999-9999');
    });

    it('should format 11-digit phone', () => {
      expect(StringUtil.formatPhone('11999999999')).toBe('(11) 99999-9999');
    });

    it('should handle invalid phone', () => {
      expect(StringUtil.formatPhone('123')).toBe('123');
    });
  });

  describe('extractNumbers', () => {
    it('should extract only numbers', () => {
      expect(StringUtil.extractNumbers('abc123def456')).toBe('123456');
      expect(StringUtil.extractNumbers('(11) 99999-9999')).toBe('11999999999');
    });

    it('should handle string without numbers', () => {
      expect(StringUtil.extractNumbers('abcdef')).toBe('');
    });
  });

  describe('extractLetters', () => {
    it('should extract only letters', () => {
      expect(StringUtil.extractLetters('abc123def456')).toBe('abcdef');
      expect(StringUtil.extractLetters('Hello123World!')).toBe('HelloWorld');
    });

    it('should handle accented letters', () => {
      expect(StringUtil.extractLetters('João123Silva!')).toBe('JoãoSilva');
    });
  });

  describe('isEmpty', () => {
    it('should detect empty strings', () => {
      expect(StringUtil.isEmpty('')).toBe(true);
      expect(StringUtil.isEmpty('   ')).toBe(true);
      expect(StringUtil.isEmpty('\t\n')).toBe(true);
    });

    it('should detect non-empty strings', () => {
      expect(StringUtil.isEmpty('hello')).toBe(false);
      expect(StringUtil.isEmpty(' hello ')).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('should detect numeric strings', () => {
      expect(StringUtil.isNumeric('123')).toBe(true);
      expect(StringUtil.isNumeric('0')).toBe(true);
    });

    it('should reject non-numeric strings', () => {
      expect(StringUtil.isNumeric('123.45')).toBe(false);
      expect(StringUtil.isNumeric('abc')).toBe(false);
      expect(StringUtil.isNumeric('12a3')).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('should validate correct emails', () => {
      expect(StringUtil.isEmail('test@example.com')).toBe(true);
      expect(StringUtil.isEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(StringUtil.isEmail('invalid-email')).toBe(false);
      expect(StringUtil.isEmail('test@')).toBe(false);
      expect(StringUtil.isEmail('@example.com')).toBe(false);
    });
  });

  describe('isURL', () => {
    it('should validate correct URLs', () => {
      expect(StringUtil.isURL('https://example.com')).toBe(true);
      expect(StringUtil.isURL('http://localhost:3000')).toBe(true);
      expect(StringUtil.isURL('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(StringUtil.isURL('not-a-url')).toBe(false);
      expect(StringUtil.isURL('example.com')).toBe(false);
    });
  });

  describe('generateRandom', () => {
    it('should generate random string with default length', () => {
      const random = StringUtil.generateRandom();
      expect(random.length).toBe(8);
      expect(/^[A-Za-z0-9]+$/.test(random)).toBe(true);
    });

    it('should generate random string with custom length', () => {
      const random = StringUtil.generateRandom(16);
      expect(random.length).toBe(16);
    });

    it('should generate letters only when specified', () => {
      const random = StringUtil.generateRandom(10, false);
      expect(/^[A-Za-z]+$/.test(random)).toBe(true);
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(StringUtil.countWords('Hello world')).toBe(2);
      expect(StringUtil.countWords('  Hello   world  ')).toBe(2);
      expect(StringUtil.countWords('One two three four')).toBe(4);
    });

    it('should handle empty string', () => {
      expect(StringUtil.countWords('')).toBe(0);
      expect(StringUtil.countWords('   ')).toBe(0);
    });
  });

  describe('reverse', () => {
    it('should reverse string', () => {
      expect(StringUtil.reverse('hello')).toBe('olleh');
      expect(StringUtil.reverse('12345')).toBe('54321');
    });

    it('should handle empty string', () => {
      expect(StringUtil.reverse('')).toBe('');
    });
  });

  describe('isPalindrome', () => {
    it('should detect palindromes', () => {
      expect(StringUtil.isPalindrome('racecar')).toBe(true);
      expect(StringUtil.isPalindrome('A man a plan a canal Panama')).toBe(true);
      expect(StringUtil.isPalindrome('race a car')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(StringUtil.isPalindrome('')).toBe(false);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML characters', () => {
      expect(StringUtil.escapeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(StringUtil.escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should handle string without HTML characters', () => {
      expect(StringUtil.escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(StringUtil.formatFileSize(0)).toBe('0 Bytes');
      expect(StringUtil.formatFileSize(1024)).toBe('1 KB');
      expect(StringUtil.formatFileSize(1048576)).toBe('1 MB');
      expect(StringUtil.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(StringUtil.formatFileSize(1536)).toBe('1.5 KB');
      expect(StringUtil.formatFileSize(2621440)).toBe('2.5 MB');
    });
  });
});

