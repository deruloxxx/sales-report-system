// 認証基盤のパブリックAPI

// JWT
export { generateToken, verifyToken } from './jwt';
export type { JwtPayload } from './jwt';

// パスワード
export { hashPassword, verifyPassword } from './password';

// ミドルウェア
export { withAuth } from './middleware';

// 権限チェック
export { isAdmin, isManager, isManagerOf, isOwner, withRole } from './authorization';
export type { Role } from './authorization';

// 型定義
export type {
  AuthenticatedRequest,
  AuthenticatedRouteHandler,
  AuthUser,
  RouteHandler,
} from './types';
