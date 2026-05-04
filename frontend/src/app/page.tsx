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
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight">📚 ReadingBook Management</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        読書記録を管理するアプリです。
      </p>
      <p className="flex gap-3 text-sm">
        <Link href="/books" className="text-blue-600 hover:text-blue-500">
          書籍一覧
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/login" className="text-blue-600 hover:text-blue-500">
          ログイン
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/signup" className="text-blue-600 hover:text-blue-500">
          サインアップ
        </Link>
      </p>
    </main>
  );
}
