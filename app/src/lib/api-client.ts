import type {
  ApiErrorResponse,
  ApiResponse,
  Comment,
  CommentCreateRequest,
  Customer,
  CustomerCreateRequest,
  CustomerSearchParams,
  CustomerUpdateRequest,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  Report,
  ReportCreateRequest,
  ReportDetail,
  ReportSearchParams,
  ReportUpdateRequest,
  SalesStaff,
  SalesStaffSimple,
  StaffCreateRequest,
  StaffSearchParams,
  StaffUpdateRequest,
  User,
  VisitRecord,
} from '@/types/api';

// ============================================================
// Constants
// ============================================================

const BASE_URL = '/api/v1';
const AUTH_TOKEN_KEY = 'auth_token';

// ============================================================
// Error Class
// ============================================================

/**
 * API通信エラークラス
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: { field: string; message: string }[];

  constructor(
    status: number,
    code: string,
    message: string,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ============================================================
// Helpers
// ============================================================

/**
 * 検索パラメータオブジェクトをURLSearchParamsに変換する
 * undefined の値は除外する
 */
function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * localStorageからJWTトークンを取得する
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * localStorageからJWTトークンを削除する
 */
function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// ============================================================
// Core Fetch Functions
// ============================================================

/**
 * API呼び出しの共通処理（単一リソース用）
 * レスポンスの `data` フィールドを返す
 */
async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 401 Unauthorized: トークンを削除してログイン画面にリダイレクト
  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiClientError(401, 'UNAUTHORIZED', '認証に失敗しました。再度ログインしてください。');
  }

  // エラーレスポンスの処理
  if (!response.ok) {
    let errorBody: ApiErrorResponse | undefined;
    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      // JSONパースに失敗した場合はデフォルトエラーを使用
    }

    throw new ApiClientError(
      response.status,
      errorBody?.error?.code ?? 'UNKNOWN_ERROR',
      errorBody?.error?.message ?? `APIエラーが発生しました (HTTP ${response.status})`,
      errorBody?.error?.details,
    );
  }

  // 204 No Content の場合は空オブジェクトを返す
  if (response.status === 204) {
    return {} as T;
  }

  const json = (await response.json()) as ApiResponse<T>;
  return json.data;
}

/**
 * API呼び出しの共通処理（ページネーション付き一覧用）
 * レスポンス全体（data + pagination）を返す
 */
async function fetchPaginatedApi<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<PaginatedResponse<T>> {
  const queryString = buildQueryString(params);
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}${queryString}`, {
    method: 'GET',
    headers,
  });

  // 401 Unauthorized: トークンを削除してログイン画面にリダイレクト
  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiClientError(401, 'UNAUTHORIZED', '認証に失敗しました。再度ログインしてください。');
  }

  // エラーレスポンスの処理
  if (!response.ok) {
    let errorBody: ApiErrorResponse | undefined;
    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      // JSONパースに失敗した場合はデフォルトエラーを使用
    }

    throw new ApiClientError(
      response.status,
      errorBody?.error?.code ?? 'UNKNOWN_ERROR',
      errorBody?.error?.message ?? `APIエラーが発生しました (HTTP ${response.status})`,
      errorBody?.error?.details,
    );
  }

  return (await response.json()) as PaginatedResponse<T>;
}

// ============================================================
// Auth API
// ============================================================

export const authApi = {
  /** ログイン */
  login: (data: LoginRequest) =>
    fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** ログアウト */
  logout: () =>
    fetchApi<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  /** ログインユーザー情報取得 */
  me: () => fetchApi<User>('/auth/me'),
};

// ============================================================
// Report API
// ============================================================

export const reportApi = {
  /** 日報一覧取得（ページネーション付き） */
  list: (params?: ReportSearchParams) => fetchPaginatedApi<Report>('/reports', params),

  /** 日報詳細取得 */
  get: (id: number) => fetchApi<ReportDetail>(`/reports/${id}`),

  /** 日報作成 */
  create: (data: ReportCreateRequest) =>
    fetchApi<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 日報更新 */
  update: (id: number, data: ReportUpdateRequest) =>
    fetchApi<Report>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 日報削除 */
  delete: (id: number) =>
    fetchApi<{ message: string }>(`/reports/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================
// Visit API
// ============================================================

export const visitApi = {
  /** 訪問記録一覧取得 */
  list: (reportId: number) => fetchApi<VisitRecord[]>(`/reports/${reportId}/visits`),

  /** 訪問記録追加 */
  create: (reportId: number, data: { customer_id: number; visit_content: string }) =>
    fetchApi<VisitRecord>(`/reports/${reportId}/visits`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 訪問記録更新 */
  update: (
    reportId: number,
    visitId: number,
    data: { customer_id: number; visit_content: string },
  ) =>
    fetchApi<VisitRecord>(`/reports/${reportId}/visits/${visitId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 訪問記録削除 */
  delete: (reportId: number, visitId: number) =>
    fetchApi<{ message: string }>(`/reports/${reportId}/visits/${visitId}`, {
      method: 'DELETE',
    }),
};

// ============================================================
// Comment API
// ============================================================

export const commentApi = {
  /** コメント一覧取得 */
  list: (reportId: number) => fetchApi<Comment[]>(`/reports/${reportId}/comments`),

  /** コメント投稿 */
  create: (reportId: number, data: CommentCreateRequest) =>
    fetchApi<Comment>(`/reports/${reportId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================================
// Customer API
// ============================================================

export const customerApi = {
  /** 顧客一覧取得（ページネーション付き） */
  list: (params?: CustomerSearchParams) => fetchPaginatedApi<Customer>('/customers', params),

  /** 顧客詳細取得 */
  get: (id: number) => fetchApi<Customer>(`/customers/${id}`),

  /** 顧客登録 */
  create: (data: CustomerCreateRequest) =>
    fetchApi<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 顧客更新 */
  update: (id: number, data: CustomerUpdateRequest) =>
    fetchApi<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 顧客削除 */
  delete: (id: number) =>
    fetchApi<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================
// Staff API
// ============================================================

export const staffApi = {
  /** 営業一覧取得（ページネーション付き） */
  list: (params?: StaffSearchParams) => {
    // simple=true の場合は簡易一覧を返す
    if (params?.simple) {
      return fetchApi<SalesStaffSimple[]>(`/staffs${buildQueryString(params)}`);
    }
    return fetchPaginatedApi<SalesStaff>('/staffs', params);
  },

  /** 営業詳細取得 */
  get: (id: number) => fetchApi<SalesStaff>(`/staffs/${id}`),

  /** 営業登録 */
  create: (data: StaffCreateRequest) =>
    fetchApi<SalesStaff>('/staffs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 営業更新 */
  update: (id: number, data: StaffUpdateRequest) =>
    fetchApi<SalesStaff>(`/staffs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 営業削除 */
  delete: (id: number) =>
    fetchApi<{ message: string }>(`/staffs/${id}`, {
      method: 'DELETE',
    }),
};
