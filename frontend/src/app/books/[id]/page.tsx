"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BookForm, { bookToValues, valuesToPayload } from "@/components/BookForm";
import { ApiError, apiFetch, type Book } from "@/lib/api";

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user, loading: authLoading } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !id) return;
    apiFetch<Book>(`/api/v1/books/${id}`)
      .then(setBook)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          setLoadError("書籍が見つかりません");
        } else {
          setLoadError(e instanceof Error ? e.message : "取得に失敗しました");
        }
      });
  }, [user, id]);

  const handleDelete = async () => {
    if (!book) return;
    if (!window.confirm(`「${book.title}」を削除しますか？`)) return;
    await apiFetch(`/api/v1/books/${book.id}`, { method: "DELETE" });
    router.push("/books");
  };

  if (authLoading || !user) return <main style={{ padding: "2rem" }}>...</main>;
  if (loadError)
    return (
      <main style={{ padding: "2rem" }}>
        <p style={{ color: "crimson" }}>{loadError}</p>
        <Link href="/books">← 一覧に戻る</Link>
      </main>
    );
  if (!book) return <main style={{ padding: "2rem" }}>読み込み中...</main>;

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>書籍を編集</h1>
        <Link href="/books">← 一覧</Link>
      </header>
      <BookForm
        initial={bookToValues(book)}
        submitLabel="更新"
        onSubmit={async (values) => {
          const updated = await apiFetch<Book>(`/api/v1/books/${book.id}`, {
            method: "PATCH",
            json: valuesToPayload(values),
          });
          setBook(updated);
        }}
      />
      <hr style={{ margin: "2rem 0" }} />
      <button
        type="button"
        onClick={handleDelete}
        style={{ padding: "0.5rem 1rem", color: "crimson" }}
      >
        この書籍を削除
      </button>
    </main>
  );
}
