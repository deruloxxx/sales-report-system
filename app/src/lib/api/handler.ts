import type { NextRequest, NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';

import { verifyToken, type JwtPayload } from '@/lib/auth/jwt';

import { AppError, ErrorCode, type ValidationErrorDetail } from './errors';
import { createErrorResponse } from './response';

/**
 * 認証済みリクエストの型定義
 */
export interface AuthenticatedRequest {
  user: JwtPayload;
}

/**
 * API Routeハンドラーのコンテキスト
 */
export interface HandlerContext {
  params: Promise<Record<string, string>>;
}

/**
 * API Routeハンドラーのオプション
 */
interface HandlerOptions {
  /** 認証が必要かどうか（デフォルト: true） */
  auth?: boolean;
}

/**
 * 認証不要のハンドラー関数の型
 */
type PublicHandler = (req: NextRequest, ctx: HandlerContext) => Promise<NextResponse>;

/**
 * 認証必須のハンドラー関数の型
 */
type AuthenticatedHandler = (
  req: NextRequest,
  ctx: HandlerContext & AuthenticatedRequest,
) => Promise<NextResponse>;

/**
 * Authorization ヘッダーからBearerトークンを抽出する
 */
function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * 共通API Routeハンドラーラッパー
 *
 * - try-catchによるエラーハンドリング
 * - JWT認証チェック（オプション）
 * - AppErrorの自動変換
 * - 未処理エラーの500レスポンス化
 */
export function withHandler(
  handler: AuthenticatedHandler,
  options?: HandlerOptions,
): (req: NextRequest, ctx: HandlerContext) => Promise<NextResponse>;
export function withHandler(
  handler: PublicHandler,
  options: HandlerOptions & { auth: false },
): (req: NextRequest, ctx: HandlerContext) => Promise<NextResponse>;
export function withHandler(
  handler: AuthenticatedHandler | PublicHandler,
  options: HandlerOptions = {},
): (req: NextRequest, ctx: HandlerContext) => Promise<NextResponse> {
  const { auth = true } = options;

  return async (req: NextRequest, ctx: HandlerContext): Promise<NextResponse> => {
    try {
      if (auth) {
        const token = extractBearerToken(req);
        if (!token) {
          throw new AppError(ErrorCode.TOKEN_INVALID, '認証トークンが必要です');
        }

        const user = await verifyToken(token);
        const authenticatedCtx = { ...ctx, user };
        return await (handler as AuthenticatedHandler)(req, authenticatedCtx);
      }

      return await (handler as PublicHandler)(req, ctx);
    } catch (error) {
      if (error instanceof AppError) {
        return createErrorResponse(error);
      }

      if (error instanceof ZodError) {
        const details: ValidationErrorDetail[] = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        const validationError = new AppError(
          ErrorCode.VALIDATION_ERROR,
          '入力内容に誤りがあります',
          details,
        );
        return createErrorResponse(validationError);
      }

      console.error('Unhandled API error:', error);
      const internalError = new AppError(
        ErrorCode.INTERNAL_ERROR,
        'サーバー内部エラーが発生しました',
      );
      return createErrorResponse(internalError);
    }
  };
}

/**
 * リクエストボディをパース・バリデーションする
 */
export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}

/**
 * クエリパラメータをパース・バリデーションする
 */
export function parseQuery<T>(req: NextRequest, schema: ZodSchema<T>): T {
  const searchParams = req.nextUrl.searchParams;
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}
