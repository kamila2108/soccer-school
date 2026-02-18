import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@/app/api/auth/[...nextauth]/route'

// 予約をキャンセル
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // セッション情報を取得
    const session = await auth()
    
    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // Next.js 15ではparamsがPromiseになる可能性があるため、awaitする
    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    // 予約情報を取得（自分の予約か確認）
    const { data: reservationData, error: reservationError } = await supabaseAdmin
      .from('reservations')
      .select('*, practice_slots:practice_slot_id (*)')
      .eq('id', id)
      .eq('user_id', session.user.dbId)
      .eq('status', 'active')
      .single()

    if (reservationError || !reservationData) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      )
    }

    const practiceSlot = reservationData.practice_slots
    const currentBookings = practiceSlot.current_reservations || practiceSlot.current_bookings || 0

    // 1. 予約をキャンセル（ステータスを'cancelled'に更新）
    const { error: cancelError } = await supabaseAdmin
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (cancelError) {
      console.error('予約キャンセルエラー:', cancelError)
      return NextResponse.json(
        { error: '予約のキャンセルに失敗しました' },
        { status: 500 }
      )
    }

    // 2. 練習枠の予約数を更新
    const newCurrentBookings = Math.max(0, currentBookings - 1)
    let newStatus = (practiceSlot.status || '').toLowerCase()
    
    // 満席から空きが出た場合はステータスを'open'に更新
    if (newStatus === 'full' && newCurrentBookings < practiceSlot.capacity) {
      newStatus = 'open'
    }

    const { error: updateError } = await supabaseAdmin
      .from('practice_slots')
      .update({
        current_reservations: newCurrentBookings,
        status: newStatus,
      })
      .eq('id', practiceSlot.id)

    if (updateError) {
      console.error('練習枠更新エラー:', updateError)
      // 予約はキャンセルされたが、練習枠の更新に失敗した場合
      return NextResponse.json(
        { 
          error: '予約はキャンセルされましたが、練習枠の更新に失敗しました',
          details: updateError.message || 'データベースエラーが発生しました'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: '予約をキャンセルしました'
    })
  } catch (error) {
    console.error('予約キャンセルエラー:', error)
    return NextResponse.json(
      { error: '予約キャンセル中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
