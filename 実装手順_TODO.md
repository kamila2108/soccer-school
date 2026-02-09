# サッカー教室ホームページ 実装手順TODOリスト

## 📋 このドキュメントについて

このドキュメントは、サッカー教室ホームページの実装を段階的に進めるためのTODOリストです。
初心者の方でも理解できるよう、各手順を細かく分解し、必要な技術や注意点を記載しています。

**開発期間**: 1ヶ月（2月いっぱい）
**開発フェーズ**: 設計 → 開発 → テスト

---

## 🎯 フェーズ1: プロジェクトセットアップ

### 1.1 開発環境の準備
- [ ] Node.js のインストール確認（推奨: v18以上）
- [ ] パッケージマネージャーの選択（npm / yarn / pnpm）
- [ ] Git リポジトリの初期化
- [ ] `.gitignore` ファイルの作成（node_modules, .env などを除外）

### 1.2 プロジェクト構成の決定
- [ ] フロントエンドフレームワークの選択
  - **Next.js（推奨）**: サーバーサイドレンダリングとAPIルートが使えるため
- [ ] バックエンド・データベース・認証の選択
  - **Supabase（採用）**: データベース（PostgreSQL）、認証、バックエンド機能を提供
  - **Next.js API Routes**: Supabaseと併用してカスタムAPIエンドポイントを作成
- [ ] データベースクライアントの選択
  - **Supabase Client（推奨）**: Supabaseの公式JavaScript/TypeScriptクライアント
  - **Prisma（任意）**: SupabaseのPostgreSQLに接続して使用することも可能

### 1.3 プロジェクトの初期化
- [ ] プロジェクトディレクトリの作成
- [ ] Next.js プロジェクトの作成（例: `npx create-next-app@latest`）
- [ ] 必要なパッケージのインストール
  - Supabase関連: `@supabase/supabase-js`（Supabaseクライアント）
  - 認証関連: `@supabase/auth-helpers-nextjs`（Next.js用認証ヘルパー、任意）
  - UIライブラリ: `tailwindcss` または `Material-UI`
  - フォーム管理: `react-hook-form`, `zod`（バリデーション）
  - Prisma（任意）: `prisma` と `@prisma/client`（Supabaseと併用する場合）

### 1.4 Supabase プロジェクトの作成
- [ ] Supabase アカウントの作成（https://supabase.com）
- [ ] 新しいプロジェクトの作成
- [ ] プロジェクト設定の確認
  - プロジェクト名、データベースパスワードの設定
  - リージョンの選択（日本: ap-northeast-1）

### 1.5 環境変数の設定
- [ ] `.env.local` ファイルの作成
- [ ] Supabase環境変数の設定
  - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL（Settings > API）
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー（Settings > API）
  - `SUPABASE_SERVICE_ROLE_KEY`: Supabaseサービスロールキー（サーバー側のみ、Settings > API）
- [ ] LINE Developers環境変数の設定
  - `LINE_CHANNEL_ID`: LINEログイン用チャネルID
  - `LINE_CHANNEL_SECRET`: LINEログイン用シークレット
- [ ] その他の環境変数
  - `NEXT_PUBLIC_APP_URL`: アプリケーションのURL（開発: http://localhost:3000）

---

## 🗄️ フェーズ2: データベース設計・構築

### 2.1 データベーススキーマの設計
- [ ] ユーザーテーブル（users）の設計
  - カラム: id (uuid, primary key), line_user_id (text, unique), name (text), email (text), phone (text), grade (text), profile_image (text), created_at (timestamptz), updated_at (timestamptz)
  - 注意: Supabase Authの`auth.users`テーブルと連携する場合は、`id`を`auth.users.id`と関連付ける
- [ ] 入会申込みテーブル（applications）の設計
  - カラム: id (uuid, primary key), user_id (uuid, foreign key → users.id), name (text), name_kana (text), grade (text), phone (text), email (text), parent_name (text), notes (text), status (text), admin_memo (text), created_at (timestamptz), updated_at (timestamptz)
- [ ] 練習枠テーブル（practice_slots）の設計
  - カラム: id (uuid, primary key), practice_date (date), start_time (time), end_time (time), capacity (integer), current_reservations (integer), status (text), notes (text), created_at (timestamptz), updated_at (timestamptz)
