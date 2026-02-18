import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 環境変数を読み込む
const envPath = resolve(__dirname, '../.env.local')
let envContent = ''
try {
  envContent = readFileSync(envPath, 'utf-8')
} catch (error) {
  console.error('.env.localファイルが見つかりません')
  process.exit(1)
}

const envVars = {}
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
    }
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '設定済み' : '未設定')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function updatePracticeSlotStatus() {
  try {
    // 2024年2月12日の練習枠を取得
    const targetDate = '2024-02-12'
    
    console.log(`2024年2月12日(${targetDate})の練習枠を検索中...`)
    
    const { data: slots, error: fetchError } = await supabaseAdmin
      .from('practice_slots')
      .select('*')
      .eq('practice_date', targetDate)
    
    if (fetchError) {
      console.error('練習枠の取得エラー:', fetchError)
      process.exit(1)
    }
    
    if (!slots || slots.length === 0) {
      console.log('2024年2月12日の練習枠が見つかりませんでした')
      process.exit(0)
    }
    
    console.log(`\n${slots.length}件の練習枠が見つかりました:`)
    slots.forEach((slot) => {
      console.log(`  - ID: ${slot.id}`)
      console.log(`    時間: ${slot.start_time} 〜 ${slot.end_time}`)
      console.log(`    定員: ${slot.capacity}名`)
      console.log(`    予約数: ${slot.current_reservations || 0}名`)
      console.log(`    現在のステータス: ${slot.status}`)
      console.log('')
    })
    
    // すべての練習枠のステータスを'full'に更新
    const { data: updatedSlots, error: updateError } = await supabaseAdmin
      .from('practice_slots')
      .update({ status: 'full' })
      .eq('practice_date', targetDate)
      .select()
    
    if (updateError) {
      console.error('練習枠の更新エラー:', updateError)
      process.exit(1)
    }
    
    console.log(`\n✅ ${updatedSlots?.length || 0}件の練習枠を満員に設定しました:`)
    updatedSlots?.forEach((slot) => {
      console.log(`  - ID: ${slot.id}`)
      console.log(`    時間: ${slot.start_time} 〜 ${slot.end_time}`)
      console.log(`    ステータス: ${slot.status}`)
      console.log('')
    })
    
    console.log('更新が完了しました！')
  } catch (error) {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  }
}

updatePracticeSlotStatus()
