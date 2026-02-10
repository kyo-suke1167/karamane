# 開発ログ & 決定事項メモ

## 2026-01-27: 環境構築 & Prisma v7 導入

### 1. プロジェクト作成
- `npx create-next-app@latest karamane`
- Tailwind CSS, TypeScript, App Router: ON

### 2. Prisma v7 (Early Access) 導入
- インストール: `npm install prisma@latest @prisma/client@latest dotenv`
- 変更点:
    - `schema.prisma` から `datasource` の URL 指定を削除。
    - 新しく `prisma.config.ts` を作成して、そこで `url: "file:./dev.db"` を指定（※後にPostgreSQLへ移行）。
    - `schema.prisma` の generator は `prisma-client-js` を使用。

### 3. DB設計（SQLite時代）
- User: 音域情報 (`minNoteId`, `maxNoteId`) を持つ。
- Song: 曲ごとの音域と YouTube URL を持つ。
- NoteMap: 音域計算ロジック（コードで管理）。

### 4. Git運用
- 初期コミット完了。
- 「機能ごとにブランチを切る」運用を開始。

---

## 2026-01-27: 共通レイアウト実装 & チーム開発フロー体験

### 1. 共通コンポーネント実装
- Header: `src/components/Header.tsx` 作成。ロゴ、ナビゲーションリンクを配置。
- Layout: `src/app/layout.tsx` に Header を配置し、全ページ共通化。

### 2. トラブルシューティング: Prisma Client Import
- 現象: `import { PrismaClient } from '@prisma/client'` で赤線が出る。
- 原因: VS Code が生成された型定義ファイルを認識できていなかった（キャッシュや初期化タイミングの問題）。
- 解決策:
    - `node_modules` 内の `.prisma` と `@prisma` を再構築（`npm install`）。
    - `npx prisma generate` を再実行。
    - 結果、標準のインポート記述で正常動作を確認。

### 3. Git運用フロー (チーム開発シミュレーション)
1. ブランチ作成: `git checkout -b feat/header` で作業用ブランチを作成。
2. 実装 & コミット: 機能実装後にコミット。
3. プッシュ: `git push --set-upstream origin feat/header`。
4. Pull Request (PR): GitHub 上で PR を作成し、`main` ブランチへマージ。
5. ローカル更新: `git checkout main` -> `git pull origin main` で最新化。
6. 掃除: `git branch -d feat/header` で作業ブランチ削除。

---

## 2026-01-27: Prisma v7 (Early Access) + PostgreSQL (Neon) 構築ログ

### 1. 構成変更の理由
- Prisma v7 の SQLite アダプターが環境によって不安定だったため。
- v7 の推奨構成（`prisma.config.ts` + Adapter）を最大限活かすため、クラウドDBの Neon (PostgreSQL) を採用。

### 2. 必要なパッケージ
Prisma v7 で PostgreSQL を使うための「アダプター構成」に必要なもの。
```bash
npm install dotenv pg @prisma/adapter-pg
npm install -D @types/pg

### 3. 設定ファイル構成（v7完全対応版）

#### ① 環境変数 (`.env`)
Neon 用の接続文字列。`prisma.config.ts` (マイグレーション用) とアプリ用で使い分けるため、同じ値を2つ定義。
```bash
DATABASE_URL="postgres://neondb_owner:xxxxx..."
DIRECT_URL="postgres://neondb_owner:xxxxx..."

2026-01-27: 持ち歌登録機能 & UI刷新
1. サーバーアクション実装
Server Actions: APIルートを作らず、src/app/actions.ts で直接DB操作を実行。

データ登録: user_1（手動作成済み）に紐づく形で Song を作成。

2. 音楽理論ロジック (src/lib/noteUtils.ts)
NoteIDシステム: MIDIノート番号（整数）で管理し、表示時に変換。

例: 60 → mid2C

対応音域: 人間の限界を考慮し、lowC (36) 〜 hihiB (95) まで拡張。

