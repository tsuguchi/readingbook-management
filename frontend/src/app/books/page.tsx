"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiFetch,
  STATUS_LABEL,
  type Book,
  type BookStatus,
} from "@/lib/api";

const STATUS_OPTIONS: ({ value: ""; label: string } | { value: BookStatus; label: string })[] = [
  { value: "", label: "すべて" },
  { value: "unread", label: STATUS_LABEL.unread },
  { value: "reading", label: STATUS_LABEL.reading },
  { value: "finished", label: STATUS_LABEL.finished },
];

const STATUS_BADGE_CLASS: Record<BookStatus, string> = {
  unread: "bg-neutral-500 text-white",
  reading: "bg-blue-600 text-white",
  finished: "bg-emerald-600 text-white",
};

export default function BooksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"" | BookStatus>("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const fetchBooks = useCallback(async (status: "" | BookStatus) => {
    setLoading(true);
    setError(null);
    try {
      const path = status ? `/api/v1/books?status=${status}` : "/api/v1/books";
      setBooks(await apiFetch<Book[]>(path));
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchBooks(filter);
  }, [user, filter, fetchBooks]);

  if (authLoading || !user) {
    return <main className="px-4 py-8 text-sm opacity-60">...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">書籍一覧</h1>
        <Link
          href="/books/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + 新規追加
        </Link>
      </header>

      <div className="mb-6 flex items-center gap-2 text-sm">
        <label
          htmlFor="status-filter"
          className="text-neutral-600 dark:text-neutral-400"
        >
          ステータス:
        </label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "" | BookStatus)}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          エラー: {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm opacity-60">読み込み中...</p>
      ) : books.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 px-6 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          該当する書籍はありません。
        </div>
      ) : (
        <ul className="space-y-3">
          {books.map((book) => (
            <li key={book.id}>
              <Link
                href={`/books/${book.id}`}
                className="block rounded-lg border border-black/5 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-white/10 dark:bg-neutral-900 dark:hover:border-blue-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold leading-tight">{book.title}</h2>
                    {book.author && (
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {book.author}
                      </p>
                    )}
                    {book.memo && (
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-700 dark:text-neutral-300">
                        {book.memo}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASS[book.status]}`}
                  >
                    {STATUS_LABEL[book.status]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
