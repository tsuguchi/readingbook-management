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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

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

  if (authLoading || !user)
    return <main className="px-4 py-8 text-sm opacity-60">...</main>;

  if (loadError) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-8">
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {loadError}
        </p>
        <Link
          href="/books"
          className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500"
        >
          ← 一覧に戻る
        </Link>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="px-4 py-8 text-sm opacity-60">読み込み中...</main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">書籍を編集</h1>
        <Link
          href="/books"
          className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          ← 一覧
        </Link>
      </header>

      {saved && (
        <p className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
          ✓ 保存しました
        </p>
      )}

      <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <BookForm
          key={book.updated_at}
          initial={bookToValues(book)}
          submitLabel="更新"
          onSubmit={async (values) => {
            const updated = await apiFetch<Book>(`/api/v1/books/${book.id}`, {
              method: "PATCH",
              json: valuesToPayload(values),
            });
            setBook(updated);
            setSaved(true);
          }}
        />
      </div>

      <div className="mt-8 rounded-xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/60 dark:bg-red-950/20">
        <h2 className="mb-2 text-sm font-semibold text-red-700 dark:text-red-300">
          危険ゾーン
        </h2>
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          この操作は元に戻せません。
        </p>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60"
        >
          この書籍を削除
        </button>
      </div>
    </main>
  );
}
