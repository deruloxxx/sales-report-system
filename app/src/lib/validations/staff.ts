import { z } from 'zod';

/**
 * 営業担当者登録リクエストのバリデーションスキーマ
 */
export const staffCreateSchema = z.object({
  name: z
    .string({ error: '氏名を入力してください' })
    .min(1, '氏名を入力してください')
    .max(100, '氏名は100文字以内で入力してください'),
  email: z
    .string({ error: 'メールアドレスを入力してください' })
    .email('メールアドレスの形式が正しくありません'),
  password: z
    .string({ error: 'パスワードを入力してください' })
    .min(8, 'パスワードは8文字以上で入力してください'),
  department: z.string().max(100, '部署は100文字以内で入力してください').optional(),
  position: z.string().max(50, '役職は50文字以内で入力してください').optional(),
  manager_id: z.number().int().positive().optional().nullable(),
});

/**
 * 営業担当者更新リクエストのバリデーションスキーマ
 */
export const staffUpdateSchema = z.object({
  name: z
    .string({ error: '氏名を入力してください' })
    .min(1, '氏名を入力してください')
    .max(100, '氏名は100文字以内で入力してください'),
  email: z
    .string({ error: 'メールアドレスを入力してください' })
    .email('メールアドレスの形式が正しくありません'),
  password: z.string().optional(),
  department: z.string().max(100, '部署は100文字以内で入力してください').optional(),
  position: z.string().max(50, '役職は50文字以内で入力してください').optional(),
  manager_id: z.number().int().positive().optional().nullable(),
});

/**
 * 営業一覧検索パラメータのバリデーションスキーマ
 */
export const staffSearchSchema = z.object({
  name: z.string().optional(),
  department: z.string().optional(),
  simple: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  per_page: z.coerce.number().int().min(1).max(100).optional(),
});

export type StaffCreateInput = z.infer<typeof staffCreateSchema>;
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;
export type StaffSearchInput = z.infer<typeof staffSearchSchema>;
