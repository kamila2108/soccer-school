'use client'

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
  status: string
  created_at: string
  rejected_reason: string | null
}

export default function MyApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/applications?my=true')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '申込み一覧の取得に失敗しました')
      }

      setApplications(data.applications || [])
    } catch (error) {
      console.error('申込み一覧取得エラー:', error)
      setError(error instanceof Error ? error.message : '申込み一覧の取得に失敗しました')
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchApplications} className="mt-4">
              再読み込み
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/member"
            className="text-green-600 hover:text-green-800 text-sm mb-4 inline-block"
          >
            ← 会員ページに戻る
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            入会申込み状況
          </h1>
          <p className="text-gray-600">
            あなたの入会申込みの状況を確認できます
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">申込み履歴がありません</p>
            <Link href="/entry">
              <Button>新規申込みをする</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.name}（{application.name_kana}）
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>学年: {application.grade}</p>
                      <p>申込み日時: {formatDate(application.created_at)}</p>
                      {application.status === 'rejected' && application.rejected_reason && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-red-800 font-semibold text-xs mb-1">却下理由:</p>
                          <p className="text-red-700 text-sm whitespace-pre-wrap">
                            {application.rejected_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/member/applications/${application.id}`}>
                      <Button variant="secondary" className="w-full md:w-auto">
                        詳細を見る
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/entry">
            <Button variant="secondary">新規申込みをする</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
