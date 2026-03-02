import type { NextRequest } from 'next/server';

/**
 * 認証済みユーザーのコンテキスト情報
 */
export interface AuthUser {
  /** 営業担当者ID */
  salesStaffId: number;
  /** メールアドレス */
  email: string;
  /** 役職 */
  position: string;
}

/**
 * 認証情報付きリクエスト
 */
export interface AuthenticatedRequest extends NextRequest {
  auth: AuthUser;
}

/**
 * 認証済みルートハンドラーの型定義
 */
export type AuthenticatedRouteHandler = (
  request: AuthenticatedRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<Response>;

/**
 * 通常のルートハンドラーの型定義
 */
export type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<Response>;