- [ ] 予約テーブル（reservations）の設計
  - カラム: id (uuid, primary key), user_id (uuid, foreign key → users.id), practice_slot_id (uuid, foreign key → practice_slots.id), status (text), created_at (timestamptz), updated_at (timestamptz)
- [ ] 決済テーブル（payments）の設計
  - カラム: id (uuid, primary key), user_id (uuid, foreign key → users.id), type (text), amount (numeric), status (text), payment_service_id (text), paid_at (timestamptz), created_at (timestamptz), updated_at (timestamptz)
- [ ] イベントテーブル（events）の設計
  - カラム: id (uuid, primary key), title (text), event_date (date), start_time (time), end_time (time), location (text), target_grade (text), capacity (integer), fee (numeric), deadline (timestamptz), description (text), status (text), created_at (timestamptz), updated_at (timestamptz)
- [ ] 通知テーブル（notifications）の設計
  - カラム: id (uuid, primary key), user_id (uuid, foreign key → users.id), type (text), title (text), content (text), is_read (boolean), created_at (timestamptz), updated_at (timestamptz)
- [ ] 管理者テーブル（admins）の設計
  - カラム: id (uuid, primary key), email (text, unique), password_hash (text), name (text), created_at (timestamptz), updated_at (timestamptz)
  - 注意: Supabase Authを使用する場合は、`auth.users`テーブルに管理者フラグを追加することも検討

### 2.2 リレーション（関連）の定義
- [ ] users と applications の1対多の関係（外部キー制約）
- [ ] users と reservations の1対多の関係（外部キー制約）
- [ ] practice_slots と reservations の1対多の関係（外部キー制約）
- [ ] users と payments の1対多の関係（外部キー制約）
- [ ] users と notifications の1対多の関係（外部キー制約）

### 2.3 Supabaseでのテーブル作成
- [ ] Supabase Dashboard の Table Editor を開く
- [ ] SQL Editor を使用してテーブルを作成
  - 方法1: SQL EditorでCREATE TABLE文を実行
  - 方法2: Table EditorのUIから手動で作成
- [ ] 外部キー制約の設定
- [ ] インデックスの作成（必要に応じて）
  - `users.line_user_id` にユニークインデックス
  - `reservations.user_id`, `reservations.practice_slot_id` にインデックス
- [ ] Row Level Security (RLS) ポリシーの設定（後で実装）

### 2.4 Supabase Client の設定
- [ ] Supabase Client の初期化ファイル（`lib/supabase.ts`）の作成
  - ブラウザ用クライアント: `createBrowserClient()` を使用
  - サーバー側用クライアント: `createServerClient()` を使用（Middleware用）
  - サーバー側用クライアント（Service Role Key使用）: 管理者操作などで使用
- [ ] 型定義の生成（推奨）
  - `supabase gen types typescript --project-id <project-id>` コマンドで型を生成
  - 生成した型を `types/supabase.ts` などに保存
  - Supabase Client に型を適用

### 2.5 Row Level Security (RLS) ポリシーの設定
- [ ] 各テーブルでRLSを有効化
  - Supabase Dashboard > Authentication > Policies
  - または SQL Editor で `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`
- [ ] 基本的なポリシーの設定
  - `users` テーブル: ユーザーは自分のデータのみ閲覧・編集可能
  - `applications` テーブル: ユーザーは自分の申込みのみ閲覧可能、管理者は全件閲覧可能
  - `reservations` テーブル: ユーザーは自分の予約のみ閲覧・編集可能
  - その他のテーブルも同様にポリシーを設定
- [ ] 管理者権限の設定
  - 管理者用のポリシーを設定（Service Role Keyを使用する場合は不要）

### 2.6 シードデータの作成（開発用）
- [ ] SQL Editor または Supabase Client を使用してテストデータを投入
- [ ] テスト用管理者アカウントの作成
- [ ] テスト用ユーザーデータの作成（任意）

---

## 🔐 フェーズ3: 認証機能（LINEログイン）

