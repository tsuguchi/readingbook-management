"use client";

import { useCallback, useEffect, useState } from "react";

type Health = {
  status: string;
  rails: string;
  ruby: string;
  env: string;
  time: string;
  db: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ApiHealthPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/v1/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHealth((await res.json()) as Health);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">API Health Check</h1>
      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
        Endpoint:{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800">
          {apiUrl}/api/v1/health
        </code>
      </p>
      <button
        onClick={fetchHealth}
        disabled={loading}
        className="mb-4 inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        {loading ? "Loading..." : "Refresh"}
      </button>
      {error && (
        <pre className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          Error: {error}
        </pre>
      )}
      {health && (
        <pre className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
    </main>
  );
}
