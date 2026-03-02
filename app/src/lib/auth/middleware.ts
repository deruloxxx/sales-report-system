import type { NextRequest } from 'next/server';

import { AppError, ErrorCode } from '@/lib/api/errors';
import { createErrorResponse } from '@/lib/api/response';

import { verifyToken } from './jwt';
import type { AuthenticatedRequest, AuthenticatedRouteHandler, AuthUser } from './types';

/**
 * Authorization ヘッダーから Bearer トークンを抽出する
 */
function extractBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return null;
  }

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * 認証ミドルウェア
 *
 * ルートハンドラーをラップし、JWT トークンの検証を行う。
 * 検証に成功した場合、request.auth に認証ユーザー情報を設定してハンドラーを実行する。
 * 検証に失敗した場合、401 エラーレスポンスを返す。
 */
export function withAuth(handler: AuthenticatedRouteHandler) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
  ): Promise<Response> => {
    const token = extractBearerToken(request);

    if (!token) {
      return createErrorResponse(new AppError(ErrorCode.TOKEN_INVALID, '認証トークンが必要です'));
    }

    try {
      const payload = await verifyToken(token);

      const authUser: AuthUser = {
        salesStaffId: payload.sub,
        email: payload.email,
        position: payload.position,
      };

      const authenticatedRequest = request as AuthenticatedRequest;
      Object.defineProperty(authenticatedRequest, 'auth', {
        value: authUser,
        writable: false,
        enumerable: true,
      });

      return handler(authenticatedRequest, context);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error);
      }

      return createErrorResponse(
        new AppError(ErrorCode.INTERNAL_ERROR, 'サーバー内部エラーが発生しました'),
      );
    }
  };
}
