"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BookForm, { valuesToPayload } from "@/components/BookForm";
import { apiFetch, type Book } from "@/lib/api";

export default function NewBookPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user)
    return <main className="px-4 py-8 text-sm opacity-60">...</main>;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">書籍を追加</h1>
        <Link
          href="/books"
          className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          ← 一覧
        </Link>
      </header>
      <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <BookForm
          submitLabel="作成"
          onSubmit={async (values) => {
            const created = await apiFetch<Book>("/api/v1/books", {
              method: "POST",
              json: valuesToPayload(values),
            });
            router.push(`/books/${created.id}`);
          }}
        />
      </div>
    </main>
  );
}
