import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 環境変数の存在チェック
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL 環境変数が設定されていません')
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY 環境変数が設定されていません')
}

// サービスロールキーを使用したSupabaseクライアント（RLSをバイパス）
// ⚠️ このクライアントはサーバー側でのみ使用してください
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
