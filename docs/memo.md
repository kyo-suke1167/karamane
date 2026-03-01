# 開発ログ & 決定事項メモ

## 2026-01-27: 環境構築 & Prisma v7 導入

### 1. プロジェクト作成
- npx create-next-app@latest karamane
- Tailwind CSS, TypeScript, App Router: ON

### 2. Prisma v7 (Early Access) 導入
- インストール: npm install prisma@latest @prisma/client@latest dotenv
- 変更点:
  - schema.prisma から datasource の URL 指定を削除。
  - 新しく prisma.config.ts を作成して、そこで url: "file:./dev.db" を指定（※後にPostgreSQLへ移行）。
  - schema.prisma の generator は prisma-client-js を使用。

### 3. DB設計（SQLite時代）
- User: 音域情報 (minNoteId, maxNoteId) を持つ。
- Song: 曲ごとの音域と YouTube URL を持つ。
- NoteMap: 音域計算ロジック（コードで管理）。

### 4. Git運用
- 初期コミット完了。
- 「機能ごとにブランチを切る」運用を開始。

---

## 2026-01-27: 共通レイアウト実装 & チーム開発フロー体験

### 1. 共通コンポーネント実装
- Header: src/components/Header.tsx 作成。ロゴ、ナビゲーションリンクを配置。
- Layout: src/app/layout.tsx に Header を配置し、全ページ共通化。

### 2. トラブルシューティング: Prisma Client Import
- 現象: import { PrismaClient } from '@prisma/client' で赤線が出る。
- 原因: VS Code が生成された型定義ファイルを認識できていなかった（キャッシュや初期化タイミングの問題）。
- 解決策:
  - node_modules 内の .prisma と @prisma を再構築（npm install）。
  - npx prisma generate を再実行。
  - 結果、標準のインポート記述で正常動作を確認。

### 3. Git運用フロー (チーム開発シミュレーション)
1. ブランチ作成: git checkout -b feat/header で作業用ブランチを作成。
2. 実装 & コミット: 機能実装後にコミット。
3. プッシュ: git push --set-upstream origin feat/header。
4. Pull Request (PR): GitHub 上で PR を作成し、main ブランチへマージ。
5. ローカル更新: git checkout main -> git pull origin main で最新化。
6. 掃除: git branch -d feat/header で作業ブランチ削除。

---

## 2026-01-27: Prisma v7 (Early Access) + PostgreSQL (Neon) 構築ログ

### 1. 構成変更の理由
- Prisma v7 の SQLite アダプターが環境によって不安定だったため。
- v7 の推奨構成（prisma.config.ts + Adapter）を最大限活かすため、クラウドDBの Neon (PostgreSQL) を採用。

### 2. 必要なパッケージ
Prisma v7 で PostgreSQL を使うための「アダプター構成」に必要なもの。
npm install dotenv pg @prisma/adapter-pg
npm install -D @types/pg

### 3. 設定ファイル構成（v7完全対応版）
環境変数 (.env) に Neon 用の接続文字列を設定。prisma.config.ts (マイグレーション用) とアプリ用で使い分けるため、同じ値を2つ定義。
DATABASE_URL="postgres://neondb_owner:xxxxx..."
DIRECT_URL="postgres://neondb_owner:xxxxx..."

---

## 2026-01-27: 持ち歌登録機能 & UI刷新

### 1. サーバーアクション実装
- Server Actions: APIルートを作らず、src/app/actions.ts で直接DB操作を実行。
- データ登録: user_1（手動作成済み）に紐づく形で Song を作成。

### 2. 音楽理論ロジック (src/lib/noteUtils.ts)
- NoteIDシステム: MIDIノート番号（整数）で管理し、表示時に変換。例: 60 → mid2C
- 対応音域: 人間の限界を考慮し、lowC (36) 〜 hihiB (95) まで拡張。
- カラーリング: 音域の高さに応じてバッジの色を動的に変更（紫→青→緑→橙→ピンク）。

