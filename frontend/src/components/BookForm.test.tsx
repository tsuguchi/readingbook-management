import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookForm, {
  bookToValues,
  valuesToPayload,
  type BookFormValues,
} from "./BookForm";
import type { Book } from "@/lib/api";

const sampleBook: Book = {
  id: 1,
  title: "Foo",
  author: "Bar",
  status: "reading",
  memo: "memo",
  finished_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
};

describe("bookToValues / valuesToPayload", () => {
  it("clears finished_at when status is not finished", () => {
    const values: BookFormValues = {
      title: "T",
      author: "",
      status: "reading",
      memo: "",
      finished_at: "2026-01-01T10:00",
    };
    expect(valuesToPayload(values).finished_at).toBeNull();
  });

  it("converts finished_at to ISO when status is finished", () => {
    const values: BookFormValues = {
      title: "T",
      author: "",
      status: "finished",
      memo: "",
      finished_at: "2026-01-01T10:00",
    };
    const payload = valuesToPayload(values);
    expect(payload.finished_at).toMatch(
      /^2026-01-01T\d{2}:00:00\.000Z$/
    );
  });

  it("normalizes empty strings to null", () => {
    const payload = valuesToPayload({
      title: "T",
      author: "",
      status: "unread",
      memo: "",
      finished_at: "",
    });
    expect(payload.author).toBeNull();
    expect(payload.memo).toBeNull();
  });

  it("bookToValues round-trips through string fields", () => {
    expect(bookToValues(sampleBook)).toEqual(
      expect.objectContaining({
        title: "Foo",
        author: "Bar",
        status: "reading",
        memo: "memo",
        finished_at: "",
      })
    );
  });
});

describe("<BookForm />", () => {
  it("submits the form with current values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BookForm onSubmit={onSubmit} submitLabel="保存" />);

    await user.type(screen.getByLabelText("タイトル"), "新しい本");
    await user.type(screen.getByLabelText("著者"), "誰か");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "新しい本", author: "誰か", status: "unread" })
    );
  });

  it("shows finished_at field only when status is finished", async () => {
    const user = userEvent.setup();
    render(<BookForm onSubmit={vi.fn()} submitLabel="保存" />);

    expect(screen.queryByLabelText("読了日時")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("ステータス"), "finished");

    expect(screen.getByLabelText("読了日時")).toBeInTheDocument();
  });

  it("displays the error message when onSubmit rejects", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("API は壊れた"));
    render(<BookForm onSubmit={onSubmit} submitLabel="保存" />);

    await user.type(screen.getByLabelText("タイトル"), "T");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText(/API は壊れた/)).toBeInTheDocument();
  });
});
