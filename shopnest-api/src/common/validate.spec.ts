import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { imageUrl, int, linkUrl, str } from './validate.js';

describe('input checks', () => {
  it('accepts only uploaded pictures and web addresses as pictures', () => {
    expect(imageUrl('/uploads/4cc5b1e6-3502-4193-ab71-5e49bf9692d3.webp', 'Logo', true)).toBe('/uploads/4cc5b1e6-3502-4193-ab71-5e49bf9692d3.webp');
    expect(imageUrl('https://example.com/a.jpg', 'Logo', true)).toBe('https://example.com/a.jpg');
    expect(() => imageUrl('/uploads/../../etc/passwd', 'Logo', true)).toThrow(BadRequestException);
    expect(() => imageUrl('javascript:alert(1)', 'Logo', true)).toThrow(BadRequestException);
    expect(imageUrl('', 'Logo', false)).toBeNull();
    expect(() => imageUrl('', 'Logo', true)).toThrow(BadRequestException);
  });
  it('limits links to web addresses or paths inside the site', () => {
    expect(linkUrl('/marketplace', 'Link', true)).toBe('/marketplace');
    expect(() => linkUrl('//evil.example.com', 'Link', true)).toThrow(BadRequestException);
    expect(() => linkUrl('data:text/html,hi', 'Link', true)).toThrow(BadRequestException);
  });
  it('trims text and enforces length and whole numbers', () => {
    expect(str('  hi  ', { max: 5, label: 'X' })).toBe('hi');
    expect(() => str('toolong', { max: 3, label: 'X' })).toThrow(BadRequestException);
    expect(int('7', 'Stock', 0, 10)).toBe(7);
    expect(() => int(2.5, 'Stock', 0, 10)).toThrow(BadRequestException);
    expect(() => int(11, 'Stock', 0, 10)).toThrow(BadRequestException);
  });
});
