'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { PracticeSlot, SlotStatusLabels, SlotStatusBadgeClasses } from '@/types/practice-slot'

type Application = {
  id: string
  name: string
  name_kana: string
  grade: string
  email: string | null
  phone: string | null
  status: string
  created_at: string
  users?: {
    name: string
    email: string | null
  }
}

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [practiceSlots, setPracticeSlots] = useState<PracticeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 入会申込みと練習枠を並列で取得
      const [applicationsResponse, practiceSlotsResponse] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/practice-slots'),
      ])

      const applicationsData = await applicationsResponse.json()
      const practiceSlotsData = await practiceSlotsResponse.json()

      if (!applicationsResponse.ok) {
        throw new Error(applicationsData.error || '申込み一覧の取得に失敗しました')
      }

      if (!practiceSlotsResponse.ok) {
        throw new Error(practiceSlotsData.error || '練習枠一覧の取得に失敗しました')
      }

      setApplications(applicationsData.applications || [])
      setPracticeSlots(practiceSlotsData.practiceSlots || [])
    } catch (error) {
      console.error('データ取得エラー:', error)
      setError(error instanceof Error ? error.message : 'データの取得に失敗しました')
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
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
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
      weekday: 'short',
    })
  }

  // 統計情報を計算
  const pendingApplications = applications.filter((app) => app.status === 'pending').length
  const upcomingSlots = practiceSlots.filter((slot) => {
    const slotDate = new Date(slot.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return slotDate >= today
  }).length
  const fullSlots = practiceSlots.filter((slot) => slot.status === 'FULL').length
  const openSlots = practiceSlots.filter((slot) => slot.status === 'OPEN').length

  // 最近の入会申込み（最新5件）
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // 今後の練習枠（最新10件）
  const upcomingPracticeSlots = [...practiceSlots]
    .filter((slot) => {
      const slotDate = new Date(slot.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return slotDate >= today
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              再読み込み
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            管理者ダッシュボード
          </h1>
          <p className="text-gray-600">
            入会管理と練習枠の管理
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">未確認の申込み</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingApplications}件</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">今後の練習枠</p>
                <p className="text-3xl font-bold text-green-600">{upcomingSlots}件</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">受付中の練習枠</p>
                <p className="text-3xl font-bold text-blue-600">{openSlots}件</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">満席の練習枠</p>
                <p className="text-3xl font-bold text-red-600">{fullSlots}件</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 入会管理セクション */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">入会管理</h2>
              <Link href="/admin/applications">
                <Button variant="outline" className="text-sm">
                  すべて見る
                </Button>
              </Link>
            </div>
            
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                申込みがありません
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        氏名
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {application.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {application.grade}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(application.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/applications/${application.id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            詳細
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 練習枠セクション */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">練習枠</h2>
              <div className="space-x-2">
                <Link href="/admin/practice-slots/new">
                  <Button variant="outline" className="text-sm">
                    新規登録
                  </Button>
                </Link>
                <Link href="/admin/practice-slots">
                  <Button variant="outline" className="text-sm">
                    すべて見る
                  </Button>
                </Link>
              </div>
            </div>
            
            {upcomingPracticeSlots.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                練習枠が登録されていません
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        練習日
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        時間
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        予約数
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingPracticeSlots.map((slot) => (
                      <tr key={slot.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(slot.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {slot.startTime} 〜 {slot.endTime}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {slot.currentBookings}/{slot.capacity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${SlotStatusBadgeClasses[slot.status]}`}>
                            {SlotStatusLabels[slot.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
