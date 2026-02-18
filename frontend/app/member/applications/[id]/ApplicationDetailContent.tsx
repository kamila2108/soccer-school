'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  created_at: string
  rejected_reason: string | null
}

export default function ApplicationDetailContent() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        throw new Error(data.error || '申込み詳細の取得に失敗しました')
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
      pending: { label: '審査中', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: '承認済み', className: 'bg-green-100 text-green-800' },
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
              <Link href="/member/applications">
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
            href="/member/applications"
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
                <label className="text-sm font-medium text-gray-500">申込みID</label>
                <p className="mt-1 text-gray-900 font-mono text-sm">{application.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">申込み日時</label>
                <p className="mt-1 text-gray-900">{formatDate(application.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ステータス</label>
                <div className="mt-1">{getStatusBadge(application.status)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              お子さまの情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">氏名</label>
                <p className="mt-1 text-gray-900">{application.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">フリガナ</label>
                <p className="mt-1 text-gray-900">{application.name_kana}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">学年</label>
                <p className="mt-1 text-gray-900">{application.grade}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              連絡先情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">メールアドレス</label>
                <p className="mt-1 text-gray-900">{application.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">電話番号</label>
                <p className="mt-1 text-gray-900">{application.phone || '-'}</p>
              </div>
              {application.parent_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">保護者氏名</label>
                  <p className="mt-1 text-gray-900">{application.parent_name}</p>
                </div>
              )}
            </div>
          </div>

          {application.notes && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                備考
              </h2>
              <p className="text-gray-900 whitespace-pre-wrap">{application.notes}</p>
            </div>
          )}

          {application.status === 'rejected' && application.rejected_reason && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                却下理由
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 whitespace-pre-wrap">
                  {application.rejected_reason}
                </p>
              </div>
            </div>
          )}

          {application.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                <strong>承認済み</strong>
                <br />
                入会手続きのご案内をお送りします。しばらくお待ちください。
              </p>
            </div>
          )}

          {application.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>審査中</strong>
                <br />
                申込み内容を確認中です。承認が完了しましたら、ご連絡させていただきます。
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/member/applications" className="flex-1">
            <Button variant="secondary" className="w-full">
              一覧に戻る
            </Button>
          </Link>
          <Link href="/entry" className="flex-1">
            <Button className="w-full">
              新規申込みをする
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
