import { z } from 'zod';

/**
 * YYYY-MM-DD 形式の日付文字列バリデーション
 */
export const dateStringSchema = z
  .string({ error: '日付を入力してください' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日付はYYYY-MM-DD形式で入力してください')
  .refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: '有効な日付を入力してください' },
  );

/**
 * 正の整数IDバリデーション（パスパラメータ用）
 */
export const idParamSchema = z.coerce
  .number({ error: 'IDは正の整数で指定してください' })
  .int('IDは整数で指定してください')
  .positive('IDは正の整数で指定してください');
