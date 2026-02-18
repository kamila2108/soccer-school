import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@/app/api/auth/[...nextauth]/route'

// 予約一覧を取得（自分の予約のみ）
export async function GET(request: NextRequest) {
  try {
    // セッション情報を取得（ログインしているユーザーを確認）
    const session = await auth()
    
    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // データベースから予約一覧を取得（自分の予約のみ）
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select(`
        id,
        status,
        created_at,
        cancelled_at,
        practice_slots:practice_slot_id (
          id,
          practice_date,
          start_time,
          end_time,
          capacity,
          current_reservations,
          status,
          notes
        )
      `)
      .eq('user_id', session.user.dbId)
      .eq('status', 'active') // 有効な予約のみ
      .order('created_at', { ascending: false })

    if (error) {
      console.error('データベース取得エラー:', error)
      return NextResponse.json(
        { error: '予約一覧の取得に失敗しました' },
        { status: 500 }
      )
    }

    // データ形式を変換（スネークケース → キャメルケース）
    const reservations = (data || []).map((reservation) => {
      // practice_slotsが配列の場合は最初の要素を取得、そうでない場合はそのまま使用
      const practiceSlot = Array.isArray(reservation.practice_slots) 
        ? reservation.practice_slots[0] 
        : reservation.practice_slots

      if (!practiceSlot) {
        // practice_slotsが存在しない場合はスキップ
        return null
      }

      return {
        id: reservation.id,
        status: reservation.status,
        createdAt: reservation.created_at,
        cancelledAt: reservation.cancelled_at,
        practiceSlot: {
          id: practiceSlot.id,
          date: practiceSlot.practice_date,
          startTime: practiceSlot.start_time,
          endTime: practiceSlot.end_time,
          capacity: practiceSlot.capacity,
          currentBookings: practiceSlot.current_reservations || 0,
          status: (practiceSlot.status || '').toUpperCase(),
          notes: practiceSlot.notes,
        },
      }
    }).filter((reservation) => reservation !== null)

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error('予約一覧取得エラー:', error)
    return NextResponse.json(
      { error: '予約一覧の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 新しい予約を作成
export async function POST(request: NextRequest) {
  try {
    // セッション情報を取得（ログインしているユーザーを確認）
    const session = await auth()
    
    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // リクエストボディからフォームデータを取得
    const body = await request.json()
    const { practiceSlotId } = body

    // バリデーション（必須項目のチェック）
    if (!practiceSlotId) {
      return NextResponse.json(
        { error: '練習枠IDが指定されていません' },
        { status: 400 }
      )
    }

    // 練習枠の情報を取得
    const { data: slotData, error: slotError } = await supabaseAdmin
      .from('practice_slots')
      .select('*')
      .eq('id', practiceSlotId)
      .single()

    if (slotError || !slotData) {
      return NextResponse.json(
        { error: '練習枠が見つかりません' },
        { status: 404 }
      )
    }

    // 予約制約のチェック
    // 1. 練習枠のステータスが予約可能かチェック
    const slotStatus = (slotData.status || '').toLowerCase()
    if (slotStatus !== 'open') {
      return NextResponse.json(
        { error: 'この練習枠は予約できません' },
        { status: 400 }
      )
    }

    // 2. 空きがあるかチェック
    const currentBookings = slotData.current_reservations || slotData.current_bookings || 0
    if (currentBookings >= slotData.capacity) {
      return NextResponse.json(
        { error: 'この練習枠は満席です' },
        { status: 400 }
      )
    }

    // 3. 既に予約していないかチェック（重複予約の防止）
    const { data: existingReservation } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('user_id', session.user.dbId)
      .eq('practice_slot_id', practiceSlotId)
      .eq('status', 'active')
      .single()

    if (existingReservation) {
      return NextResponse.json(
        { error: 'この練習枠は既に予約済みです' },
        { status: 400 }
      )
    }

    // 4. 予約上限数のチェック（例: 1人あたり最大3件まで）
    const MAX_RESERVATIONS = 3
    const { data: userReservations } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('user_id', session.user.dbId)
      .eq('status', 'active')

    if (userReservations && userReservations.length >= MAX_RESERVATIONS) {
      return NextResponse.json(
        { error: `予約上限数（${MAX_RESERVATIONS}件）に達しています` },
        { status: 400 }
      )
    }

    // トランザクション処理: 予約を作成し、練習枠の予約数を更新
    // 注意: Supabaseではトランザクションが直接サポートされていないため、
    // 順番に実行し、エラーが発生した場合はロールバック処理を実装する

    // 1. 予約を作成
    const { data: reservationData, error: reservationError } = await supabaseAdmin
      .from('reservations')
      .insert({
        user_id: session.user.dbId,
        practice_slot_id: practiceSlotId,
        status: 'active',
      })
      .select()
      .single()

    if (reservationError) {
      console.error('予約作成エラー:', reservationError)
      return NextResponse.json(
        { 
          error: '予約の作成に失敗しました',
          details: reservationError.message || 'データベースエラーが発生しました'
        },
        { status: 500 }
      )
    }

    // 2. 練習枠の予約数を更新
    const newCurrentBookings = currentBookings + 1
    let newStatus = slotStatus
    
    // 満席になった場合はステータスを更新
    if (newCurrentBookings >= slotData.capacity) {
      newStatus = 'full'
    }

    const { error: updateError } = await supabaseAdmin
      .from('practice_slots')
      .update({
        current_reservations: newCurrentBookings,
        status: newStatus,
      })
      .eq('id', practiceSlotId)

    if (updateError) {
      console.error('練習枠更新エラー:', updateError)
      // 予約は作成されたが、練習枠の更新に失敗した場合
      // 実際の運用では、この場合のロールバック処理を実装することを推奨
      return NextResponse.json(
        { 
          error: '予約は作成されましたが、練習枠の更新に失敗しました',
          details: updateError.message || 'データベースエラーが発生しました'
        },
        { status: 500 }
      )
    }

    // 成功レスポンス
    return NextResponse.json(
      { 
        success: true,
        reservation: {
          id: reservationData.id,
          practiceSlotId: practiceSlotId,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('予約作成エラー:', error)
    return NextResponse.json(
      { error: '予約作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