### 3.1 LINE Developers の設定
- [ ] LINE Developers アカウントの作成（https://developers.line.biz/）
- [ ] チャネルの作成（LINE Login チャネル）
- [ ] チャネルIDとチャネルシークレットの取得
- [ ] コールバックURLの設定
  - 開発環境: `http://localhost:3000/api/auth/callback/line`
  - 本番環境: `https://yourdomain.com/api/auth/callback/line`

### 3.2 Supabase Auth の設定
- [ ] Supabase Dashboard で Authentication を開く
- [ ] Providers の確認（Email/Password など）
- [ ] LINE プロバイダーの設定（カスタム実装が必要）
  - 注意: Supabase AuthにはLINEプロバイダーが標準でないため、カスタム実装が必要
  - 方法1: Next.js API RoutesでLINE OAuthを実装し、Supabase Authと連携
  - 方法2: Supabase Edge Functionsを使用（任意）

### 3.3 LINE OAuth フローの実装（Next.js API Routes）
- [ ] LINE OAuth用APIエンドポイントの作成（`/api/auth/line`）
  - LINE認証URLへのリダイレクト処理
- [ ] LINE コールバック用APIエンドポイントの作成（`/api/auth/callback/line`）
  - LINEから認証コードを受け取る
  - アクセストークンとユーザー情報を取得
  - Supabase Authでユーザーを作成または取得
- [ ] 初回ログイン時のユーザー登録処理
  - LINEから取得した情報を`users`テーブルに保存
  - `line_user_id`を保存して次回ログイン時に検索可能にする
- [ ] 2回目以降の自動ログイン処理
  - `line_user_id`で既存ユーザーを検索
  - Supabaseセッションを生成

### 3.4 Supabase セッション管理
- [ ] Supabase Client を使用したセッション取得
  - `supabase.auth.getSession()` でセッション取得
  - サーバー側: `createServerClient` を使用
  - クライアント側: `createBrowserClient` を使用
- [ ] ログアウト機能の実装
  - `supabase.auth.signOut()` を呼び出し
- [ ] 認証状態のチェック（ミドルウェア）
  - Next.js Middleware で認証チェック
  - 未認証時のリダイレクト処理

### 3.5 認証ガードの実装
- [ ] 認証が必要なページの保護
  - サーバーコンポーネント: `getServerSession` でチェック
  - クライアントコンポーネント: `useEffect` でセッション確認
- [ ] 未ログイン時のリダイレクト処理
  - `/login` ページへリダイレクト
- [ ] 認証済みユーザー向けページの表示制御
  - セッション情報に基づいてUIを表示/非表示

---

## 🎨 フェーズ4: 共通機能・UI基盤

### 4.1 レスポンシブデザインの実装
- [ ] Tailwind CSS の設定（または他のCSSフレームワーク）
- [ ] モバイルファーストの基本レイアウト作成
- [ ] ブレークポイントの定義（スマホ: < 1024px, PC: >= 1024px）
- [ ] 共通コンポーネントの作成
  - ヘッダー（ナビゲーション）
  - フッター
  - ボタンコンポーネント
  - 入力フォームコンポーネント

### 4.2 レイアウトコンポーネント
- [ ] メインレイアウト（`_app.tsx` または `layout.tsx`）の作成
- [ ] 認証状態に応じたナビゲーション表示
- [ ] ローディング表示の実装

### 4.3 ユーザー情報管理機能
- [ ] ユーザー情報表示ページ（`/profile`）の作成
  - 氏名、連絡先、学年などの表示
- [ ] ユーザー情報編集ページの作成
  - 編集フォームの実装
  - バリデーション（必須項目、形式チェック）
  - 更新処理（本人のみ編集可能）
- [ ] 管理者用ユーザー一覧ページの作成（`/admin/users`）
  - ユーザー一覧の表示
  - 検索・フィルタ機能

---

## 📝 フェーズ5: 入会手続き機能

### 5.1 入会申込みフォームの実装
- [ ] 入会申込みページ（`/application`）の作成
- [ ] フォーム項目の実装
  - 氏名（ユーザー情報から自動入力、編集可）
  - フリガナ（全角カナ、バリデーション）
  - 学年（プルダウン選択）
  - 連絡先（電話番号、ハイフンあり/なし対応）
  - 連絡先（メールアドレス、任意）
  - 保護者氏名（未成年の場合のみ必須）
  - 備考欄（自由記述、任意）
  - 利用規約同意（チェックボックス、必須）
