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
    <nav className="sticky top-0 z-10 flex items-center gap-4 border-b border-black/10 bg-white/80 px-6 py-3 backdrop-blur dark:border-white/10 dark:bg-neutral-900/80">
      <Link href="/" className="text-base font-bold tracking-tight">
        📚 ReadingBook
      </Link>
      <Link
        href="/books"
        className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
      >
        書籍一覧
      </Link>
      <div className="ml-auto flex items-center gap-3 text-sm">
        {loading ? (
          <span className="opacity-60">...</span>
        ) : user ? (
          <>
            <span className="text-neutral-600 dark:text-neutral-300">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              type="button"
              className="rounded-md border border-neutral-300 px-3 py-1 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              ログアウト
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-md border border-neutral-300 px-3 py-1 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            >
              サインアップ
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
