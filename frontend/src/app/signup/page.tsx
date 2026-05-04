"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const fieldClass =
  "block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";
const labelClass =
  "block text-sm font-medium text-neutral-700 dark:text-neutral-200";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/books");
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(name, email, password);
      router.push("/books");
    } catch (err) {
      setError(err instanceof Error ? err.message : "サインアップに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-black/5 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">サインアップ</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={labelClass}>名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>パスワード（8文字以上）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={fieldClass}
            />
          </div>
          {error && (
            <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              エラー: {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-neutral-900"
          >
            {submitting ? "送信中..." : "登録"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          既にアカウントをお持ちの場合は{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ログイン
          </Link>
        </p>
      </div>
    </main>
  );
}
