import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ErrorCode } from '@/lib/api/errors';

import { isAdmin, isManager, isManagerOf, isOwner, withRole } from '../authorization';
import type { AuthenticatedRequest } from '../types';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    salesStaff: {
      count: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isAdmin', () => {
    it.each([
      { position: '課長', expected: true },
      { position: '部長', expected: true },
      { position: '本部長', expected: true },
      { position: '役員', expected: true },
      { position: '社長', expected: true },
      { position: '主任', expected: false },
      { position: '一般', expected: false },
      { position: '', expected: false },
    ])('position: "$position" => $expected', ({ position, expected }) => {
      const user = { salesStaffId: 1, email: 'test@example.com', position };
      expect(isAdmin(user)).toBe(expected);
    });
  });

  describe('isManager', () => {
    it('部下が存在する場合は true を返す', async () => {
      mockPrisma.salesStaff.count.mockResolvedValue(3);
      const result = await isManager(1);
      expect(result).toBe(true);
      expect(mockPrisma.salesStaff.count).toHaveBeenCalledWith({
        where: { managerId: 1 },
      });
    });

    it('部下が存在しない場合は false を返す', async () => {
      mockPrisma.salesStaff.count.mockResolvedValue(0);
      const result = await isManager(1);
      expect(result).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('同一IDの場合は true を返す', () => {
      expect(isOwner(1, 1)).toBe(true);
    });

    it('異なるIDの場合は false を返す', () => {
      expect(isOwner(1, 2)).toBe(false);
    });
  });

  describe('isManagerOf', () => {
    it('指定ユーザーの上長である場合は true を返す', async () => {
      mockPrisma.salesStaff.findUnique.mockResolvedValue({ managerId: 10 });
      const result = await isManagerOf(10, 5);
      expect(result).toBe(true);
      expect(mockPrisma.salesStaff.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
        select: { managerId: true },
      });
    });

    it('指定ユーザーの上長でない場合は false を返す', async () => {
      mockPrisma.salesStaff.findUnique.mockResolvedValue({ managerId: 99 });
      const result = await isManagerOf(10, 5);
      expect(result).toBe(false);
    });

    it('指定ユーザーが存在しない場合は false を返す', async () => {
      mockPrisma.salesStaff.findUnique.mockResolvedValue(null);
      const result = await isManagerOf(10, 999);
      expect(result).toBe(false);
    });
  });

  describe('withRole', () => {
    function createAuthenticatedRequest(overrides: Partial<AuthenticatedRequest['auth']> = {}) {
      return {
        auth: {
          salesStaffId: 1,
          email: 'test@example.com',
          position: '主任',
          ...overrides,
        },
      } as AuthenticatedRequest;
    }

    const mockContext = { params: Promise.resolve({}) };
    const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it('authenticated ロールで認証済みユーザーを許可する', async () => {
      const wrapped = withRole(['authenticated'], mockHandler);
      const request = createAuthenticatedRequest();
      await wrapped(request, mockContext);
      expect(mockHandler).toHaveBeenCalledOnce();
    });

    it('admin ロールで管理者（課長）を許可する', async () => {
      const wrapped = withRole(['admin'], mockHandler);
      const request = createAuthenticatedRequest({ position: '課長' });
      await wrapped(request, mockContext);
      expect(mockHandler).toHaveBeenCalledOnce();
    });

    it('admin ロールで一般ユーザーを拒否する', async () => {
      const wrapped = withRole(['admin'], mockHandler);
      const request = createAuthenticatedRequest({ position: '一般' });
      const response = await wrapped(request, mockContext);
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error.code).toBe(ErrorCode.FORBIDDEN);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('manager ロールで部下を持つユーザーを許可する', async () => {
      mockPrisma.salesStaff.count.mockResolvedValue(2);
      const wrapped = withRole(['manager'], mockHandler);
      const request = createAuthenticatedRequest();
      await wrapped(request, mockContext);
      expect(mockHandler).toHaveBeenCalledOnce();
    });

    it('manager ロールで部下を持たないユーザーを拒否する', async () => {
      mockPrisma.salesStaff.count.mockResolvedValue(0);
      const wrapped = withRole(['manager'], mockHandler);
      const request = createAuthenticatedRequest();
      const response = await wrapped(request, mockContext);
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('複数ロール指定でいずれかに該当すれば許可する', async () => {
      // admin でも manager でもないが、ここでは admin をチェック
      const wrapped = withRole(['admin', 'manager'], mockHandler);
      const request = createAuthenticatedRequest({ position: '部長' });
      await wrapped(request, mockContext);
      expect(mockHandler).toHaveBeenCalledOnce();
      // admin で通ったので manager のDBチェックはスキップされる
      expect(mockPrisma.salesStaff.count).not.toHaveBeenCalled();
    });

    it('admin は DB クエリを発行しない', async () => {
      const wrapped = withRole(['admin'], mockHandler);
      const request = createAuthenticatedRequest({ position: '課長' });
      await wrapped(request, mockContext);
      expect(mockPrisma.salesStaff.count).not.toHaveBeenCalled();
      expect(mockPrisma.salesStaff.findUnique).not.toHaveBeenCalled();
    });
  });
});