- [ ] フォームバリデーションの実装
  - 必須項目チェック
  - 形式チェック（メール、電話番号など）
  - エラーメッセージの表示

### 5.2 確認画面の実装
- [ ] 確認画面（`/application/confirm`）の作成
  - 入力内容の一覧表示
  - 「修正する」ボタン（入力画面に戻る）
  - 「申込み確定」ボタン

### 5.3 申込み処理の実装
- [ ] 申込みデータの保存処理
  - Supabase Client を使用してデータベースに登録（`supabase.from('applications').insert()`）
  - 申込みIDは自動生成（UUID）
  - ステータスを「未確認」に設定
- [ ] 申込み完了画面の表示
- [ ] エラーハンドリング（保存失敗時の処理）
  - Supabase のエラーレスポンスを適切に処理

### 5.4 管理者側の入会管理機能
- [ ] 入会申込み一覧ページ（`/admin/applications`）の作成
  - 申込み一覧の表示
  - ステータス別フィルタ（未確認 / 承認 / 却下）
  - 検索機能
- [ ] 申込み詳細ページ（`/admin/applications/[id]`）の作成
  - ユーザー情報の表示
  - 入力内容の表示
  - 管理者メモの入力・編集
- [ ] 承認・却下処理の実装
  - 承認ボタン（ステータスを「承認」に変更、会員ステータスを「有効」に）
  - 却下ボタン（理由入力ダイアログ、ステータスを「却下」に）
  - 通知送信（承認・却下時にユーザーへ通知）

---

## 📅 フェーズ6: 時間予約機能

### 6.1 練習枠管理機能（管理者側）
- [ ] 練習枠登録ページ（`/admin/practice-slots/new`）の作成
  - 練習日の選択
  - 開始時間・終了時間の入力
  - 定員の入力
  - 備考欄（任意）
- [ ] 練習枠一覧ページ（`/admin/practice-slots`）の作成
  - 練習枠一覧の表示
  - 編集・削除機能
  - 削除制約（予約がある場合は削除不可）
- [ ] 練習枠編集機能の実装
- [ ] 練習枠削除機能の実装（制約チェック含む）
- [ ] 練習枠ステータス管理（受付中 / 満席 / 受付終了 / 中止）

### 6.2 予約一覧表示機能（会員側）
- [ ] 予約可能な練習一覧ページ（`/reservations`）の作成
  - カレンダー形式またはリスト形式の選択
  - 練習日、曜日、時間帯の表示
  - 空き状況の表示（○：予約可能、×：満席、−：受付終了）
  - 入会承認済みユーザーのみ閲覧可能
  - 未入会/未承認時の案内表示
- [ ] 空き枠の計算ロジック
  - 定員 - 予約数 = 残り枠
  - 残り枠 > 0 → 予約可能
  - 残り枠 = 0 → 満席表示
  - 練習開始時刻以降 → 予約不可

### 6.3 予約機能の実装
- [ ] 予約処理の実装
  - 練習日・時間帯の選択
  - 予約確認ダイアログの表示
  - 予約確定処理（Supabase Client でデータベースに保存）
    - `supabase.from('reservations').insert()` で予約を登録
    - トランザクション処理（予約登録と予約数更新を同時に実行）
  - 予約数の増算処理（`practice_slots`テーブルの`current_reservations`を更新）
- [ ] 予約制約の実装
  - 同一時間帯への複数予約不可チェック（データベースクエリで確認）
  - 1ユーザーあたりの予約数上限チェック（要検討）
  - 予約締切チェック（練習開始2時間前まで）

### 6.4 キャンセル機能の実装
- [ ] 予約一覧ページ（`/reservations/my-reservations`）の作成
  - 予約履歴の表示
  - フィルタ（今後の予約 / 過去の予約）
  - 予約ステータス表示（予約中 / キャンセル済み / 参加済み）
- [ ] キャンセル処理の実装
  - キャンセル確認ダイアログの表示
  - キャンセル確定処理
  - 予約数の減算処理
  - キャンセル可能期限チェック（練習開始2時間前まで）

