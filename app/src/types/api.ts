// ============================================================
// Common Response Types
// ============================================================

/** 成功レスポンスのラッパー型 */
export type ApiResponse<T> = {
  status: 'success';
  data: T;
};

/** ページネーション情報 */
export type Pagination = {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
};

/** ページネーション付きレスポンス */
export type PaginatedResponse<T> = {
  status: 'success';
  data: T[];
  pagination: Pagination;
};

/** エラーレスポンス */
export type ApiErrorResponse = {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
};

// ============================================================
// User / Auth Types
// ============================================================

/** ログインユーザー情報 */
export type User = {
  sales_staff_id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  manager_id: number | null;
  manager_name?: string;
};

/** ログインリクエスト */
export type LoginRequest = {
  email: string;
  password: string;
};

/** ログインレスポンス */
export type LoginResponse = {
  token: string;
  user: User;
};

// ============================================================
// Report Types
// ============================================================

/** 日報ステータス */
export type ReportStatus = 'draft' | 'submitted' | 'commented';

/** 日報（一覧用） */
export type Report = {
  report_id: number;
  sales_staff_id: number;
  sales_staff_name: string;
  report_date: string; // YYYY-MM-DD
  status: ReportStatus;
  visit_count?: number;
  problem: string | null;
  plan: string | null;
  created_at: string;
  updated_at: string;
};

/** 日報詳細（訪問記録・コメント付き） */
export type ReportDetail = Report & {
  visit_records: VisitRecord[];
  comments: Comment[];
};

/** 日報作成リクエスト */
export type ReportCreateRequest = {
  report_date: string;
  status: 'draft' | 'submitted';
  problem?: string;
  plan?: string;
  visit_records: { customer_id: number; visit_content: string }[];
};

/** 日報更新リクエスト */
export type ReportUpdateRequest = ReportCreateRequest;

// ============================================================
// Visit Record Types
// ============================================================

/** 訪問記録 */
export type VisitRecord = {
  visit_record_id: number;
  report_id?: number;
  customer_id: number;
  customer_name: string;
  visit_content: string;
  created_at: string;
  updated_at?: string;
};

// ============================================================
// Comment Types
// ============================================================

/** 上長コメント */
export type Comment = {
  comment_id: number;
  report_id?: number;
  commenter_id: number;
  commenter_name: string;
  comment_body: string;
  created_at: string;
};

/** コメント作成リクエスト */
export type CommentCreateRequest = {
  comment_body: string;
};

// ============================================================
// Customer Types
// ============================================================

/** 顧客 */
export type Customer = {
  customer_id: number;
  customer_name: string;
  address: string | null;
  phone: string | null;
  sales_staff_id: number | null;
  sales_staff_name: string | null;
  created_at: string;
  updated_at: string;
};

/** 顧客登録リクエスト */
export type CustomerCreateRequest = {
  customer_name: string;
  address?: string;
  phone?: string;
  sales_staff_id?: number;
};

/** 顧客更新リクエスト */
export type CustomerUpdateRequest = CustomerCreateRequest;

// ============================================================
// Staff Types
// ============================================================

/** 営業スタッフ */
export type SalesStaff = {
  sales_staff_id: number;
  name: string;
  email: string;
  department: string | null;
  position: string | null;
  manager_id: number | null;
  manager_name: string | null;
  created_at: string;
  updated_at: string;
};

/** 営業スタッフ簡易表示用 */
export type SalesStaffSimple = {
  sales_staff_id: number;
  name: string;
};

/** 営業スタッフ登録リクエスト */
export type StaffCreateRequest = {
  name: string;
  email: string;
  password: string;
  department?: string;
  position?: string;
  manager_id?: number;
};

/** 営業スタッフ更新リクエスト */
export type StaffUpdateRequest = {
  name: string;
  email: string;
  password?: string;
  department?: string;
  position?: string;
  manager_id?: number;
};

// ============================================================
// Query Parameter Types
// ============================================================

/** 日報検索パラメータ */
export type ReportSearchParams = {
  date_from?: string;
  date_to?: string;
  sales_staff_id?: number;
  customer_name?: string;
  status?: ReportStatus;
  page?: number;
  per_page?: number;
};

/** 顧客検索パラメータ */
export type CustomerSearchParams = {
  customer_name?: string;
  sales_staff_id?: number;
  page?: number;
  per_page?: number;
};

/** 営業スタッフ検索パラメータ */
export type StaffSearchParams = {
  name?: string;
  department?: string;
  simple?: boolean;
  page?: number;
  per_page?: number;
};
