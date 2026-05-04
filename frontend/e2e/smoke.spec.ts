import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
    await expect(page.getByLabel("メールアドレス")).toBeVisible();
    await expect(page.getByLabel("パスワード")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ログイン" })
    ).toBeVisible();
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByRole("heading", { name: "サインアップ" })).toBeVisible();
    await expect(page.getByLabel("名前")).toBeVisible();
    await expect(page.getByLabel("メールアドレス")).toBeVisible();
    await expect(page.getByLabel(/パスワード/)).toBeVisible();
  });

  test("home redirects to /login when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/(login|books)$/);
    expect(page.url()).toMatch(/\/login$/);
  });
});