### 6.5 管理者側の予約管理機能
- [ ] 予約状況一覧ページ（`/admin/reservations`）の作成
  - 練習日、時間帯、定員、予約数、残り枠の表示
  - 日付・期間での絞り込み
  - 練習枠ごとの予約者一覧表示
- [ ] 予約調整機能の実装
  - 管理者による予約追加（代理予約）
  - 管理者によるキャンセル
  - 練習枠の中止処理（該当予約者へ通知）

---

## 💳 フェーズ7: 決済機能

### 7.1 決済サービスの設定
- [ ] 決済サービスの選択・登録
  - 候補: Stripe（推奨、定期課金対応）
  - アカウントの作成
  - APIキーの取得
- [ ] 決済サービスSDKのインストール
  - Stripe: `npm install stripe @stripe/stripe-js`
- [ ] 環境変数の設定
  - `STRIPE_SECRET_KEY`: サーバー側用
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: クライアント側用

### 7.2 決済フローの実装（月謝）
- [ ] 月謝支払いページ（`/payments/monthly`）の作成
  - 支払い金額の表示
  - 決済ボタンの実装
- [ ] Stripe Checkout セッションの作成
  - サーバー側APIエンドポイント（`/api/payments/create-checkout`）
  - 定期課金（サブスクリプション）の設定
- [ ] 決済画面への遷移処理
- [ ] 決済完了後のリダイレクト処理
  - 成功時: `/payments/success`
  - 失敗時: `/payments/failed`

### 7.3 決済フローの実装（イベント参加費）
- [ ] イベント参加費支払いページ（`/payments/event/[eventId]`）の作成
  - イベント情報の表示
  - 参加費の表示
  - 決済ボタンの実装
- [ ] 一回限りの決済処理の実装
  - Stripe Checkout セッションの作成（一回限り）

### 7.4 Webhook の実装
- [ ] Webhook エンドポイントの作成（`/api/webhooks/stripe`）
  - 決済完了イベントの受信
  - 決済失敗イベントの受信
  - Supabase Client を使用してデータベースに決済情報を保存
    - `supabase.from('payments').insert()` または `.update()`
  - ステータスの更新（未決済 → 決済完了 / 決済失敗）
  - 注意: Webhookはサーバー側で実行されるため、Service Role Keyを使用

### 7.5 決済完了通知の実装
- [ ] ユーザー向け決済完了画面（`/payments/success`）の作成
  - 決済完了メッセージ
  - 支払い種別、金額、決済日の表示
- [ ] 管理者向け通知
  - 管理画面での決済反映
  - 決済一覧への即時反映

### 7.6 決済履歴機能の実装
- [ ] ユーザー側決済履歴ページ（`/payments/history`）の作成
  - 支払日、種別、金額、ステータスの表示
  - フィルタ機能（種別、ステータス）
  - 領収書表示・ダウンロード機能（任意）
- [ ] 管理者側決済一覧ページ（`/admin/payments`）の作成
  - 会員名、支払い種別、金額、決済日、ステータスの表示
  - ステータス別フィルタ
  - 会員別支払い履歴確認
  - 返金処理（決済サービス連携）

### 7.7 決済ステータスによる制御
- [ ] 月謝未決済時の機能制限
  - 予約不可などの制限処理
- [ ] 決済失敗時の再決済案内表示

### 7.8 セキュリティ・法務対応
- [ ] HTTPS の設定（本番環境）
- [ ] 特定商取引法表記ページの作成（`/legal/specified-commercial-transactions`）
- [ ] 利用規約ページの作成（`/legal/terms`）
- [ ] 返金ポリシーページの作成（`/legal/refund-policy`）

---

## 📢 フェーズ8: イベント通知機能

### 8.1 イベント管理機能（管理者側）
- [ ] イベント登録ページ（`/admin/events/new`）の作成
  - イベント名、開催日、開始時間、終了時間の入力
  - 開催場所、対象者、定員、参加費の入力
  - 申込締切、イベント詳細の入力
  - 公開ステータスの選択（下書き / 公開）
- [ ] イベント一覧ページ（`/admin/events`）の作成
  - イベント一覧の表示
  - 編集・削除機能
  - 公開 / 非公開切替
  - 削除制約（参加者がいる場合は削除不可）