カラーリング: 音域の高さに応じてバッジの色を動的に変更（紫→青→緑→橙→ピンク）。

3. ステータス管理
Enum追加: PRACTICING (練習中), LEARNED (持ち歌), MASTERED (十八番) をDBに追加。

UI表現: ステータスごとにカードのアクセントカラー（左線）とアイコンを変更。

4. UI/UX 改善
カード型レイアウト: スマホ（iPhone SE等）でも崩れないよう、Flexboxの縦積みをベースに調整。

階層整理: 「スペック（音域・状態）」をタイトル上部に配置し、視認性を向上。

入力フォーム:

音域入力を input type="number" から select（プルダウン）に変更。

バリデーション: 最低音 > 最高音 になった場合、リアルタイムでエラーを表示し登録ボタンを無効化。

5. Git運用
feat/top-page ブランチで上記機能を開発。

main ブランチへマージ完了。

## 2026-01-28: 詳細ページ & CRUD機能完遂

### 1. 詳細ページ (`src/app/songs/[id]`)
- **Dynamic Route**: `[id]` フォルダを使用して個別ページを作成。
- **型対応**: Next.js 15/16 の仕様（`params` が Promise）に対応し、URLパラメータ（String）を数値（Number）に変換してPrismaに渡す実装を追加。
- **YouTube埋め込み**: URLから正規表現で動画ID（`v=...`）を抽出し、`iframe` プレーヤーを表示するロジック (`youtubeUtils.ts`) を実装。

### 2. キー管理機能 (Killer Feature)
- **DB設計**: `Song` モデルに `key` (Int, default 0) を追加。
- **UI実装**: 詳細画面に `KeyController` (Client Component) を配置。
- **ロジック**: ユーザーの音域 (`User.min/maxNoteId`) と曲の音域を比較し、「あなたの最高音に合わせるなら +2」といった**推奨キー提案機能**を実装。
- **Server Action**: `updateSongKey` により、画面遷移なしでキー設定を非同期保存。

### 3. メモ機能
- **DB設計**: `Song` モデルに `memo` (String?) を追加。
- 登録・詳細・編集の各画面に入力エリアと表示エリアを実装。

### 4. 編集・削除機能 (Update & Delete)
- **編集**: 既存データをフォーム (`EditSongForm`) に初期値として流し込み、Server Action (`updateSong`) で一括更新。
- **削除**: JavaScriptの `confirm` で確認ダイアログを表示後、Server Action (`deleteSong`) を実行しトップページへリダイレクト。
- これにより、**CRUD (Create, Read, Update, Delete)** すべての機能実装が完了。

## 2026-01-28 (Part 2): ユーザー認証 & データ個別化

### 1. 認証基盤の構築
- **ライブラリ導入**: `NextAuth.js`, `bcryptjs`, `@next-auth/prisma-adapter` をインストール。
- **Prisma連携**: 認証情報をDB (`User` テーブル) で管理するためのアダプター設定を追加。
- **環境設定**: `.env` に `NEXTAUTH_SECRET`, `NEXTAUTH_URL` を設定し、セキュリティを強化。

### 2. ユーザー登録フロー (Signup)
- **対話形式UI**: ウィザード形式（Step 1: 基本情報 → Step 2: 音域設定）の登録画面を実装。
- **バリデーション**:
  - パスワード強度チェック（8文字以上・半角英数記号）。
  - メールアドレスの重複チェック（Server Action: `checkEmail`）。
- **パスワード可視化**: 入力欄に「目玉ボタン」を追加し、表示/非表示を切り替え可能に。

### 3. データ管理の個別化 (User Scope)
- **登録処理**: `createSong` を改修し、セッションから取得したログインユーザーのIDを紐付けて保存するように変更。
- **一覧表示**: トップページを改修。
  - **未ログイン時**: LP（ランディングページ）風の歓迎画面を表示。
  - **ログイン時**: `userId` でフィルタリングし、自分専用の持ち歌リストを表示。
- **既存データ対応**: Prisma Studio とハッシュ化スクリプトを使用し、開発初期のユーザーデータでもログインできるようパスワードを更新。

