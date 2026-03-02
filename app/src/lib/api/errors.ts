/**
 * アプリケーションエラーコード
 * API仕様書のエラーコード一覧に準拠
 */
export const ErrorCode = {
  /** ログイン認証失敗 */
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  /** トークン有効期限切れ */
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  /** 不正なトークン */
  TOKEN_INVALID: 'TOKEN_INVALID',
  /** アクセス権限なし */
  FORBIDDEN: 'FORBIDDEN',
  /** 対象リソースが見つからない */
  NOT_FOUND: 'NOT_FOUND',
  /** 同一日の日報が既に存在 */
  DUPLICATE_REPORT: 'DUPLICATE_REPORT',
  /** メールアドレス重複 */
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  /** 入力値バリデーションエラー */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** 提出済み日報の削除不可 */
  CANNOT_DELETE_SUBMITTED: 'CANNOT_DELETE_SUBMITTED',
  /** 関連データ存在のため削除不可 */
  HAS_RELATED_RECORDS: 'HAS_RELATED_RECORDS',
  /** サーバー内部エラー */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * エラーコードとHTTPステータスコードのマッピング
 */
const ERROR_STATUS_MAP: Record<ErrorCodeType, number> = {
  [ErrorCode.AUTHENTICATION_FAILED]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.DUPLICATE_REPORT]: 409,
  [ErrorCode.DUPLICATE_EMAIL]: 409,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.CANNOT_DELETE_SUBMITTED]: 422,
  [ErrorCode.HAS_RELATED_RECORDS]: 422,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

/**
 * バリデーションエラーの詳細情報
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * アプリケーション共通エラークラス
 */
export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly statusCode: number;
  public readonly details?: ValidationErrorDetail[];

  constructor(code: ErrorCodeType, message: string, details?: ValidationErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code];
    this.details = details;
  }
}

/**
 * エラーコードからHTTPステータスコードを取得する
 */
export function getHttpStatusForErrorCode(code: ErrorCodeType): number {
  return ERROR_STATUS_MAP[code];
}
