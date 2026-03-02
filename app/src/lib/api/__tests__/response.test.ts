import { describe, expect, it } from 'vitest';

import { AppError, ErrorCode } from '../errors';
import {
  buildPaginationInfo,
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  parsePaginationParams,
} from '../response';

describe('response', () => {
  describe('createSuccessResponse', () => {
    it('ステータス 200 の成功レスポンスを返す', async () => {
      const data = { id: 1, name: 'テスト' };
      const response = createSuccessResponse(data);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('success');
      expect(body.data).toEqual(data);
    });

    it('カスタムステータスコードを指定できる', async () => {
      const response = createSuccessResponse({ id: 1 }, 201);
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.status).toBe('success');
    });

    it('配列データを返せる', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createSuccessResponse(data);
      const body = await response.json();
      expect(body.data).toEqual(data);
      expect(body.data).toHaveLength(2);
    });

    it('文字列データを返せる', async () => {
      const response = createSuccessResponse('メッセージ');
      const body = await response.json();
      expect(body.data).toBe('メッセージ');
    });
  });

  describe('createPaginatedResponse', () => {
    it('ページネーション情報付きレスポンスを返す', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = {
        current_page: 1,
        per_page: 20,
        total_count: 50,
        total_pages: 3,
      };
      const response = createPaginatedResponse(data, pagination);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('success');
      expect(body.data).toEqual(data);
      expect(body.pagination).toEqual(pagination);
    });

    it('空配列のページネーションレスポンスを返せる', async () => {
      const pagination = {
        current_page: 1,
        per_page: 20,
        total_count: 0,
        total_pages: 0,
      };
      const response = createPaginatedResponse([], pagination);
      const body = await response.json();
      expect(body.data).toEqual([]);
      expect(body.pagination.total_count).toBe(0);
    });
  });

  describe('createErrorResponse', () => {
    it('エラーレスポンスの形式が正しい', async () => {
      const error = new AppError(ErrorCode.NOT_FOUND, 'リソースが見つかりません');
      const response = createErrorResponse(error);
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.status).toBe('error');
      expect(body.error.code).toBe('NOT_FOUND');
      expect(body.error.message).toBe('リソースが見つかりません');
      expect(body.error.details).toBeUndefined();
    });

    it('バリデーションエラーの詳細を含められる', async () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR, '入力内容に誤りがあります', [
        { field: 'email', message: '必須です' },
      ]);
      const response = createErrorResponse(error);
      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.error.details).toHaveLength(1);
      expect(body.error.details[0].field).toBe('email');
    });

    it('空の details 配列は含めない', async () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'エラー', []);
      const response = createErrorResponse(error);
      const body = await response.json();
      expect(body.error.details).toBeUndefined();
    });

    it.each([
      { code: ErrorCode.AUTHENTICATION_FAILED, expectedStatus: 401 },
      { code: ErrorCode.TOKEN_INVALID, expectedStatus: 401 },
      { code: ErrorCode.FORBIDDEN, expectedStatus: 403 },
      { code: ErrorCode.NOT_FOUND, expectedStatus: 404 },
      { code: ErrorCode.DUPLICATE_REPORT, expectedStatus: 409 },
      { code: ErrorCode.INTERNAL_ERROR, expectedStatus: 500 },
    ])('$code で HTTP $expectedStatus を返す', async ({ code, expectedStatus }) => {
      const error = new AppError(code, 'テストメッセージ');
      const response = createErrorResponse(error);
      expect(response.status).toBe(expectedStatus);
    });
  });

  describe('parsePaginationParams', () => {
    it('デフォルト値（page=1, per_page=20）を返す', () => {
      const params = new URLSearchParams();
      const result = parsePaginationParams(params);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(20);
      expect(result.skip).toBe(0);
    });

    it('指定されたページとページサイズを使用する', () => {
      const params = new URLSearchParams({ page: '3', per_page: '10' });
      const result = parsePaginationParams(params);
      expect(result.page).toBe(3);
      expect(result.perPage).toBe(10);
      expect(result.skip).toBe(20);
    });

    it('page が 0 以下の場合は 1 に補正する', () => {
      const params = new URLSearchParams({ page: '0' });
      const result = parsePaginationParams(params);
      expect(result.page).toBe(1);
    });

    it('per_page が 100 を超える場合は 100 に補正する', () => {
      const params = new URLSearchParams({ per_page: '200' });
      const result = parsePaginationParams(params);
      expect(result.perPage).toBe(100);
    });

    it('per_page が 0 以下の場合は 1 に補正する', () => {
      const params = new URLSearchParams({ per_page: '-5' });
      const result = parsePaginationParams(params);
      expect(result.perPage).toBe(1);
    });

    it('page が NaN の場合はデフォルト値 1 を使用する', () => {
      const params = new URLSearchParams({ page: 'abc' });
      const result = parsePaginationParams(params);
      expect(result.page).toBe(1);
    });

    it('per_page が NaN の場合はデフォルト値 20 を使用する', () => {
      const params = new URLSearchParams({ per_page: 'xyz' });
      const result = parsePaginationParams(params);
      expect(result.perPage).toBe(20);
    });
  });

  describe('buildPaginationInfo', () => {
    it('ページネーション情報を正しく生成する', () => {
      const info = buildPaginationInfo(2, 10, 45);
      expect(info.current_page).toBe(2);
      expect(info.per_page).toBe(10);
      expect(info.total_count).toBe(45);
      expect(info.total_pages).toBe(5);
    });

    it('total_count が 0 の場合 total_pages は 0 を返す', () => {
      const info = buildPaginationInfo(1, 20, 0);
      expect(info.total_pages).toBe(0);
    });

    it('端数がある場合は切り上げる', () => {
      const info = buildPaginationInfo(1, 10, 11);
      expect(info.total_pages).toBe(2);
    });
  });
});