### 3. ステータス管理
- Enum追加: PRACTICING (練習中), LEARNED (持ち歌), MASTERED (十八番) をDBに追加。
- UI表現: ステータスごとにカードのアクセントカラー（左線）とアイコンを変更。

### 4. UI/UX 改善
- カード型レイアウト: スマホ（iPhone SE等）でも崩れないよう、Flexboxの縦積みをベースに調整。
- 階層整理: 「スペック（音域・状態）」をタイトル上部に配置し、視認性を向上。
- 入力フォーム: 音域入力を input type="number" から select（プルダウン）に変更。最低音と最高音の逆転エラーをリアルタイムで検知し送信をブロック。

---

## 2026-01-28: 詳細ページ & CRUD機能完遂

### 1. 詳細ページ (src/app/songs/[id])
- Dynamic Route: [id] フォルダを使用して個別ページを作成。
- 型対応: Next.js 15/16 の仕様（params が Promise）に対応し、URLパラメータを数値に変換してPrismaに渡す実装を追加。
- YouTube埋め込み: URLから正規表現で動画IDを抽出し、iframe プレーヤーを表示するロジック (youtubeUtils.ts) を実装。

### 2. キー管理機能 (Killer Feature)
- DB設計: Song モデルに key (Int, default 0) を追加。
- UI実装: 詳細画面に KeyController (Client Component) を配置。
- ロジック: ユーザーの音域と曲の音域を比較し、「あなたの最高音に合わせるなら +2」といった推奨キー提案機能を実装。
- Server Action: updateSongKey により、画面遷移なしでキー設定を非同期保存。

### 3. メモ機能
- DB設計: Song モデルに memo (String?) を追加。登録・詳細・編集の各画面に入力エリアと表示エリアを実装。

### 4. 編集・削除機能 (Update & Delete)
- 編集: 既存データをフォーム (EditSongForm) に初期値として流し込み、Server Action (updateSong) で一括更新。
- 削除: 確認ダイアログを表示後、Server Action (deleteSong) を実行しトップページへリダイレクト。これによりCRUDすべての機能実装が完了。

---

## 2026-01-28: ユーザー認証 & データ個別化

### 1. 認証基盤の構築
- ライブラリ導入: NextAuth.js, bcryptjs, @next-auth/prisma-adapter をインストール。
- Prisma連携: 認証情報をDB (User テーブル) で管理するためのアダプター設定を追加。

### 2. ユーザー登録フロー (Signup)
- 対話形式UI: ウィザード形式（Step 1: 基本情報 → Step 2: 音域設定）の登録画面を実装。
- バリデーション: パスワード強度チェック、メールアドレスの重複チェック（Server Action）。パスワード可視化トグルを実装。

### 3. データ管理の個別化 (User Scope)
- 登録処理: createSong を改修し、セッションから取得したログインユーザーのIDを紐付けて保存するように変更。
- 一覧表示: 未ログイン時はLP風の歓迎画面を表示。ログイン時は userId でフィルタリングし、自分専用の持ち歌リストを表示。

### 4. UI/UX 改善
- ヘッダー: ログイン状態に応じてボタンを出し分け。
- 詳細画面: システム的な ID 表示を削除し、ノイズとなる情報を排除。

---

## 2026-01-29: ユーザー設定機能 & UI/UX改善

### 1. ユーザー設定画面の実装
- 編集機能: プロフィール（名前・音域）を変更できる settings/profile ページを作成。
- 即時反映: 更新後、router.refresh() と window.location.reload() を組み合わせてキャッシュを強制更新させるロジックを実装。

### 2. ヘッダーの改修 & ステート同期
- データ同期: session (Cookie) ではなく、DBの最新情報を layout.tsx 経由でヘッダーに渡す設計に変更。
- ハンバーガーメニュー: 操作項目を整理し、スマホでの視認性を向上。メニュー外クリックで閉じる制御を追加。

