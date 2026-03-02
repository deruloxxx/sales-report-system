import { z } from 'zod';

/**
 * 顧客登録リクエストのバリデーションスキーマ
 */
export const customerCreateSchema = z.object({
  customer_name: z
    .string({ error: '顧客名を入力してください' })
    .min(1, '顧客名を入力してください')
    .max(200, '顧客名は200文字以内で入力してください'),
  address: z.string().max(500, '住所は500文字以内で入力してください').optional(),
  phone: z.string().optional(),
  sales_staff_id: z.number().int().positive().optional(),
});

/**
 * 顧客更新リクエストのバリデーションスキーマ
 */
export const customerUpdateSchema = z.object({
  customer_name: z
    .string({ error: '顧客名を入力してください' })
    .min(1, '顧客名を入力してください')
    .max(200, '顧客名は200文字以内で入力してください'),
  address: z.string().max(500, '住所は500文字以内で入力してください').optional(),
  phone: z.string().optional(),
  sales_staff_id: z.number().int().positive().optional(),
});

/**
 * 顧客一覧検索パラメータのバリデーションスキーマ
 */
export const customerSearchSchema = z.object({
  customer_name: z.string().optional(),
  sales_staff_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).optional(),
  per_page: z.coerce.number().int().min(1).max(100).optional(),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;
