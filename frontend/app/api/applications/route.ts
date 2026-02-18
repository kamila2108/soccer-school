import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    // セッション情報を取得（ログインしているユーザーを確認）
    const session = await auth()
    
    console.log('セッション情報:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      dbId: session?.user?.dbId,
      userId: session?.user?.id,
    })
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です。セッションが見つかりません。' },
        { status: 401 }
      )
    }
    
    if (!session.user.dbId) {
      return NextResponse.json(
        { error: 'ログインが必要です。ユーザー情報が正しく取得できていません。' },
        { status: 401 }
      )
    }

    // リクエストボディからフォームデータを取得
    const body = await request.json()
    const {
      childName,
      childFurigana,
      grade,
      parentName,
      email,
      phone,
      note,
    } = body

    // バリデーション（必須項目のチェック）
    if (!childName || !childFurigana || !grade || !email || !phone) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    // データベースに保存（サービスロールキーを使用してRLSをバイパス）
    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        user_id: session.user.dbId,
        name: childName,
        name_kana: childFurigana,
        grade: grade,
        phone: phone,
        email: email,
        parent_name: parentName || null,
        notes: note || null,
        status: 'pending', // 初期状態は「未確認」
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
          error: '申込みの保存に失敗しました',
          details: error.message || 'データベースエラーが発生しました'
        },
        { status: 500 }
      )
    }

    // 成功レスポンス
    return NextResponse.json(
      { 
        success: true,
        applicationId: data.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('申込み処理エラー:', error)
    return NextResponse.json(
      { error: '申込み処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // セッション情報を取得（管理者かどうかを確認）
    const session = await auth()
    
    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // クエリパラメータを取得（?my=true の場合は自分の申込みのみ）
    const { searchParams } = new URL(request.url)
    const isMyApplications = searchParams.get('my') === 'true'

    let query = supabaseAdmin
      .from('applications')
      .select(`
        id,
        name,
        name_kana,
        grade,
        email,
        phone,
        status,
        created_at,
        rejected_reason,
        users:user_id (
          name,
          email
        )
      `)

    // 自分の申込みのみを取得する場合
    if (isMyApplications) {
      query = query.eq('user_id', session.user.dbId)
    }

    // データベースから申込み一覧を取得（サービスロールキーを使用してRLSをバイパス）
    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('データベース取得エラー:', error)
      return NextResponse.json(
        { error: '申込み一覧の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ applications: data || [] })
  } catch (error) {
    console.error('申込み一覧取得エラー:', error)
    return NextResponse.json(
      { error: '申込み一覧の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
