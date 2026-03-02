import { z } from 'zod';

/**
 * 訪問記録作成リクエストのバリデーションスキーマ
 */
export const visitCreateSchema = z.object({
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
 * 訪問記録更新リクエストのバリデーションスキーマ
 */
export const visitUpdateSchema = z.object({
  customer_id: z
    .number({ error: '顧客IDを入力してください' })
    .int('顧客IDは整数で入力してください')
    .positive('顧客IDは正の整数で入力してください'),
  visit_content: z
    .string({ error: '訪問内容を入力してください' })
    .min(1, '訪問内容を入力してください')
    .max(2000, '訪問内容は2000文字以内で入力してください'),
});

export type VisitCreateInput = z.infer<typeof visitCreateSchema>;
export type VisitUpdateInput = z.infer<typeof visitUpdateSchema>;
