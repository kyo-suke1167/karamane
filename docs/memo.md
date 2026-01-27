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