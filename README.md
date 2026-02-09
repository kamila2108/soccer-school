# サッカー教室ホームページ

## プロジェクト構成

- **フロントエンド**: Next.js + TypeScript + Tailwind CSS (`frontend/`)
- **バックエンド**: Express + TypeScript + Prisma (`backend/`)
- **データベース**: PostgreSQL

## セットアップ手順

### 1. 環境変数の設定

#### バックエンド
```bash
cd backend
cp .env.example .env.local
# .env.localを編集して実際の値を設定
```

#### フロントエンド
```bash
cd frontend
cp .env.example .env.local
# .env.localを編集して実際の値を設定
```

### 2. データベースのセットアップ

PostgreSQLを起動し、データベースを作成します。

```bash
# PostgreSQLに接続
psql -U postgres

# データベースを作成
CREATE DATABASE soccer_db;
```

### 3. Prismaマイグレーション

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 4. 開発サーバーの起動

#### バックエンド
```bash
cd backend
npm run dev
```
バックエンドは `http://localhost:3001` で起動します。

#### フロントエンド
```bash
cd frontend
npm run dev
```
フロントエンドは `http://localhost:3000` で起動します。

## プロジェクト構造

```
soccer/
├── frontend/          # Next.js フロントエンド
│   ├── app/          # App Router
│   ├── components/   # Reactコンポーネント
│   └── ...
├── backend/          # Express バックエンド
│   ├── src/          # ソースコード
│   ├── prisma/       # Prismaスキーマ
│   └── ...
└── README.md
```

## 開発スケジュール

詳細は `開発スケジュール.md` を参照してください。
