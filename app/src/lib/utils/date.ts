/**
 * Date オブジェクトを YYYY-MM-DD 形式の文字列に変換する
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Date オブジェクトを ISO 8601 形式（タイムゾーン付き）の文字列に変換する
 * 例: 2026-03-02T18:30:00+09:00
 */
export function formatDateTime(date: Date): string {
  return date.toISOString();
}

/**
 * YYYY-MM-DD 形式の文字列を Date オブジェクトに変換する
 * 無効な日付の場合は null を返す
 */
export function parseDate(dateString: string): Date | null {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得する
 */
export function today(): string {
  return formatDate(new Date());
}
