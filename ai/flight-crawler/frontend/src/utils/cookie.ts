const ORIGIN_COOKIE_KEY = 'flight_origin';
const COOKIE_DAYS = 90;

export function getOriginCookie(): string {
  const row = document.cookie.split('; ').find(r => r.startsWith(`${ORIGIN_COOKIE_KEY}=`));
  return row ? decodeURIComponent(row.split('=').slice(1).join('=')) : '';
}

export function setOriginCookie(value: string): void {
  const expires = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString();
  document.cookie = `${ORIGIN_COOKIE_KEY}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

/** 读取出发地：优先 cookie，没有则返回默认值 */
export function getDefaultOrigin(fallback = '北京首都'): string {
  return getOriginCookie() || fallback;
}
