import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@/app/api/auth/[...nextauth]/route'

// 特定の日付の練習枠を満員に設定する（管理者専用）
export async function POST(request: NextRequest) {
  try {
    // セッション情報を取得
    const session = await auth()
    
    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { date } = body

    if (!date) {
      return NextResponse.json(
        { error: '日付が指定されていません' },
        { status: 400 }
      )
    }

    // 指定された日付の練習枠を取得
    const { data: slots, error: fetchError } = await supabaseAdmin
      .from('practice_slots')
      .select('*')
      .eq('practice_date', date)
    
    if (fetchError) {
      console.error('練習枠の取得エラー:', fetchError)
      return NextResponse.json(
        { 
          error: '練習枠の取得に失敗しました',
          details: fetchError.message || 'データベースエラーが発生しました'
        },
        { status: 500 }
      )
    }
    
    if (!slots || slots.length === 0) {
      return NextResponse.json(
        { error: `${date}の練習枠が見つかりませんでした` },
        { status: 404 }
      )
    }
    
    // すべての練習枠のステータスを'full'に更新
    const { data: updatedSlots, error: updateError } = await supabaseAdmin
      .from('practice_slots')
      .update({ status: 'full' })
      .eq('practice_date', date)
      .select()
    
    if (updateError) {
      console.error('練習枠の更新エラー:', updateError)
      return NextResponse.json(
        { 
          error: '練習枠の更新に失敗しました',
          details: updateError.message || 'データベースエラーが発生しました'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `${date}の練習枠${updatedSlots?.length || 0}件を満員に設定しました`,
      updatedSlots: updatedSlots?.map((slot) => ({
        id: slot.id,
        date: slot.practice_date,
        startTime: slot.start_time,
        endTime: slot.end_time,
        capacity: slot.capacity,
        currentReservations: slot.current_reservations,
        status: slot.status,
      }))
    })
  } catch (error) {
    console.error('エラーが発生しました:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}
