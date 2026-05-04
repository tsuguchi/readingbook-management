const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "readingbook_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const messageFromBody =
      isRecord(body) && typeof body.error === "string"
        ? body.error
        : isRecord(body) && Array.isArray(body.errors)
          ? body.errors.join(", ")
          : `HTTP ${status}`;
    super(messageFromBody);
    this.status = status;
    this.body = body;
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
};

export async function apiFetch<T = unknown>(
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const { json, headers, ...rest } = opts;
  const token = getToken();
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export type BookStatus = "unread" | "reading" | "finished";

export type Book = {
  id: number;
  title: string;
  author: string | null;
  status: BookStatus;
  memo: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export const STATUS_LABEL: Record<BookStatus, string> = {
  unread: "未読",
  reading: "読書中",
  finished: "読了",
};

export const STATUS_COLOR: Record<BookStatus, { bg: string; fg: string }> = {
  unread: { bg: "#6c757d", fg: "#ffffff" },
  reading: { bg: "#0d6efd", fg: "#ffffff" },
  finished: { bg: "#198754", fg: "#ffffff" },
};
