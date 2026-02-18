'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'

type Application = {
  id: string
  name: string
  name_kana: string
  grade: string
  email: string | null
  phone: string | null
  parent_name: string | null
  notes: string | null
  status: string
  rejected_reason: string | null
  admin_memo: string | null
  created_at: string
  updated_at: string
  users?: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const applicationId = params.id as string
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 1-3: 承認処理の状態
  const [isProcessing, setIsProcessing] = useState(false)
  const [processError, setProcessError] = useState<string | null>(null)
  
  // 2-2: 却下理由入力の状態
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectedReason, setRejectedReason] = useState('')

  useEffect(() => {
    if (applicationId) {
      fetchApplication()
    }
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/applications/${applicationId}`)
      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || '申込み詳細の取得に失敗しました'
        console.error('APIエラー:', {
          status: response.status,
          error: data.error,
          details: data.details,
        })
        throw new Error(errorMessage)
      }

      setApplication(data.application)
    } catch (error) {
      console.error('申込み詳細取得エラー:', error)
      setError(error instanceof Error ? error.message : '申込み詳細の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: '未確認', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: '承認', className: 'bg-green-100 text-green-800' },
      rejected: { label: '却下', className: 'bg-red-100 text-red-800' },
    }

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 1-3: 承認処理の関数
  const handleApprove = async () => {
    if (!confirm('この申込みを承認しますか？')) {
      return
    }

    setIsProcessing(true)
    setProcessError(null)

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '承認処理に失敗しました')
      }

      // 成功した場合、ページを再読み込み
      alert('承認処理が完了しました')
      fetchApplication() // 申込み情報を再取得
    } catch (error) {
      console.error('承認エラー:', error)
      setProcessError(error instanceof Error ? error.message : '承認処理に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  // 2-2: 却下処理の関数
  const handleReject = async () => {
    if (!rejectedReason.trim()) {
      alert('却下理由を入力してください')
      return
    }

    setIsProcessing(true)
    setProcessError(null)

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          rejectedReason: rejectedReason.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '却下処理に失敗しました')
      }

      // 成功した場合、モーダルを閉じてページを再読み込み
      setShowRejectModal(false)
      setRejectedReason('')
      alert('却下処理が完了しました')
      fetchApplication() // 申込み情報を再取得
    } catch (error) {
      console.error('却下エラー:', error)
      setProcessError(error instanceof Error ? error.message : '却下処理に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || '申込みが見つかりません'}</p>
            <div className="mt-4 flex gap-3">
              <Button onClick={fetchApplication}>再読み込み</Button>
              <Link href="/admin/applications">
                <Button variant="secondary">一覧に戻る</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/applications"
            className="text-green-600 hover:text-green-800 text-sm mb-4 inline-block"
          >
            ← 一覧に戻る
          </Link>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              入会申込み詳細
            </h1>
            {getStatusBadge(application.status)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              申込み情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  申込みID
                </label>
                <p className="text-gray-900 font-mono text-sm">{application.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  申込み日時
                </label>
                <p className="text-gray-900">{formatDate(application.created_at)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  お子さまの氏名
                </label>
                <p className="text-gray-900">{application.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  フリガナ
                </label>
                <p className="text-gray-900">{application.name_kana}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  学年
                </label>
                <p className="text-gray-900">{application.grade}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  メールアドレス
                </label>
                <p className="text-gray-900">{application.email || '（未入力）'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  電話番号
                </label>
                <p className="text-gray-900">{application.phone || '（未入力）'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  保護者氏名
                </label>
                <p className="text-gray-900">{application.parent_name || '（未入力）'}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  その他・ご質問など
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {application.notes || '（未入力）'}
                </p>
              </div>
            </div>
          </div>

          {application.users && (
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                ユーザー情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    ユーザー名
                  </label>
                  <p className="text-gray-900">{application.users.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    ユーザーメールアドレス
                  </label>
                  <p className="text-gray-900">{application.users.email || '（未入力）'}</p>
                </div>
              </div>
            </div>
          )}

          {application.rejected_reason && (
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                却下理由
              </h2>
              <p className="text-gray-900 whitespace-pre-wrap">
                {application.rejected_reason}
              </p>
            </div>
          )}

          {application.admin_memo && (
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                管理者メモ
              </h2>
              <p className="text-gray-900 whitespace-pre-wrap">
                {application.admin_memo}
              </p>
            </div>
          )}

          <div className="pt-6 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                onClick={handleApprove}
                disabled={application.status !== 'pending' || isProcessing}
              >
                {isProcessing ? '処理中...' : '承認する'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(true)}
                disabled={application.status !== 'pending' || isProcessing}
              >
                却下する
              </Button>
            </div>
            {processError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{processError}</p>
              </div>
            )}
          </div>

          {/* 2-2: 却下理由入力モーダル */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold mb-4">却下理由を入力</h3>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                  rows={5}
                  value={rejectedReason}
                  onChange={(e) => setRejectedReason(e.target.value)}
                  placeholder="却下理由を入力してください"
                />
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowRejectModal(false)
                      setRejectedReason('')
                    }}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing || !rejectedReason.trim()}
                    className="flex-1"
                  >
                    {isProcessing ? '処理中...' : '却下する'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