---

## 2026-01-30: Vercelデプロイ & モバイル対応仕上げ

### 1. 本番環境へのデプロイ (Vercel)
- Vercel連携: GitHubリポジトリと連携しデプロイ完了。本番用のデータベースURL等を環境変数に設定。
- ビルド構成: package.json の build コマンドを prisma generate && next build に修正。

### 2. UI/UXのブラッシュアップ
- ダークモード無効化: globals.css を修正し、OSのダークモード設定に依存せず白背景で表示されるように固定。
- ローディング表示: loading.tsx を実装。サーバー通信時の待機画面（スピナー）を追加。
- レスポンシブ修正: トップページのヘッダーレイアウト余白の違和感を解消。

---

## 2026-02-10: ソート機能の実装

### 1. 機能追加
- トップページにソート機能（新しい順、古い順、曲名順、歌手名順）を追加。

### 2. 技術的変更
- Next.js 15対応: page.tsx の searchParams が非同期 (Promise) になったため、await で受け取る形式に修正。
- URLクエリパラメータ (?sort=...) によるステートレスな制御を採用。

---

## 2026-02-11: バリデーション統一 & 堅牢化 (Zod + React Hook Form)

### 1. 目的と導入ライブラリ
- 入力チェックのルールを一元管理し、バグを根絶する。zod, react-hook-form, @hookform/resolvers を導入。

### 2. 変更内容
- Schema定義 (src/lib/schema.ts): バリデーションルールを集約。メールアドレスの自動小文字化・トリム処理を実装。
- Server Actions: 手動の if 文を廃止し、Zodによる型安全なデータ解析 (parse) に変更。
- フォームUI: 入力不備や送信中はボタンを無効化し、誤操作を防止。新規登録の2ステップフローを整備。

---

## 2026-02-13: セットリスト機能の実装

### 1. 機能追加
- セットリストの作成・編集・削除機能 (CRUD)
- セットリストへの曲追加・削除（一括操作対応）
- ドラッグ＆ドロップによる曲順並べ替え機能 (dnd-kit 導入)

### 2. UI/UX と DB設計
- アプリ下部にフッターメニューを追加。固定ヘッダー実装。
- Setlist, SetlistEntry モデルを追加し、多対多のリレーションを構築。

---

## 2026-02-14: 音域可視化 & キー提案機能の実装

### 1. 音域バー (VocalRangeBar.tsx)
- 曲の音域とユーザーの音域をバーで可視化。キー変更に合わせてバーが動くアニメーションを実装。

### 2. キーコントローラー (KeyController.tsx)
- 無理ゲー判定: 曲の音域幅がユーザーの音域幅を超えている場合、警告を表示。
- オク下・オク上提案: 原曲キーで歌えない場合、具体的なキー調整案を提示。
- デバウンス処理（連打対応）を導入し快適な操作感を実現。

---

## 2026-02-18: クライアントサイド検索・絞り込み機能の実装 & UI改善

### 1. クライアントサイド検索 (ClientSongList.tsx)
- 全件データを一度取得し、メモリ上でフィルタリングを実行。検索入力やステータス変更が即座に反映されるように変更。

### 2. 検索フィルター (HomeFilters.tsx)
- 親コンポーネントに検索条件を渡すUI部品に変更。ページ構成を見直し、サーバーサイドでの検索ロジックを削除してシンプルな構成に。

---

## 2026-02-19: ダークモード対応の完了

### 1. デザインコンセプト
- 太陽（ライト）と月（ダーク）の対比。globals.css にセマンティックカラーを定義。

### 2. 対応範囲と技術的ポイント
- 全画面・コンポーネントの背景色、文字色、ボーダーカラーを調整。
- Tailwind CSS v4 の has-checked: 記法を採用し、ソリッドな背景色とアクセントラインを組み合わせたデザインに刷新。

---

## 2026-02-21: 音域測定機能（マイクテスト）の実装と精度改善

