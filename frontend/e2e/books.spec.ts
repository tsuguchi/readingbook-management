import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password1234";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("メールアドレス").fill(DEMO_EMAIL);
  await page.getByLabel("パスワード").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL("**/books");
}

test.describe("Books CRUD", () => {
  test("login shows the seeded books", async ({ page }) => {
    await login(page);

    await expect(page.getByRole("heading", { name: "書籍一覧" })).toBeVisible();
    // Seed inserts these three titles for the demo user.
    await expect(page.getByText("リーダブルコード")).toBeVisible();
    await expect(page.getByText("ドメイン駆動設計入門")).toBeVisible();
    await expect(page.getByText("達人プログラマー")).toBeVisible();
  });

  test("filter narrows the list by status", async ({ page }) => {
    await login(page);

    await page.getByLabel("ステータス:").selectOption("reading");

    await expect(page.getByText("ドメイン駆動設計入門")).toBeVisible();
    await expect(page.getByText("リーダブルコード")).not.toBeVisible();
  });

  test("create, edit, then delete a book", async ({ page }) => {
    await login(page);

    const initialTitle = `E2E book ${Date.now()}`;
    const updatedTitle = `${initialTitle} (updated)`;

    // Create
    await page.getByRole("link", { name: /新規追加/ }).click();
    await page.waitForURL("**/books/new");
    await page.getByLabel("タイトル").fill(initialTitle);
    await page.getByLabel("著者").fill("E2E Author");
    await page.getByLabel("メモ").fill("created via Playwright");
    await page.getByRole("button", { name: "作成" }).click();

    await page.waitForURL(/\/books\/\d+$/);
    await expect(page.getByRole("heading", { name: "書籍を編集" })).toBeVisible();
    await expect(page.getByLabel("タイトル")).toHaveValue(initialTitle);

    // Edit
    await page.getByLabel("タイトル").fill(updatedTitle);
    await page.getByLabel("ステータス").selectOption("reading");
    await page.getByRole("button", { name: "更新" }).click();
    await expect(page.getByText("✓ 保存しました")).toBeVisible();

    // The list page now shows the updated title under "reading".
    await page.getByRole("link", { name: "← 一覧" }).click();
    await page.waitForURL("**/books");
    await page.getByLabel("ステータス:").selectOption("reading");
    await expect(page.getByText(updatedTitle)).toBeVisible();

    // Delete (auto-confirm the window.confirm dialog)
    await page.getByText(updatedTitle).click();
    await page.waitForURL(/\/books\/\d+$/);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /削除/ }).click();
    await page.waitForURL("**/books");
    await expect(page.getByText(updatedTitle)).not.toBeVisible();
  });
});
