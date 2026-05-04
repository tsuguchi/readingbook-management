import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Write inside the frontend bind mount so the host can pick the files up.
// A wrapper script (or `npm run screenshots:copy`) moves them to docs/.
const OUT =
  process.env.SCREENSHOT_OUT_DIR ?? path.resolve(__dirname, "../tmp/screenshots");
const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const colorScheme = process.env.COLOR_SCHEME ?? "dark";
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1) Login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(OUT, "01-login.png") });
  console.log("saved 01-login.png");

  // Authenticate
  await page.getByLabel("メールアドレス").fill("demo@example.com");
  await page.getByLabel("パスワード").fill("password1234");
  await page.getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL("**/books");
  // Wait for the seeded books to actually render (they are fetched
  // client-side after auth restoration).
  await page.getByText("リーダブルコード").first().waitFor();
  await page.waitForLoadState("networkidle");

  // 2) Books list
  await page.screenshot({
    path: path.join(OUT, "02-books-list.png"),
    fullPage: true,
  });
  console.log("saved 02-books-list.png");

  // 3) New book form
  await page.goto(`${BASE}/books/new`);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("タイトル").fill("（例）SOFT SKILLS");
  await page.getByLabel("著者").fill("John Sonmez");
  await page.getByLabel("ステータス").selectOption("reading");
  await page.getByLabel("メモ").fill("キャリア論として参考にしたい。");
  await page.screenshot({ path: path.join(OUT, "03-books-new.png") });
  console.log("saved 03-books-new.png");

  // 4) Book edit
  await page.goto(`${BASE}/books`);
  await page.getByText("リーダブルコード").first().waitFor();
  await page.getByText("リーダブルコード").first().click();
  await page.waitForURL(/\/books\/\d+$/);
  // Wait until the form has been hydrated with the fetched book.
  await page.getByRole("heading", { name: "書籍を編集" }).waitFor();
  await page
    .getByLabel("タイトル")
    .filter({ has: page.locator("[value]") })
    .or(page.getByLabel("タイトル"))
    .first()
    .waitFor();
  await page.waitForFunction(() => {
    const el = document.getElementById("book-title");
    return el instanceof HTMLInputElement && el.value.length > 0;
  });
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUT, "04-books-edit.png"),
    fullPage: true,
  });
  console.log("saved 04-books-edit.png");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