- [ ] イベント編集機能の実装
- [ ] イベント削除機能の実装（制約チェック含む）

### 8.2 会員向けイベント一覧表示
- [ ] イベント一覧ページ（`/events`）の作成
  - 公開ステータスが「公開」のイベントのみ表示
  - 対象者条件を満たす会員のみ表示
  - イベント名、開催日、開催時間、開催場所、参加費、申込状況の表示
- [ ] イベント詳細ページ（`/events/[id]`）の作成
  - イベント詳細情報の表示
  - 申込ボタン（イベント参加機能と連動）

### 8.3 サイト内通知機能の実装
- [ ] 通知データモデルの実装
  - 通知ID、ユーザーID、通知種別、タイトル、本文、既読フラグ、送信日時
- [ ] 通知一覧ページ（`/notifications`）の作成
  - 通知一覧の表示
  - 未読 / 既読の表示
  - 既読処理の実装
- [ ] 通知アイコンの実装（ヘッダーなど）
  - 未読通知数の表示
  - クリックで通知一覧へ遷移

### 8.4 通知送信機能の実装
- [ ] イベント新規公開時の通知送信
  - 対象: 全会員 or 対象学年のみ
- [ ] 開催日前リマインド通知の実装
  - 前日・当日のリマインド
  - 対象: イベント申込者のみ
- [ ] イベント内容変更時の通知送信
- [ ] 入会承認・却下時の通知送信

### 8.5 LINE通知機能（任意・将来実装）
- [ ] LINE Messaging API の設定
- [ ] LINE通知送信処理の実装
- [ ] 通知内容のフォーマット設定

---

## 👨‍💼 フェーズ9: 管理者機能

### 9.1 管理者認証機能
- [ ] 管理者ログインページ（`/admin/login`）の作成
  - メールアドレス・パスワードでのログイン
  - セッション管理
- [ ] 管理者認証ミドルウェアの実装
  - 管理者のみアクセス可能なページの保護
  - 未認証時のリダイレクト

### 9.2 管理者ダッシュボード
- [ ] ダッシュボードページ（`/admin`）の作成
  - 会員数の表示
  - 未承認入会申込み数の表示
  - 本日の練習予約数の表示
  - 未決済件数の表示
  - 近日開催イベントの表示
- [ ] 統計データの取得処理
  - 各数値の集計処理

### 9.3 会員管理機能
- [ ] 会員一覧ページ（`/admin/members`）の作成
  - 会員ID、氏名、学年、入会ステータス、会員ステータス、登録日の表示
  - 検索機能（氏名・学年）
  - フィルタ機能（入会ステータス・会員ステータス）
  - 並び替え機能（登録日など）
- [ ] 会員詳細ページ（`/admin/members/[id]`）の作成
  - 基本情報（氏名・連絡先・学年）の表示
  - LINE連携情報の表示
  - 入会申込み内容の表示
  - 予約履歴の表示
  - 決済履歴の表示
  - イベント参加履歴の表示
  - 会員ステータス変更機能（有効 / 休会 / 退会）
  - 管理者メモの記録機能

### 9.4 予約・決済状況管理機能
- [ ] 予約状況管理ページ（`/admin/reservations`）の実装
  - フェーズ6.5で実装済みの確認
- [ ] 決済状況管理ページ（`/admin/payments`）の実装
  - フェーズ7.6で実装済みの確認
- [ ] 未決済対応機能の実装
  - 未決済会員の抽出
  - 再決済案内通知の送信

### 9.5 操作ログ機能（任意）
- [ ] 操作ログテーブルの設計
  - 管理者ID、操作内容、操作日時
- [ ] 操作ログの記録処理
  - 重要な操作（承認・却下・削除など）のログ記録
- [ ] 操作ログ一覧ページ（`/admin/logs`）の作成

---

## 🧪 フェーズ10: テスト・品質保証

### 10.1 単体テスト
- [ ] 各機能の単体テストの作成
  - ユーザー登録処理のテスト
  - 予約処理のテスト
  - 決済処理のテスト
  - バリデーション処理のテスト
- [ ] テストフレームワークの導入
  - Jest, Vitest など

### 10.2 統合テスト
- [ ] 認証フローのテスト
- [ ] 入会申込みフローのテスト
- [ ] 予約フローのテスト
- [ ] 決済フローのテスト

