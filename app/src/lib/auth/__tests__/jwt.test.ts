import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ErrorCode } from '@/lib/api/errors';

import { generateToken, verifyToken } from '../jwt';

describe('jwt', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-key-for-jwt-testing');
  });

  describe('generateToken', () => {
    it('JWT トークンを生成できる', async () => {
      const token = await generateToken({
        sub: 1,
        email: 'test@example.com',
        position: '主任',
      });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('カスタム有効期限でトークンを生成できる', async () => {
      const token = await generateToken(
        { sub: 1, email: 'test@example.com', position: '主任' },
        '1h',
      );
      expect(token).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('生成したトークンを検証・デコードできる', async () => {
      const payload = { sub: 42, email: 'user@example.com', position: '課長' };
      const token = await generateToken(payload);
      const decoded = await verifyToken(token);
      expect(decoded.sub).toBe(42);
      expect(decoded.email).toBe('user@example.com');
      expect(decoded.position).toBe('課長');
    });

    it('JWT_SECRET が未設定の場合エラーをスローする', async () => {
      vi.stubEnv('JWT_SECRET', '');
      await expect(
        generateToken({ sub: 1, email: 'test@example.com', position: '' }),
      ).rejects.toThrow('JWT_SECRET 環境変数が設定されていません');
    });

    it('有効期限切れトークンで TOKEN_EXPIRED エラーをスローする', async () => {
      const token = await generateToken(
        { sub: 1, email: 'test@example.com', position: '主任' },
        '0s',
      );
      // 少し待って有効期限を確実に過ぎさせる
      await new Promise((resolve) => setTimeout(resolve, 1100));
      try {
        await verifyToken(token);
        expect.fail('エラーがスローされるべき');
      } catch (error: unknown) {
        const appError = error as { code: string };
        expect(appError.code).toBe(ErrorCode.TOKEN_EXPIRED);
      }
    });

    it('不正なトークンで TOKEN_INVALID エラーをスローする', async () => {
      try {
        await verifyToken('invalid.token.string');
        expect.fail('エラーがスローされるべき');
      } catch (error: unknown) {
        const appError = error as { code: string };
        expect(appError.code).toBe(ErrorCode.TOKEN_INVALID);
      }
    });

    it('異なる秘密鍵で署名されたトークンを拒否する', async () => {
      const token = await generateToken({
        sub: 1,
        email: 'test@example.com',
        position: '主任',
      });
      vi.stubEnv('JWT_SECRET', 'different-secret-key');
      try {
        await verifyToken(token);
        expect.fail('エラーがスローされるべき');
      } catch (error: unknown) {
        const appError = error as { code: string };
        expect(appError.code).toBe(ErrorCode.TOKEN_INVALID);
      }
    });

    it('空文字列トークンで TOKEN_INVALID エラーをスローする', async () => {
      try {
        await verifyToken('');
        expect.fail('エラーがスローされるべき');
      } catch (error: unknown) {
        const appError = error as { code: string };
        expect(appError.code).toBe(ErrorCode.TOKEN_INVALID);
      }
    });

    it('position が未設定の場合は空文字列をデフォルトとする', async () => {
      // positionが空文字列のトークンを生成
      const token = await generateToken({
        sub: 1,
        email: 'test@example.com',
        position: '',
      });
      const decoded = await verifyToken(token);
      expect(decoded.position).toBe('');
    });
  });
});
