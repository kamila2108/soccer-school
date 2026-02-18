import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@/app/api/auth/[...nextauth]/route'

// 特定の練習枠の詳細を取得
export async function GET(
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

    // データベースから練習枠を取得
    const { data, error } = await supabaseAdmin
      .from('practice_slots')
      .select('*')
      .eq('id', id)
      .single()

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
          error: '練習枠の取得に失敗しました',
          details: error.message || 'データベースエラーが発生しました',
          code: error.code
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: '練習枠が見つかりません' },
        { status: 404 }
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

    // データ形式を変換（実装手順2のSQLでは practice_date と current_reservations を使用）
    const currentBookings = data.current_reservations || data.current_bookings || 0
    const slotCapacity = data.capacity || 0
    const dbStatus = (data.status || '').toUpperCase() as 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED'
    
    // ステータスを自動計算（CLOSEDとCANCELLEDは手動設定のため変更しない）
    let calculatedStatus: 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED' = dbStatus
    
    if (dbStatus !== 'CLOSED' && dbStatus !== 'CANCELLED') {
      // 予約数が定員に達している場合はFULL、そうでなければOPEN
      if (currentBookings >= slotCapacity) {
        calculatedStatus = 'FULL'
      } else {
        calculatedStatus = 'OPEN'
      }
      
      // データベースのステータスと実際のステータスが異なる場合は、データベースを更新
      if (calculatedStatus !== dbStatus) {
        await supabaseAdmin
          .from('practice_slots')
          .update({ status: calculatedStatus.toLowerCase() })
          .eq('id', id)
      }
    }
    
    const practiceSlot = {
      id: data.id,
      date: data.practice_date || data.date, // 両方の可能性に対応
      startTime: normalizeTime(data.start_time), // HH:MM形式に正規化
      endTime: normalizeTime(data.end_time), // HH:MM形式に正規化
      capacity: slotCapacity,
      currentBookings: currentBookings, // 両方の可能性に対応
      status: calculatedStatus, // 自動計算されたステータス
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return NextResponse.json({ practiceSlot })
  } catch (error) {
    console.error('練習枠取得エラー:', error)
    return NextResponse.json(
      { error: '練習枠の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 練習枠を更新
export async function PUT(
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
    const body = await request.json()
    const {
      date,
      startTime,
      endTime,
      capacity,
      status,
      notes,
    } = body

    // バリデーション
    if (capacity !== undefined && capacity <= 0) {
      return NextResponse.json(
        { error: '定員は1以上である必要があります' },
        { status: 400 }
      )
    }

    // 時間形式のチェック（値が存在し、空文字列でない場合のみ）
    if (startTime !== undefined && startTime !== null && startTime !== '') {
      const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      if (!timePattern.test(startTime)) {
        console.error('開始時間の形式エラー:', startTime)
        return NextResponse.json(
          { error: '開始時間はHH:MM形式で入力してください' },
          { status: 400 }
        )
      }
    }
    if (endTime !== undefined && endTime !== null && endTime !== '') {
      const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      if (!timePattern.test(endTime)) {
        console.error('終了時間の形式エラー:', endTime)
        return NextResponse.json(
          { error: '終了時間はHH:MM形式で入力してください' },
          { status: 400 }
        )
      }
    }

    // 現在の練習枠情報を取得（ステータス自動計算のため）
    const { data: currentSlot } = await supabaseAdmin
      .from('practice_slots')
      .select('*')
      .eq('id', id)
      .single()
    
    if (!currentSlot) {
      return NextResponse.json(
        { error: '練習枠が見つかりません' },
        { status: 404 }
      )
    }

    // 更新するデータを準備（スネークケースに変換）
    // 実装手順2のSQLでは practice_date を使用
    const updateData: any = {}
    if (date !== undefined) updateData.practice_date = date // 実装手順2のSQLでは practice_date
    if (startTime !== undefined) updateData.start_time = startTime
    if (endTime !== undefined) updateData.end_time = endTime
    if (capacity !== undefined) updateData.capacity = capacity
    if (notes !== undefined) updateData.notes = notes
    
    // ステータスの処理
    // ステータスが明示的に指定されている場合はそれを使用
    // 指定されていない場合は、予約数と定員に基づいて自動計算
    if (status !== undefined) {
      updateData.status = status.toLowerCase() // 実装手順2のSQLでは小文字
    } else {
      // ステータスが指定されていない場合、予約数と定員に基づいて自動計算
      const finalCapacity = capacity !== undefined ? capacity : currentSlot.capacity
      const currentBookings = currentSlot.current_reservations || currentSlot.current_bookings || 0
      const currentStatus = (currentSlot.status || '').toLowerCase()
      
      // CLOSEDとCANCELLEDは手動設定のため変更しない
      if (currentStatus !== 'closed' && currentStatus !== 'cancelled') {
        if (currentBookings >= finalCapacity) {
          updateData.status = 'full'
        } else {
          updateData.status = 'open'
        }
      }
    }

    // データベースを更新
    const { data, error } = await supabaseAdmin
      .from('practice_slots')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('データベース更新エラー:', error)
      console.error('エラー詳細:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        { 
          error: '練習枠の更新に失敗しました',
          details: error.message || 'データベースエラーが発生しました',
          code: error.code
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: '練習枠が見つかりません' },
        { status: 404 }
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

    // データ形式を変換（実装手順2のSQLでは practice_date と current_reservations を使用）
    const currentBookings = data.current_reservations || data.current_bookings || 0
    const slotCapacity = data.capacity || 0
    const dbStatus = (data.status || '').toUpperCase() as 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED'
    
    // ステータスを自動計算（CLOSEDとCANCELLEDは手動設定のため変更しない）
    let calculatedStatus: 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED' = dbStatus
    
    if (dbStatus !== 'CLOSED' && dbStatus !== 'CANCELLED') {
      // 予約数が定員に達している場合はFULL、そうでなければOPEN
      if (currentBookings >= slotCapacity) {
        calculatedStatus = 'FULL'
      } else {
        calculatedStatus = 'OPEN'
      }
      
      // データベースのステータスと実際のステータスが異なる場合は、データベースを更新
      if (calculatedStatus !== dbStatus) {
        await supabaseAdmin
          .from('practice_slots')
          .update({ status: calculatedStatus.toLowerCase() })
          .eq('id', id)
      }
    }
    
    const practiceSlot = {
      id: data.id,
      date: data.practice_date || data.date, // 両方の可能性に対応
      startTime: normalizeTime(data.start_time), // HH:MM形式に正規化
      endTime: normalizeTime(data.end_time), // HH:MM形式に正規化
      capacity: slotCapacity,
      currentBookings: currentBookings, // 両方の可能性に対応
      status: calculatedStatus, // 自動計算されたステータス
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return NextResponse.json({ 
      success: true,
      practiceSlot 
    })
  } catch (error) {
    console.error('練習枠更新エラー:', error)
    return NextResponse.json(
      { error: '練習枠更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 練習枠を削除
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

    // データベースから削除
    const { error } = await supabaseAdmin
      .from('practice_slots')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('データベース削除エラー:', error)
      return NextResponse.json(
        { error: '練習枠の削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: '練習枠を削除しました'
    })
  } catch (error) {
    console.error('練習枠削除エラー:', error)
    return NextResponse.json(
      { error: '練習枠削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
