import { NextResponse } from 'next/server';

import type { AppError, ValidationErrorDetail } from './errors';

/**
 * ページネーション情報の型定義
 */
export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

/**
 * 成功レスポンスを生成する
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      status: 'success',
      data,
    },
    { status },
  );
}

/**
 * ページネーション付き一覧レスポンスを生成する
 */
export function createPaginatedResponse<T>(data: T[], pagination: PaginationInfo): NextResponse {
  return NextResponse.json(
    {
      status: 'success',
      data,
      pagination,
    },
    { status: 200 },
  );
}

/**
 * エラーレスポンスを生成する
 */
export function createErrorResponse(error: AppError): NextResponse {
  const body: {
    status: string;
    error: {
      code: string;
      message: string;
      details?: ValidationErrorDetail[];
    };
  } = {
    status: 'error',
    error: {
      code: error.code,
      message: error.message,
    },
  };

  if (error.details && error.details.length > 0) {
    body.error.details = error.details;
  }

  return NextResponse.json(body, { status: error.statusCode });
}

/**
 * ページネーションパラメータを算出する
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
  page: number;
  perPage: number;
  skip: number;
} {
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const rawPerPage = parseInt(searchParams.get('per_page') || '20', 10);

  const page = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);
  const perPage = Math.min(100, Math.max(1, Number.isNaN(rawPerPage) ? 20 : rawPerPage));
  const skip = (page - 1) * perPage;

  return { page, perPage, skip };
}

/**
 * ページネーション情報を生成する
 */
export function buildPaginationInfo(
  page: number,
  perPage: number,
  totalCount: number,
): PaginationInfo {
  return {
    current_page: page,
    per_page: perPage,
    total_count: totalCount,
    total_pages: Math.ceil(totalCount / perPage),
  };
}
