import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // セッション情報を取得
    const session = await auth()
    
    console.log('申込み詳細取得 - セッション情報:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      dbId: session?.user?.dbId,
    })
    
    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // Next.js 15ではparamsがPromiseになる可能性があるため、awaitする
    const resolvedParams = await Promise.resolve(params)
    const applicationId = resolvedParams.id
    
    console.log('申込み詳細取得 - 申込みID:', applicationId)

    // データベースから申込み詳細を取得（サービスロールキーを使用してRLSをバイパス）
    // まず、申込み情報を取得
    const { data: applicationData, error: applicationError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (applicationError) {
      console.error('申込みデータ取得エラー:', applicationError)
      return NextResponse.json(
        { 
          error: '申込み詳細の取得に失敗しました',
          details: applicationError.message || 'データベースエラーが発生しました'
        },
        { status: 500 }
      )
    }

    if (!applicationData) {
      return NextResponse.json(
        { error: '申込みが見つかりません' },
        { status: 404 }
      )
    }

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, phone')
      .eq('id', applicationData.user_id)
      .single()

    if (userError) {
      console.error('ユーザーデータ取得エラー:', userError)
      // ユーザー情報が取得できなくても、申込み情報は返す
    }

    // 申込み情報とユーザー情報を結合
    const data = {
      ...applicationData,
      users: userData || null,
    }

    return NextResponse.json({ application: data })
  } catch (error) {
    console.error('申込み詳細取得エラー:', error)
    return NextResponse.json(
      { error: '申込み詳細の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // TODO: 管理者権限のチェック（後で実装）
    // 現時点では、ログインしていれば全員がアクセス可能

    // Next.js 15ではparamsがPromiseになる可能性があるため、awaitする
    const resolvedParams = await Promise.resolve(params)
    const applicationId = resolvedParams.id

    // リクエストボディからアクションを取得
    const body = await request.json()
    const { action, rejectedReason } = body

    // 申込み情報を取得
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: '申込みが見つかりません' },
        { status: 404 }
      )
    }

    // ステータスがpendingでない場合はエラー
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'この申込みは既に処理済みです' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // 承認処理
      const { data: updatedApplication, error: updateError } = await supabaseAdmin
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId)
        .select()
        .single()

      if (updateError) {
        console.error('承認処理エラー:', updateError)
        return NextResponse.json(
          { error: '承認処理に失敗しました' },
          { status: 500 }
        )
      }

      // 通知を作成
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: application.user_id,
          type: 'APPLICATION_STATUS',
          title: '入会申込みが承認されました',
          content: `お子さま（${application.name}）の入会申込みが承認されました。入会手続きのご案内をお送りします。`,
        })

      if (notificationError) {
        console.error('通知作成エラー:', notificationError)
        // 通知の作成に失敗しても、承認処理は成功として扱う
      }

      return NextResponse.json({
        success: true,
        application: updatedApplication,
      })
    } else if (action === 'reject') {
      // 却下処理
      if (!rejectedReason || rejectedReason.trim() === '') {
        return NextResponse.json(
          { error: '却下理由を入力してください' },
          { status: 400 }
        )
      }

      const { data: updatedApplication, error: updateError } = await supabaseAdmin
        .from('applications')
        .update({
          status: 'rejected',
          rejected_reason: rejectedReason,
        })
        .eq('id', applicationId)
        .select()
        .single()

      if (updateError) {
        console.error('却下処理エラー:', updateError)
        return NextResponse.json(
          { error: '却下処理に失敗しました' },
          { status: 500 }
        )
      }

      // 通知を作成
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: application.user_id,
          type: 'APPLICATION_STATUS',
          title: '入会申込みについて',
          content: `お子さま（${application.name}）の入会申込みについて、以下の理由によりお受けできませんでした。\n\n${rejectedReason}`,
        })

      if (notificationError) {
        console.error('通知作成エラー:', notificationError)
        // 通知の作成に失敗しても、却下処理は成功として扱う
      }

      return NextResponse.json({
        success: true,
        application: updatedApplication,
      })
    } else {
      return NextResponse.json(
        { error: '不正なアクションです' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('申込み処理エラー:', error)
    return NextResponse.json(
      { error: '処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