### 10.3 動作確認
- [ ] 各機能の動作確認
  - 正常系の確認
  - 異常系の確認（エラーハンドリング）
- [ ] レスポンシブデザインの確認
  - スマートフォンでの表示確認
  - PCでの表示確認
- [ ] ブラウザ互換性の確認
  - Chrome, Firefox, Safari, Edge

### 10.4 セキュリティチェック
- [ ] SQLインジェクション対策の確認
  - Supabase Client はパラメータ化クエリを使用するため、基本的に安全
  - 生のSQLを実行する場合は注意が必要
- [ ] XSS（クロスサイトスクリプティング）対策の確認
- [ ] CSRF（クロスサイトリクエストフォージェリ）対策の確認
- [ ] 認証・認可の確認
  - 未認証ユーザーのアクセス制限
  - 権限のない操作の制限
- [ ] Row Level Security (RLS) ポリシーの確認
  - Supabase のRLSポリシーが適切に設定されているか確認
  - 各テーブルで適切なアクセス制御が行われているか確認

### 10.5 パフォーマンステスト
- [ ] ページ読み込み速度の確認
- [ ] データベースクエリの最適化
  - Supabase のクエリパフォーマンスを確認
  - インデックスの確認
  - 不要なデータ取得を避ける（必要なカラムのみ選択）
- [ ] 画像の最適化
  - Supabase Storage を使用する場合は、画像の最適化を検討

### 10.6 バグ修正
- [ ] 発見されたバグの修正
- [ ] 再テストの実施

---

## 🚀 フェーズ11: デプロイ・本番環境構築

### 11.1 Vercel プロジェクトの準備
- [ ] Vercel アカウントの作成（https://vercel.com）
- [ ] GitHub リポジトリとの連携
  - Vercel Dashboard で GitHub リポジトリをインポート
  - 自動デプロイの設定
- [ ] プロジェクト設定の確認
  - Framework Preset: Next.js
  - Root Directory: プロジェクトルート
  - Build Command: `npm run build`（デフォルト）
  - Output Directory: `.next`（デフォルト）

### 11.2 Supabase 本番環境の確認
- [ ] Supabase プロジェクトの本番環境設定確認
  - データベース接続情報の確認
  - API Keys の確認（本番用）
- [ ] 本番環境用の環境変数確認
  - `NEXT_PUBLIC_SUPABASE_URL`: 本番環境のSupabase URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 本番環境の匿名キー
  - `SUPABASE_SERVICE_ROLE_KEY`: 本番環境のサービスロールキー

### 11.3 Vercel 環境変数の設定
- [ ] Vercel Dashboard で環境変数を設定
  - Settings > Environment Variables を開く
  - 以下の環境変数を追加:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`（サーバー側のみ）
    - `LINE_CHANNEL_ID`
    - `LINE_CHANNEL_SECRET`
    - `STRIPE_SECRET_KEY`（決済機能使用時）
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`（決済機能使用時）
    - `NEXT_PUBLIC_APP_URL`: 本番環境のURL
- [ ] 環境別の設定（Production, Preview, Development）
  - Production: 本番環境用の値
  - Preview: プレビュー環境用の値（任意）
  - Development: 開発環境用の値（任意）

### 11.4 デプロイ設定
- [ ] `vercel.json` の作成（必要に応じて）
  - リダイレクト設定
  - ヘッダー設定
- [ ] ビルド設定の確認
  - `next.config.js` の確認
  - 環境変数の読み込み確認
- [ ] デプロイの実行
  - Git push で自動デプロイ
  - または Vercel CLI で手動デプロイ（`vercel --prod`）

### 11.5 本番環境での動作確認
- [ ] デプロイ後の動作確認
  - 各機能の動作確認
  - 認証フローの確認
  - データベース接続の確認
- [ ] パフォーマンスの確認
  - Vercel Analytics の確認（有効化している場合）
  - ページ読み込み速度の確認
- [ ] エラーログの監視設定
  - Vercel Logs の確認
  - エラー通知の設定（任意）

### 11.6 ドメイン・SSL証明書の設定
- [ ] カスタムドメインの設定
  - Vercel Dashboard > Settings > Domains
  - ドメインの追加
  - DNS設定（Vercelの指示に従う）