### 4. UI/UX 改善
- **ヘッダー**: ログイン状態に応じて「ユーザー名 & ログアウト」or「ログイン & 登録」ボタンを出し分け。
- **詳細画面**: システム的な `ID` 表示を削除し、ユーザーにとってノイズとなる情報を排除。

---
### Next Step
- **設定画面 (Settings)**: ユーザー情報（名前、パスワード、音域）の確認・変更機能の実装。
- **CSV連携**: 将来的にデータのインポート/エクスポート機能を検討。

## 2026-01-29: ユーザー設定機能 & UI/UX改善

### 1. ユーザー設定画面の実装
- **編集機能**: プロフィール（名前・音域）を変更できる `settings/profile` ページを作成。
- **Server Action**: `updateProfile` を実装し、DBのユーザー情報を更新。
- **即時反映**: 更新後、`router.refresh()` と `window.location.reload()` を組み合わせて、ヘッダー等のキャッシュ表示を強制更新させるロジックを実装。

### 2. ヘッダーの改修 & ステート同期
- **データ同期**: `session` (Cookie) の古い情報ではなく、DBの最新情報を `layout.tsx` 経由でヘッダーに渡す設計に変更。これにより、名前変更が即座にUIに反映されるようになった。
- **ハンバーガーメニュー**:
  - 「+ 追加」ボタンを削除（トップページと重複するため）。
  - 「設定」「ログアウト」を三本線メニュー内に格納し、スマホでの視認性を向上。
  - メニュー外クリックで閉じる制御を追加。

---
### Milestone Reached
基本的なアプリ機能（CRUD, Auth, User Scope, Settings）の実装が完了！
これにて **Ver 1.0** として実用段階へ到達。

## 2026-01-30: Vercelデプロイ & モバイル対応仕上げ

### 1. 本番環境へのデプロイ (Vercel)
- **Vercel連携**: GitHubリポジトリと連携し、デプロイ完了。
- **環境変数**: 本番用の `DATABASE_URL`, `NEXTAUTH_URL` 等を設定。
- **ビルド構成**: Vercel上でPrismaが動作するよう、`package.json` の build コマンドを `prisma generate && next build` に修正。

### 2. UI/UXのブラッシュアップ
- **ダークモード無効化**: `globals.css` を修正し、iPhone等のダークモード設定に依存せず、常に白背景で表示されるように固定。
- **ローディング表示**: `loading.tsx` を実装。サーバー通信時の待機画面（スピナー）を追加し、体感速度を向上。
- **レスポンシブ修正**: トップページのヘッダーレイアウトを修正（スマホ時は左寄せ、PC時は下揃え）し、余白の違和感を解消。

---
### Next Roadmap (優先度高)
1. **検索機能の実装**:
   - 現在UIのみの検索バーを機能させる（曲名・アーティスト名でのリアルタイムフィルタリング）。
2. **セットリスト機能**:
   - 「友人用」「会社用」「ヒトカラ用」など、シーンに合わせて曲をリスト化できる機能。
   - DBスキーマの拡張（Playlistsテーブル等の追加）を予定。

### 📅 2026-02-10: ソート機能の実装
- **機能追加**:
  - トップページにソート機能（並び替えドロップダウン）を追加。
  - 対応項目: 新しい順 (デフォルト), 古い順, 曲名順 (A-Z), 歌手名順 (A-Z).
  - ※「キー順」は実用性が低いため実装から除外。
- **技術的変更**:
  - Next.js 15対応: `page.tsx` の `searchParams` が非同期(`Promise`)になったため、`await` で受け取る形式に修正。
  - URLクエリパラメータ (`?sort=...`) によるステートレスな制御を採用。
- **課題・将来の展望**:
  - **日本語ソート問題**: 現状はUnicode順（漢字が読み順にならない）ため、将来的に `titleKana`, `artistKana` カラムを追加して完全な「あいうえお順」に対応する (Ver 2.0候補)。