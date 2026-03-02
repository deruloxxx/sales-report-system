import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { ErrorCode } from '@/lib/api/errors';

import { generateToken } from '../jwt';
import { withAuth } from '../middleware';
import type { AuthenticatedRequest } from '../types';

describe('withAuth middleware', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-key-for-middleware-testing');
  });

  function createRequest(headers: Record<string, string> = {}): NextRequest {
    const req = new NextRequest('http://localhost:3000/api/v1/test', {
      headers,
    });
    return req;
  }

  const mockContext = { params: Promise.resolve({}) };

  it('有効なトークンで認証に成功し、ハンドラーを実行する', async () => {
    const token = await generateToken({
      sub: 1,
      email: 'test@example.com',
      position: '主任',
    });

    const handler = vi.fn().mockResolvedValue(new Response('OK'));
    const wrapped = withAuth(handler);

    const request = createRequest({ Authorization: `Bearer ${token}` });
    const response = await wrapped(request, mockContext);

    expect(response).toBeDefined();
    expect(handler).toHaveBeenCalledOnce();

    // ハンドラーに渡されたリクエストにauth情報が含まれることを確認
    const calledRequest = handler.mock.calls[0][0] as AuthenticatedRequest;
    expect(calledRequest.auth).toBeDefined();
    expect(calledRequest.auth.salesStaffId).toBe(1);
    expect(calledRequest.auth.email).toBe('test@example.com');
    expect(calledRequest.auth.position).toBe('主任');
  });

  it('Authorization ヘッダーがない場合は 401 を返す', async () => {
    const handler = vi.fn();
    const wrapped = withAuth(handler);

    const request = createRequest();
    const response = await wrapped(request, mockContext);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe(ErrorCode.TOKEN_INVALID);
    expect(handler).not.toHaveBeenCalled();
  });

  it('Bearer 以外のスキームの場合は 401 を返す', async () => {
    const handler = vi.fn();
    const wrapped = withAuth(handler);

    const request = createRequest({ Authorization: 'Basic abc123' });
    const response = await wrapped(request, mockContext);

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('不正なトークンの場合は 401 を返す', async () => {
    const handler = vi.fn();
    const wrapped = withAuth(handler);

    const request = createRequest({ Authorization: 'Bearer invalid-token' });
    const response = await wrapped(request, mockContext);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe(ErrorCode.TOKEN_INVALID);
    expect(handler).not.toHaveBeenCalled();
  });

  it('有効期限切れトークンの場合は 401 を返す', async () => {
    const token = await generateToken(
      { sub: 1, email: 'test@example.com', position: '主任' },
      '0s',
    );
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const handler = vi.fn();
    const wrapped = withAuth(handler);

    const request = createRequest({ Authorization: `Bearer ${token}` });
    const response = await wrapped(request, mockContext);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe(ErrorCode.TOKEN_EXPIRED);
    expect(handler).not.toHaveBeenCalled();
  });

  it('Bearer トークンが空文字の場合は 401 を返す', async () => {
    const handler = vi.fn();
    const wrapped = withAuth(handler);

    const request = createRequest({ Authorization: 'Bearer ' });
    const response = await wrapped(request, mockContext);

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('"Bearer" のみ（スペースなし）の場合は 401 を返す', async () => {
    const handler = vi.fn();
    const wrapped = withAuth(handler);

    const request = createRequest({ Authorization: 'Bearer' });
    const response = await wrapped(request, mockContext);

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });
});
