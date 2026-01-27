# 開発ログ & 決定事項メモ

## 2026-01-27: 環境構築 & Prisma v7 導入

### 1. プロジェクト作成
- `npx create-next-app@latest karamane`
- Tailwind CSS, TypeScript, App Router: ON

### 2. Prisma v7 (Early Access) 導入
- **インストール**: `npm install prisma@latest @prisma/client@latest dotenv`
- **変更点**:
  - `schema.prisma` から `datasource` の URL 指定を削除。
  - 新しく `prisma.config.ts` を作成して、そこで `url: "file:./dev.db"` を指定。
  - `schema.prisma` の generator は `prisma-client-js` を使用。

### 3. DB設計（SQLite）
- **User**: 音域情報 (`minNoteId`, `maxNoteId`) を持つ。
- **Song**: 曲ごとの音域と YouTube URL を持つ。
- **NoteMap**: 音域計算ロジック（ロジック自体はコードで持つ方針）。

### 4. Git運用
- 初期コミット完了。
- 今後は「機能ごとにブランチを切る」運用を開始。

---

## 2026-01-27: 共通レイアウト実装 & チーム開発フロー体験

### 1. 共通コンポーネント実装
- **Header**: `src/components/Header.tsx` 作成。ロゴ、ナビゲーションリンクを配置。
- **Layout**: `src/app/layout.tsx` に Header を配置し、全ページ共通化。

### 2. トラブルシューティング: Prisma Client Import
- **現象**: `import { PrismaClient } from '@prisma/client'` で赤線が出る。
- **原因**: VS Code が生成された型定義ファイルを認識できていなかった（キャッシュや初期化タイミングの問題）。
- **解決策**:
  - `node_modules` 内の `.prisma` と `@prisma` を再構築（`npm install`）。
  - `npx prisma generate` を再実行。
  - 結果、標準のインポート記述で正常動作を確認。

### 3. Git運用フロー (チーム開発シミュレーション)
1. **ブランチ作成**: `git checkout -b feat/header` で作業用ブランチを作成。
2. **実装 & コミット**: 機能実装後にコミット。
3. **プッシュ**: `git push --set-upstream origin feat/header`。
4. **Pull Request (PR)**: GitHub 上で PR を作成し、`main` ブランチへマージ。
5. **ローカル更新**: `git checkout main` -> `git pull origin main` で最新化。
6. **掃除**: `git branch -d feat/header` で作業ブランチ削除。

---

## 2026-01-27: Prisma v7 (Early Access) + PostgreSQL (Neon) 構築ログ

### 1. 構成変更の理由
- Prisma v7 の SQLite アダプターが環境によって不安定だったため。
- v7 の推奨構成（`prisma.config.ts` + Adapter）を最大限活かすため、クラウドDBの **Neon (PostgreSQL)** を採用。

### 2. 必要なパッケージ
Prisma v7 で PostgreSQL を使うための「アダプター構成」に必要なもの。

```bash
npm install dotenv pg @prisma/adapter-pg
npm install -D @types/pg