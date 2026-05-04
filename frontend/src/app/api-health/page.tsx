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
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1>API Health Check</h1>
      <p>
        Endpoint: <code>{apiUrl}/api/v1/health</code>
      </p>
      <button
        onClick={fetchHealth}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Loading..." : "Refresh"}
      </button>
      {error && (
        <pre
          style={{
            color: "crimson",
            padding: "1rem",
            background: "#fee",
            marginTop: "1rem",
            whiteSpace: "pre-wrap",
          }}
        >
          Error: {error}
        </pre>
      )}
      {health && (
        <pre
          style={{
            padding: "1rem",
            background: "#f4f4f4",
            marginTop: "1rem",
          }}
        >
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
    </main>
  );
}
