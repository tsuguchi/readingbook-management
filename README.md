# readingbook-management

読書記録を管理するアプリ。

## 概要

読んだ本のタイトル・著者・感想・読了日などを記録し、自分の読書履歴を管理できるWebアプリケーションです。

## 技術スタック

- **バックエンド**: Ruby / Ruby on Rails
- **フロントエンド**: Next.js (React / TypeScript)
- **データベース**: MySQL（AWS RDS）
- **認証**: TBD
- **インフラ**: AWS

## 主な機能（予定）

- 書籍の登録・編集・削除
- 読書ステータス管理（未読 / 読書中 / 読了）
- 感想・メモの記録
- 読書履歴の一覧・検索
- 読書統計の表示

## セットアップ

開発環境はすべて Docker / Docker Compose で動作します。ホストに Ruby / Node / MySQL を入れる必要はありません。

### 必要環境

- Docker Desktop（Windowsの場合は WSL2 backend）

### 手順

```bash
# 1. 環境変数ファイルを用意
cp .env.example .env

# 2. コンテナをビルド・起動
docker compose up --build

# 3. 初回のみ DB を作成・マイグレーション（別ターミナルで）
docker compose exec backend bundle exec rails db:create db:migrate
```

起動すると以下にアクセスできます。

- Rails API: http://localhost:3000
- Next.js: http://localhost:3001
- MySQL: `localhost:3306`（ユーザ: `root` / パスワード: `.env` の `MYSQL_ROOT_PASSWORD`）

### よく使うコマンド

```bash
# 停止
docker compose down

# DBもまっさらに
docker compose down -v

# Railsコンソール
docker compose exec backend bundle exec rails console

# マイグレーション生成
docker compose exec backend bundle exec rails generate migration MigrationName

# ログ確認
docker compose logs -f backend
docker compose logs -f frontend
```

## ディレクトリ構成

```
readingbook-management/
├── backend/             # Ruby on Rails 8 (API mode)
│   └── Dockerfile.dev
├── frontend/            # Next.js 15 (App Router / TypeScript)
│   └── Dockerfile.dev
├── docker-compose.yml   # backend / frontend / mysql の3サービス
└── .env.example
```

## ライセンス

[MIT License](LICENSE)
