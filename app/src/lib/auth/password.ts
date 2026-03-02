import bcrypt from 'bcryptjs';

/** bcrypt のソルトラウンド数 */
const SALT_ROUNDS = 12;

/**
 * パスワードをハッシュ化する
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * パスワードを検証する
 * @returns 一致する場合は true
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
