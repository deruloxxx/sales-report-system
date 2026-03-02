import { AppError, ErrorCode } from '@/lib/api/errors';
import { createErrorResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

import type { AuthenticatedRequest, AuthenticatedRouteHandler, AuthUser } from './types';

/**
 * 管理者（admin）判定に使用する役職リスト
 * 「課長」以上の役職を管理者とする
 */
const ADMIN_POSITIONS = ['課長', '部長', '本部長', '役員', '社長'];

/**
 * ユーザーが管理者（admin）かどうかを判定する
 */
export function isAdmin(user: AuthUser): boolean {
  return ADMIN_POSITIONS.includes(user.position);
}

/**
 * ユーザーが上長（manager）かどうかをDBで判定する
 */
export async function isManager(userId: number): Promise<boolean> {
  const subordinateCount = await prisma.salesStaff.count({
    where: {
      managerId: userId,
    },
  });
  return subordinateCount > 0;
}

/**
 * ユーザーがリソースの所有者（owner）かどうかを判定する
 */
export function isOwner(userId: number, resourceOwnerId: number): boolean {
  return userId === resourceOwnerId;
}

/**
 * 指定したユーザーが、特定ユーザーの上長であるかをDBで判定する
 */
export async function isManagerOf(managerId: number, staffId: number): Promise<boolean> {
  const staff = await prisma.salesStaff.findUnique({
    where: { id: staffId },
    select: { managerId: true },
  });
  return staff?.managerId === managerId;
}

/** 権限チェックで使用するロール種別 */
export type Role = 'admin' | 'manager' | 'authenticated';

/**
 * 権限チェックミドルウェア
 */
export function withRole(roles: Role[], handler: AuthenticatedRouteHandler) {
  return async (
    request: AuthenticatedRequest,
    context: { params: Promise<Record<string, string>> },
  ): Promise<Response> => {
    const user = request.auth;

    if (roles.includes('authenticated')) {
      return handler(request, context);
    }

    let hasPermission = false;

    for (const role of roles) {
      switch (role) {
        case 'admin':
          if (isAdmin(user)) {
            hasPermission = true;
          }
          break;
        case 'manager':
          if (await isManager(user.salesStaffId)) {
            hasPermission = true;
          }
          break;
      }
      if (hasPermission) break;
    }

    if (!hasPermission) {
      return createErrorResponse(new AppError(ErrorCode.FORBIDDEN, '権限が不足しています'));
    }

    return handler(request, context);
  };
}