### 1. 機能追加
- pitchfinder と Web Audio API を用いたリアルタイムピッチ（Hz）検出を実装。
- 取得したHzをカラオケ式表記（hiA等）へ変換し、最低音と最高音を自動レコーディングしてプロフィールへ保存する機能を実装。

### 2. 実用性向上とUX改善
- 音域設定の任意化: 新規登録から音域設定ステップを削除し、未設定ユーザー向けのマイク測定誘導ポップアップを追加。
- 精度向上: ノイズゲートの導入と、同じ音程を一定時間キープできた場合のみ更新する Sustain Filter を導入し、誤検知を防止。

---

## 2026-02-25: YouTube一括インポート・UI改善・カラオケ日記機能の実装

### 1. YouTubeプレイリスト一括インポート機能
- 動画タイトルから曲名とアーティストを自動判別・クレンジングする解析ロジックを実装。
- 重複防止ガードや、曲名とアーティスト名を入れ替えるUIを完備。

### 2. 単一動画の自動入力機能 ＆ 曲一括削除
- 曲の新規登録画面でYouTube URLから情報を自動取得。
- セットリスト追加時のインクリメンタルサーチモーダル、持ち歌の一括削除機能を実装。

### 3. カラオケ日記機能 ＆ 点数推移グラフ
- 曲の詳細画面に、歌った記録（点数、キー設定、メモ）を管理できるセクションを追加。
- recharts ライブラリを導入し、点数の推移グラフを自動描画するモチベーション向上UXを実現。

---

## 2026-02-28: Googleログイン実装とグラフUIの改善

### 1. Google認証（OAuth連携）の導入
- Prismaスキーマに Account モデルを追加し、NextAuth に GoogleProvider を設定。
- ID/PW登録済みの既存ユーザーがGoogleログインした場合、自動でアカウントを統合する連携処理を実装。
- マイページに連携ステータスと、後から紐付けできる機能を追加。

### 2. 点数グラフのUI改善
- RechartsのY軸の最大値を100点に固定。記録が1回目からでもグラフの点が表示されるように修正。

---

## 2026-02-28: アーキテクチャの抜本的リファクタリング（プロ仕様への進化）

アプリの機能が完成したため、保守性と可読性を極限まで高めるための大規模なリファクタリングを実施。

### 1. ディレクトリ構造の最適化
- src/components/ 直下に散らばっていたファイルを、layout, song, setlist, profile, ui などのドメイン（役割）ごとに整理。コンポーネントの冗長な命名を修正。

### 2. バックエンド（Server Actions）のドメイン分割
- 500行を超えていた単一の actions.ts を廃止。src/actions/ ディレクトリ配下に user.ts, song.ts, setlist.ts, youtube.ts, record.ts として分割し、責務を分離。

### 3. 型定義の集約
- 各ファイルに散らばっていた Prisma の拡張型やフロントエンド用の型を src/types/index.ts に集約。

### 4. Custom Hooks によるロジックとUIの完全分離（最重要）
長大化していたコンポーネントから、状態管理や複雑なビジネスロジックを抽出。
- usePitchMeasurement.ts: マイクAPIと周波数解析ロジックを分離。
- useYoutubeImport.ts: YouTube API通信、重複チェック、データ整形ロジックを分離。
- useSongList.ts: 楽曲の検索フィルター、ソート、ページネーション計算を分離。
- useSetlistDetail.ts: dnd-kit を用いたドラッグ＆ドロップ計算、一括操作ロジックを分離。
これにより、コンポーネント側は「純粋なUIの描画」のみに集中するクリーンな設計を実現。

### 5. 開発環境の整備
- .cspell.json を導入し、プロジェクト固有の単語を辞書登録。スペル警告をゼロに。
- .vscode/settings.json を追加し、Tailwind CSS の最新アットルールに対する不要な警告を抑制し、チーム開発向けの環境を構築。