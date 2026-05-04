"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/books" : "/login");
  }, [loading, user, router]);

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <h1>📚 ReadingBook Management</h1>
      <p>読書記録を管理するアプリです。</p>
      <p>
        <Link href="/books">書籍一覧</Link> /{" "}
        <Link href="/login">ログイン</Link> /{" "}
        <Link href="/signup">サインアップ</Link>
      </p>
    </main>
  );
}
