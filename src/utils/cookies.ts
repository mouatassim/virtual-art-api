import { FastifyReply } from "fastify";

interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
}

export function setCookie(
  reply: FastifyReply,
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  const parts = [`${name}=${value}`];
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite)
    parts.push(
      `SameSite=${options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1)}`,
    );
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  reply.header("Set-Cookie", parts.join("; "));
}

export function clearCookie(
  reply: FastifyReply,
  name: string,
  options: Omit<CookieOptions, "maxAge" | "expires"> = {},
): void {
  setCookie(reply, name, "", { ...options, maxAge: 0 });
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce(
    (cookies, cookie) => {
      const [name, ...rest] = cookie.split("=");
      const value = rest.join("=").trim();
      if (name && value) cookies[name.trim()] = decodeURIComponent(value);
      return cookies;
    },
    {} as Record<string, string>,
  );
}

export function getCookie(
  cookieHeader: string | undefined,
  name: string,
): string | undefined {
  return parseCookies(cookieHeader)[name];
}
