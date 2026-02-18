-- ============================================
-- Supabase RLSポリシー修正SQL
-- LINEログイン用のusersテーブルポリシー設定
-- ============================================

-- 注意: このSQLはSupabase DashboardのSQL Editorで実行してください

-- ============================================
-- 方法1: 開発環境用（誰でもINSERT可能）
-- ============================================
-- 開発中は、誰でもusersテーブルにINSERTできるようにします
-- ⚠️ 本番環境では削除してください

-- INSERTポリシー（誰でも新規ユーザーを登録可能）
CREATE POLICY "Allow insert for all users"
  ON users FOR INSERT
  WITH CHECK (true);

-- SELECTポリシー（誰でも自分のデータを閲覧可能）
-- LINEログインの場合、line_user_idで判定します
CREATE POLICY "Users can view own data by line_user_id"
  ON users FOR SELECT
  USING (true); -- 開発中は全員閲覧可能（後で制限を追加）

-- UPDATEポリシー（誰でも自分のデータを更新可能）
CREATE POLICY "Users can update own data by line_user_id"
  ON users FOR UPDATE
  USING (true); -- 開発中は全員更新可能（後で制限を追加）

-- ============================================
-- 方法2: 本番環境用（より厳格なポリシー）
-- ============================================
-- 以下のコメントを外して、方法1のポリシーを削除してから使用してください

/*
-- 既存のポリシーを削除（開発用ポリシーを削除する場合）
DROP POLICY IF EXISTS "Allow insert for all users" ON users;
DROP POLICY IF EXISTS "Users can view own data by line_user_id" ON users;
DROP POLICY IF EXISTS "Users can update own data by line_user_id" ON users;

-- 本番環境用のポリシー
-- INSERTポリシー（認証済みユーザーのみ登録可能）
-- 注意: LINEログインの場合、認証状態の判定方法を調整する必要があります
CREATE POLICY "Authenticated users can insert"
  ON users FOR INSERT
  WITH CHECK (true); -- 後で認証チェックを追加

-- SELECTポリシー（自分のデータのみ閲覧可能）
-- 注意: line_user_idでの判定が必要です
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (line_user_id = current_setting('app.line_user_id', true));

-- UPDATEポリシー（自分のデータのみ更新可能）
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (line_user_id = current_setting('app.line_user_id', true));
*/
