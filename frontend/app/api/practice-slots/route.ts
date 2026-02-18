import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@/app/api/auth/[...nextauth]/route'

// 練習枠一覧を取得（公開情報のため、ログイン不要）
export async function GET(request: NextRequest) {
  try {
    // 練習枠一覧は公開情報のため、ログイン不要で取得可能

    // クエリパラメータを取得（日付範囲やステータスでフィルター可能）
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const status = searchParams.get('status')

    // データベースから練習枠一覧を取得
    // 実装手順2のSQLでは practice_date と current_reservations を使用
    let query = supabaseAdmin
      .from('practice_slots')
      .select('*')
      .order('practice_date', { ascending: true })
      .order('start_time', { ascending: true })

    // 日付範囲でフィルター
    if (dateFrom) {
      query = query.gte('practice_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('practice_date', dateTo)
    }
    if (status) {
      // ステータスを小文字に変換（実装手順2のSQLでは小文字）
      const statusLower = status.toLowerCase()
      query = query.eq('status', statusLower)
    }

    const { data, error } = await query

    if (error) {
      console.error('データベース取得エラー:', error)
      console.error('エラー詳細:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        { 
          error: '練習枠一覧の取得に失敗しました',
          details: error.message || 'データベースエラーが発生しました',
          code: error.code
        },
        { status: 500 }
      )
    }

    // 時間をHH:MM形式に正規化（TIME型はHH:MM:SS形式で返される可能性があるため）
    const normalizeTime = (time: string | null | undefined): string => {
      if (!time) return ''
      // 既にHH:MM形式の場合はそのまま返す
      if (/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        return time
      }
      // HH:MM:SS形式の場合はHH:MMに変換
      if (/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time)) {
        return time.substring(0, 5)
      }
      return time
    }

    // データ形式を変換（スネークケース → キャメルケース）
    // 実装手順2のSQLでは practice_date と current_reservations を使用
    const practiceSlots = (data || []).map((slot) => {
      const currentBookings = slot.current_reservations || slot.current_bookings || 0
      const capacity = slot.capacity || 0
      const dbStatus = (slot.status || '').toUpperCase() as 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED'
      
      // ステータスを自動計算（CLOSEDとCANCELLEDは手動設定のため変更しない）
      let calculatedStatus: 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED' = dbStatus
      
      if (dbStatus !== 'CLOSED' && dbStatus !== 'CANCELLED') {
        // 予約数が定員に達している場合はFULL、そうでなければOPEN
        if (currentBookings >= capacity) {
          calculatedStatus = 'FULL'
        } else {
          calculatedStatus = 'OPEN'
        }
        
        // データベースのステータスと実際のステータスが異なる場合は、データベースを更新
        if (calculatedStatus !== dbStatus) {
          // 非同期で更新（レスポンスをブロックしない）
          supabaseAdmin
            .from('practice_slots')
            .update({ status: calculatedStatus.toLowerCase() })
            .eq('id', slot.id)
            .then(({ error }) => {
              if (error) {
                console.error(`練習枠 ${slot.id} のステータス更新エラー:`, error)
              }
            })
            .catch((error) => {
              console.error(`練習枠 ${slot.id} のステータス更新エラー:`, error)
            })
        }
      }
      
      return {
        id: slot.id,
        date: slot.practice_date || slot.date, // 両方の可能性に対応
        startTime: normalizeTime(slot.start_time), // HH:MM形式に正規化
        endTime: normalizeTime(slot.end_time), // HH:MM形式に正規化
        capacity: capacity,
        currentBookings: currentBookings, // 両方の可能性に対応
        status: calculatedStatus, // 自動計算されたステータス
        notes: slot.notes,
        createdAt: slot.created_at,
        updatedAt: slot.updated_at,
      }
    })

    return NextResponse.json({ practiceSlots })
  } catch (error) {
    console.error('練習枠一覧取得エラー:', error)
    return NextResponse.json(
      { error: '練習枠一覧の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 新しい練習枠を作成
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
    const {
      date,
      startTime,
      endTime,
      capacity,
      notes,
    } = body

    // バリデーション（必須項目のチェック）
    if (!date || !startTime || !endTime || !capacity) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    // 定員が正の数かチェック
    if (capacity <= 0) {
      return NextResponse.json(
        { error: '定員は1以上である必要があります' },
        { status: 400 }
      )
    }

    // 時間形式のチェック（HH:MM形式）
    const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      return NextResponse.json(
        { error: '時間はHH:MM形式で入力してください' },
        { status: 400 }
      )
    }

    // 終了時間が開始時間より後かチェック
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    
    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: '終了時間は開始時間より後である必要があります' },
        { status: 400 }
      )
    }

    // データベースに保存（スネークケースに変換）
    // 実装手順2のSQLでは practice_date と current_reservations を使用
    const { data, error } = await supabaseAdmin
      .from('practice_slots')
      .insert({
        practice_date: date, // 実装手順2のSQLでは practice_date
        start_time: startTime,
        end_time: endTime,
        capacity: capacity,
        current_reservations: 0, // 実装手順2のSQLでは current_reservations
        status: 'open', // 実装手順2のSQLでは小文字
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('データベース保存エラー:', error)
      console.error('エラー詳細:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        { 
          error: '練習枠の保存に失敗しました',
          details: error.message || 'データベースエラーが発生しました',
          code: error.code
        },
        { status: 500 }
      )
    }

    // 成功レスポンス（キャメルケースに変換）
    const practiceSlot = {
      id: data.id,
      date: data.practice_date || data.date, // 両方の可能性に対応
      startTime: data.start_time,
      endTime: data.end_time,
      capacity: data.capacity,
      currentBookings: data.current_reservations || data.current_bookings || 0, // 両方の可能性に対応
      status: (data.status || '').toUpperCase() as 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED', // 大文字に変換
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return NextResponse.json(
      { 
        success: true,
        practiceSlot
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('練習枠作成エラー:', error)
    return NextResponse.json(
      { error: '練習枠作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
