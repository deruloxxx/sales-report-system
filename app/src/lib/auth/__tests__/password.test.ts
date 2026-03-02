import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from '../password';

describe('password', () => {
  describe('hashPassword', () => {
    it('平文パスワードをハッシュ化できる', async () => {
      const plainPassword = 'password123';
      const hashed = await hashPassword(plainPassword);
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(plainPassword);
      expect(hashed).toMatch(/^\$2[ab]\$/);
    });

    it('同じパスワードでも毎回異なるハッシュを生成する', async () => {
      const plainPassword = 'password123';
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      expect(hash1).not.toBe(hash2);
    });

    it('空文字列でもハッシュ化できる', async () => {
      const hashed = await hashPassword('');
      expect(hashed).toBeDefined();
      expect(hashed).toMatch(/^\$2[ab]\$/);
    });
  });

  describe('verifyPassword', () => {
    it('正しいパスワードで検証が成功する', async () => {
      const plainPassword = 'securePass123';
      const hashed = await hashPassword(plainPassword);
      const result = await verifyPassword(plainPassword, hashed);
      expect(result).toBe(true);
    });

    it('間違ったパスワードで検証が失敗する', async () => {
      const plainPassword = 'securePass123';
      const hashed = await hashPassword(plainPassword);
      const result = await verifyPassword('wrongPassword', hashed);
      expect(result).toBe(false);
    });

    it('日本語を含むパスワードでもハッシュ化・検証できる', async () => {
      const plainPassword = 'パスワード123';
      const hashed = await hashPassword(plainPassword);
      expect(await verifyPassword(plainPassword, hashed)).toBe(true);
      expect(await verifyPassword('wrong', hashed)).toBe(false);
    });

    it('長いパスワードでもハッシュ化・検証できる', async () => {
      const plainPassword = 'a'.repeat(100);
      const hashed = await hashPassword(plainPassword);
      expect(await verifyPassword(plainPassword, hashed)).toBe(true);
    });
  });
});
