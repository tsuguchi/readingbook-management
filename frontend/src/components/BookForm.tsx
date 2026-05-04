"use client";

import { useState } from "react";
import { STATUS_LABEL, type Book, type BookStatus } from "@/lib/api";

export type BookFormValues = {
  title: string;
  author: string;
  status: BookStatus;
  memo: string;
  finished_at: string;
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

const fieldClass =
  "block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";
const labelClass =
  "block text-sm font-medium text-neutral-700 dark:text-neutral-200";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="book-title" className={labelClass}>
          タイトル
        </label>
        <input
          id="book-title"
          type="text"
          required
          maxLength={255}
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="book-author" className={labelClass}>
          著者
        </label>
        <input
          id="book-author"
          type="text"
          maxLength={255}
          value={values.author}
          onChange={(e) => update("author", e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="book-status" className={labelClass}>
          ステータス
        </label>
        <select
          id="book-status"
          value={values.status}
          onChange={(e) => update("status", e.target.value as BookStatus)}
          className={fieldClass}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      {values.status === "finished" && (
        <div className="space-y-1">
          <label htmlFor="book-finished-at" className={labelClass}>
            読了日時
          </label>
          <input
            id="book-finished-at"
            type="datetime-local"
            value={values.finished_at}
            onChange={(e) => update("finished_at", e.target.value)}
            className={fieldClass}
          />
        </div>
      )}
      <div className="space-y-1">
        <label htmlFor="book-memo" className={labelClass}>
          メモ
        </label>
        <textarea
          id="book-memo"
          rows={4}
          value={values.memo}
          onChange={(e) => update("memo", e.target.value)}
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
        {submitting ? "送信中..." : submitLabel}
      </button>
    </form>
  );
}