- [ ] SSL証明書の確認
  - Vercel は自動でSSL証明書を発行・更新
  - HTTPS が有効になっていることを確認

### 11.7 Supabase 本番環境の最適化
- [ ] Row Level Security (RLS) ポリシーの確認
  - 本番環境でのセキュリティポリシーが適切に設定されているか確認
- [ ] データベースバックアップの設定
  - Supabase Dashboard でバックアップ設定を確認
- [ ] パフォーマンスの最適化
  - インデックスの確認
  - クエリの最適化

---

## 📚 フェーズ12: ドキュメント・引き継ぎ

### 12.1 技術ドキュメントの作成
- [ ] アーキテクチャの説明
- [ ] データベーススキーマの説明
- [ ] API仕様書の作成
- [ ] 環境構築手順書の作成

### 12.2 運用マニュアルの作成
- [ ] 管理者向け操作マニュアル
- [ ] トラブルシューティングガイド
- [ ] バックアップ手順

### 12.3 ユーザー向けドキュメント
- [ ] 利用ガイド（会員向け）
- [ ] FAQ（よくある質問）

---

## 📝 補足・注意事項

### 開発時の注意点
1. **セキュリティ**: 個人情報や決済情報を扱うため、セキュリティには十分注意する
   - Supabase の Row Level Security (RLS) を適切に設定する
   - Service Role Key はサーバー側でのみ使用し、クライアント側に公開しない
2. **エラーハンドリング**: 適切なエラーメッセージを表示し、ユーザーに分かりやすく伝える
   - Supabase のエラーレスポンスを適切に処理する
3. **バリデーション**: フロントエンドとバックエンドの両方でバリデーションを実装する
   - データベース側でも制約を設定する（NOT NULL、CHECK制約など）
4. **テスト**: 各機能を実装したら、必ず動作確認を行う
5. **コードレビュー**: 可能であれば、コードレビューを実施する

### Supabase 使用時の注意点
1. **環境変数**: `NEXT_PUBLIC_` プレフィックスが付いた変数はクライアント側に公開される
   - 機密情報（Service Role Keyなど）には `NEXT_PUBLIC_` を付けない
2. **Row Level Security (RLS)**: 各テーブルでRLSを有効化し、適切なポリシーを設定する
   - 開発初期は無効化して開発し、後で有効化することも可能
3. **クエリの最適化**: 必要なデータのみ取得する（`select()` でカラムを指定）
4. **リアルタイム機能**: 必要に応じて Supabase Realtime を活用する
5. **型安全性**: `supabase gen types typescript` で型を生成し、型安全性を確保する

### 技術選定（採用技術スタック）
- **フロントエンド**: Next.js（React）
- **バックエンド**: Supabase + Next.js API Routes
- **データベース**: Supabase（PostgreSQL）
- **認証**: Supabase Auth（LINEログインはカスタム実装）
- **決済**: Stripe（定期課金対応）
- **UI**: Tailwind CSS または Material-UI
- **ホスティング**: Vercel
- **データベースクライアント**: Supabase Client（`@supabase/supabase-js`）

### Supabase を使用する利点
1. **統合されたサービス**: データベース、認証、ストレージ、リアルタイム機能が一つのプラットフォームで提供
2. **PostgreSQL**: 強力なリレーショナルデータベース
3. **Row Level Security (RLS)**: データベースレベルでのセキュリティポリシー
4. **リアルタイム機能**: WebSocketベースのリアルタイム更新
5. **自動スケーリング**: サーバーレスアーキテクチャで自動スケール
6. **無料プラン**: 開発・小規模運用に十分な無料プランあり

### 開発の進め方
1. フェーズ1から順番に進める
2. 各フェーズが完了したら、次のフェーズに進む
3. 分からないことがあれば、ドキュメントやコミュニティを参照
4. 定期的に動作確認を行い、バグを早期に発見する

---

## ✅ チェックリストの使い方

- [ ] 各項目のチェックボックスにチェックを入れて、進捗を管理する
- 完了した項目はチェックを入れる
- 問題が発生した場合は、コメントを追加する

---

**最終更新日**: 2024年2月
**作成者**: AI Assistant
