"use client";

import { useState } from "react";
import { STATUS_LABEL, type Book, type BookStatus } from "@/lib/api";

export type BookFormValues = {
  title: string;
  author: string;
  status: BookStatus;
  memo: string;
  finished_at: string; // ISO datetime-local value (yyyy-MM-ddThh:mm)
};

const STATUSES: BookStatus[] = ["unread", "reading", "finished"];

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function bookToValues(book: Book): BookFormValues {
  return {
    title: book.title,
    author: book.author ?? "",
    status: book.status,
    memo: book.memo ?? "",
    finished_at: toLocalInputValue(book.finished_at),
  };
}

export function valuesToPayload(values: BookFormValues): Record<string, unknown> {
  return {
    title: values.title,
    author: values.author || null,
    status: values.status,
    memo: values.memo || null,
    finished_at:
      values.status === "finished" && values.finished_at
        ? new Date(values.finished_at).toISOString()
        : null,
  };
}

type Props = {
  initial?: BookFormValues;
  onSubmit: (values: BookFormValues) => Promise<void>;
  submitLabel: string;
};

const EMPTY: BookFormValues = {
  title: "",
  author: "",
  status: "unread",
  memo: "",
  finished_at: "",
};

export default function BookForm({ initial, onSubmit, submitLabel }: Props) {
  const [values, setValues] = useState<BookFormValues>(initial ?? EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof BookFormValues>(
    key: K,
    value: BookFormValues[K]
  ) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
    >
      <label>
        タイトル
        <input
          type="text"
          required
          maxLength={255}
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
        />
      </label>
      <label>
        著者
        <input
          type="text"
          maxLength={255}
          value={values.author}
          onChange={(e) => update("author", e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
        />
      </label>
      <label>
        ステータス
        <select
          value={values.status}
          onChange={(e) => update("status", e.target.value as BookStatus)}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      {values.status === "finished" && (
        <label>
          読了日時
          <input
            type="datetime-local"
            value={values.finished_at}
            onChange={(e) => update("finished_at", e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>
      )}
      <label>
        メモ
        <textarea
          rows={4}
          value={values.memo}
          onChange={(e) => update("memo", e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
        />
      </label>
      {error && <p style={{ color: "crimson", margin: 0 }}>エラー: {error}</p>}
      <button type="submit" disabled={submitting} style={{ padding: "0.5rem" }}>
        {submitting ? "送信中..." : submitLabel}
      </button>
    </form>
  );
}
