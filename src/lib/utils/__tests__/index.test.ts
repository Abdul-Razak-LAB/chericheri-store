import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatRelativeTime,
  formatCurrency,
  generateId,
  calculatePercentage,
  truncate,
} from '@/src/lib/utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "just now" for recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('returns minutes ago for recent times', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    });

    it('returns hours ago for times within 24h', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
    });
  });

  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('handles zero', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    it('handles negative numbers', () => {
      expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('includes prefix when provided', () => {
      const id = generateId('task');
      expect(id).toMatch(/^task_/);
    });
  });

  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBe(33);
    });

    it('handles zero total', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });

    it('handles zero value', () => {
      expect(calculatePercentage(0, 100)).toBe(0);
    });
  });

  describe('truncate', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncate(longText, 20)).toBe('This is a very lo...');
    });

    it('does not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncate(shortText, 20)).toBe('Short text');
    });

    it('handles exact length', () => {
      const text = '12345';
      expect(truncate(text, 5)).toBe('12345');
    });
  });
});
