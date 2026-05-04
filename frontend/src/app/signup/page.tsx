"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
    <main
      style={{
        maxWidth: 400,
        margin: "3rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>サインアップ</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <label>
          名前
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>
        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>
        <label>
          パスワード（8文字以上）
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>
        {error && (
          <p style={{ color: "crimson", margin: 0 }}>エラー: {error}</p>
        )}
        <button type="submit" disabled={submitting} style={{ padding: "0.5rem" }}>
          {submitting ? "送信中..." : "登録"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        既にアカウントをお持ちの場合は <Link href="/login">ログイン</Link>
      </p>
    </main>
  );
}
