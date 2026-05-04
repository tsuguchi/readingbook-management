"use client";

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

  if (loading || !user) return <main style={{ padding: "2rem" }}>...</main>;

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>書籍を追加</h1>
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
    </main>
  );
}
