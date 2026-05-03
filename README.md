# readingbook-management

読書記録を管理するアプリ。

## 概要

読んだ本のタイトル・著者・感想・読了日などを記録し、自分の読書履歴を管理できるWebアプリケーションです。

## 技術スタック

- **バックエンド**: Ruby / Ruby on Rails
- **フロントエンド**: Next.js (React / TypeScript)
- **データベース**: TBD
- **認証**: TBD

## 主な機能（予定）

- 書籍の登録・編集・削除
- 読書ステータス管理（未読 / 読書中 / 読了）
- 感想・メモの記録
- 読書履歴の一覧・検索
- 読書統計の表示

## セットアップ

### 必要環境

- Ruby: TBD
- Node.js: TBD
- Rails: TBD

### バックエンド (Rails API)

```bash
cd backend
bundle install
rails db:create db:migrate
rails s
```

### フロントエンド (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## ディレクトリ構成（予定）

```
readingbook-management/
├── backend/    # Ruby on Rails (API)
└── frontend/   # Next.js
```

## ライセンス

[MIT License](LICENSE)
