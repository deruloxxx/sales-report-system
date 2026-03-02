import { z } from 'zod';

/**
 * コメント投稿リクエストのバリデーションスキーマ
 */
export const commentCreateSchema = z.object({
  comment_body: z
    .string({ error: 'コメントを入力してください' })
    .min(1, 'コメントを入力してください')
    .max(1000, 'コメントは1000文字以内で入力してください'),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
