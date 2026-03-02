import { z } from 'zod';

import { dateStringSchema } from './common';

/**
 * 訪問記録のバリデーションスキーマ（日報内ネスト用）
 */
const visitRecordInputSchema = z.object({
  customer_id: z
    .number({ error: '顧客IDを入力してください' })
    .int('顧客IDは整数で入力してください')
    .positive('顧客IDは正の整数で入力してください'),
  visit_content: z
    .string({ error: '訪問内容を入力してください' })
    .min(1, '訪問内容を入力してください')
    .max(2000, '訪問内容は2000文字以内で入力してください'),
});

/**
 * 日報ステータス
 */
export const reportStatusSchema = z.enum(['draft', 'submitted'], {
  error: 'ステータスは draft または submitted を指定してください',
});

/**
 * 日報作成リクエストのバリデーションスキーマ
 */
export const reportCreateSchema = z
  .object({
    report_date: dateStringSchema,
    status: reportStatusSchema,
    problem: z.string().max(2000, '課題・相談は2000文字以内で入力してください').optional(),
    plan: z.string().max(2000, '明日やることは2000文字以内で入力してください').optional(),
    visit_records: z.array(visitRecordInputSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'submitted') {
        return data.visit_records && data.visit_records.length > 0;
      }
      return true;
    },
    {
      message: '提出時は訪問記録を1件以上入力してください',
      path: ['visit_records'],
    },
  );

/**
 * 日報更新リクエストのバリデーションスキーマ
 */
export const reportUpdateSchema = z
  .object({
    report_date: dateStringSchema,
    status: reportStatusSchema,
    problem: z.string().max(2000, '課題・相談は2000文字以内で入力してください').optional(),
    plan: z.string().max(2000, '明日やることは2000文字以内で入力してください').optional(),
    visit_records: z.array(visitRecordInputSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'submitted') {
        return data.visit_records && data.visit_records.length > 0;
      }
      return true;
    },
    {
      message: '提出時は訪問記録を1件以上入力してください',
      path: ['visit_records'],
    },
  );

/**
 * 日報一覧検索パラメータのバリデーションスキーマ
 */
export const reportSearchSchema = z.object({
  date_from: dateStringSchema.optional(),
  date_to: dateStringSchema.optional(),
  sales_staff_id: z.coerce.number().int().positive().optional(),
  customer_name: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'commented']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  per_page: z.coerce.number().int().min(1).max(100).optional(),
});

export type ReportCreateInput = z.infer<typeof reportCreateSchema>;
export type ReportUpdateInput = z.infer<typeof reportUpdateSchema>;
export type ReportSearchInput = z.infer<typeof reportSearchSchema>;
