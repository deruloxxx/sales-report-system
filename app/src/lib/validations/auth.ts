import { z } from 'zod';

/**
 * ログインリクエストのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z
    .string({ error: 'メールアドレスを入力してください' })
    .email('メールアドレスの形式が正しくありません'),
  password: z
    .string({ error: 'パスワードを入力してください' })
    .min(1, 'パスワードを入力してください'),
});

export type LoginInput = z.infer<typeof loginSchema>;
