import { describe, expect, it } from 'vitest';

import {
  AppError,
  ErrorCode,
  getHttpStatusForErrorCode,
  type ValidationErrorDetail,
} from '../errors';

describe('errors', () => {
  describe('ErrorCode', () => {
    it('全てのエラーコードが定義されている', () => {
      expect(ErrorCode.AUTHENTICATION_FAILED).toBe('AUTHENTICATION_FAILED');
      expect(ErrorCode.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED');
      expect(ErrorCode.TOKEN_INVALID).toBe('TOKEN_INVALID');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.DUPLICATE_REPORT).toBe('DUPLICATE_REPORT');
      expect(ErrorCode.DUPLICATE_EMAIL).toBe('DUPLICATE_EMAIL');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.CANNOT_DELETE_SUBMITTED).toBe('CANNOT_DELETE_SUBMITTED');
      expect(ErrorCode.HAS_RELATED_RECORDS).toBe('HAS_RELATED_RECORDS');
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    });
  });

  describe('AppError', () => {
    it('正しいプロパティで初期化される', () => {
      const error = new AppError(ErrorCode.NOT_FOUND, 'リソースが見つかりません');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('リソースが見つかりません');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('AppError');
      expect(error.details).toBeUndefined();
    });

    it('バリデーション詳細を含めて初期化できる', () => {
      const details: ValidationErrorDetail[] = [
        { field: 'email', message: 'メールアドレスの形式が不正です' },
        { field: 'name', message: '名前は必須です' },
      ];
      const error = new AppError(ErrorCode.VALIDATION_ERROR, '入力内容に誤りがあります', details);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(422);
      expect(error.details).toHaveLength(2);
      expect(error.details![0].field).toBe('email');
    });

    it('Error クラスを継承している', () => {
      const error = new AppError(ErrorCode.INTERNAL_ERROR, 'エラー');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('try-catch で捕捉できる', () => {
      try {
        throw new AppError(ErrorCode.FORBIDDEN, '権限がありません');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.code).toBe('FORBIDDEN');
          expect(error.statusCode).toBe(403);
        }
      }
    });
  });

  describe('getHttpStatusForErrorCode', () => {
    it.each([
      { code: ErrorCode.AUTHENTICATION_FAILED, expected: 401 },
      { code: ErrorCode.TOKEN_EXPIRED, expected: 401 },
      { code: ErrorCode.TOKEN_INVALID, expected: 401 },
      { code: ErrorCode.FORBIDDEN, expected: 403 },
      { code: ErrorCode.NOT_FOUND, expected: 404 },
      { code: ErrorCode.DUPLICATE_REPORT, expected: 409 },
      { code: ErrorCode.DUPLICATE_EMAIL, expected: 409 },
      { code: ErrorCode.VALIDATION_ERROR, expected: 422 },
      { code: ErrorCode.CANNOT_DELETE_SUBMITTED, expected: 422 },
      { code: ErrorCode.HAS_RELATED_RECORDS, expected: 422 },
      { code: ErrorCode.INTERNAL_ERROR, expected: 500 },
    ])('$code => $expected', ({ code, expected }) => {
      expect(getHttpStatusForErrorCode(code)).toBe(expected);
    });
  });
});
