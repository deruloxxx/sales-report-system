import { jwtVerify, SignJWT } from 'jose';

import { AppError, ErrorCode } from '@/lib/api/errors';

/** JWT ペイロードの型定義 */
export interface JwtPayload {
  /** ユーザーID (subject) */
  sub: number;
  /** メールアドレス */
  email: string;
  /** 役職 */
  position: string;
}

/** デフォルトの有効期限（24時間） */
const DEFAULT_EXPIRATION = '24h';

/**
 * JWT_SECRET 環境変数から署名キーを取得する
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET 環境変数が設定されていません');
  }
  return new TextEncoder().encode(secret);
}

/**
 * JWT トークンを生成する
 */
export async function generateToken(
  payload: JwtPayload,
  expiresIn: string = DEFAULT_EXPIRATION,
): Promise<string> {
  const secretKey = getSecretKey();

  const token = await new SignJWT({
    email: payload.email,
    position: payload.position,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);

  return token;
}

/**
 * JWT トークンを検証・デコードする
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const secretKey = getSecretKey();

  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (!payload.sub || !payload.email) {
      throw new AppError(ErrorCode.TOKEN_INVALID, '不正なトークンです');
    }

    return {
      sub: parseInt(payload.sub, 10),
      email: payload.email as string,
      position: (payload.position as string) || '',
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'JWTExpired') {
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 'トークンの有効期限が切れています');
    }

    throw new AppError(ErrorCode.TOKEN_INVALID, '不正なトークンです');
  }
}
