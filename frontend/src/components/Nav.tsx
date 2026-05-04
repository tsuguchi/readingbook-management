"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Nav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav
      style={{
        padding: "0.75rem 1.5rem",
        borderBottom: "1px solid rgba(128, 128, 128, 0.4)",
        display: "flex",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <Link href="/" style={{ fontWeight: "bold", textDecoration: "none" }}>
        📚 ReadingBook
      </Link>
      <Link href="/books" style={{ textDecoration: "none" }}>
        書籍一覧
      </Link>
      <Link href="/api-health" style={{ textDecoration: "none" }}>
        API Health
      </Link>
      <span style={{ marginLeft: "auto" }}>
        {loading ? (
          <span style={{ opacity: 0.6 }}>...</span>
        ) : user ? (
          <>
            <span style={{ marginRight: "0.75rem" }}>{user.name}</span>
            <button onClick={handleLogout} type="button">
              ログアウト
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              style={{ textDecoration: "none", marginRight: "0.5rem" }}
            >
              ログイン
            </Link>
            <Link href="/signup" style={{ textDecoration: "none" }}>
              サインアップ
            </Link>
          </>
        )}
      </span>
    </nav>
  );
}
