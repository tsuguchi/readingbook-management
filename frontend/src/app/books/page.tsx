"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiFetch,
  STATUS_COLOR,
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
    return <main style={{ padding: "2rem" }}>...</main>;
  }

  return (
    <main
      style={{
        maxWidth: 800,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>書籍一覧</h1>
        <Link href="/books/new">
          <button type="button">新規追加</button>
        </Link>
      </header>

      <div style={{ marginBottom: "1rem" }}>
        ステータス:&nbsp;
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "" | BookStatus)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "crimson" }}>エラー: {error}</p>}
      {loading ? (
        <p>読み込み中...</p>
      ) : books.length === 0 ? (
        <p>該当する書籍はありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {books.map((book) => (
            <li
              key={book.id}
              style={{
                border: "1px solid rgba(128, 128, 128, 0.4)",
                borderRadius: 6,
                padding: "0.75rem 1rem",
                marginBottom: "0.5rem",
              }}
            >
              <Link
                href={`/books/${book.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{book.title}</strong>
                  <span
                    style={{
                      padding: "0.15rem 0.6rem",
                      borderRadius: 999,
                      background: STATUS_COLOR[book.status].bg,
                      color: STATUS_COLOR[book.status].fg,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {STATUS_LABEL[book.status]}
                  </span>
                </div>
                {book.author && (
                  <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                    {book.author}
                  </div>
                )}
                {book.memo && (
                  <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {book.memo}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
