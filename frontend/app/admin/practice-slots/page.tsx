'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import { PracticeSlot, SlotStatusLabels, SlotStatusBadgeClasses } from '@/types/practice-slot'

export default function PracticeSlotsListPage() {
  const [practiceSlots, setPracticeSlots] = useState<PracticeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPracticeSlots()
  }, [])

  const fetchPracticeSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/practice-slots')
      const data = await response.json()

      if (!response.ok) {
        console.error('APIエラーレスポンス:', data)
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || '練習枠一覧の取得に失敗しました'
        throw new Error(errorMessage)
      }

      setPracticeSlots(data.practiceSlots || [])
    } catch (error) {
      console.error('練習枠一覧取得エラー:', error)
      setError(error instanceof Error ? error.message : '練習枠一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この練習枠を削除しますか？関連する予約も削除されます。')) {
      return
    }

    try {
      const response = await fetch(`/api/practice-slots/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '練習枠の削除に失敗しました')
      }

      // 一覧を再取得
      fetchPracticeSlots()
      alert('練習枠を削除しました')
    } catch (error) {
      console.error('練習枠削除エラー:', error)
      alert(error instanceof Error ? error.message : '練習枠の削除に失敗しました')
    }
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchPracticeSlots} className="mt-4">
              再読み込み
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              練習枠一覧
            </h1>
            <p className="text-gray-600">
              すべての練習枠を確認・管理できます
            </p>
          </div>
          <Link href="/admin/practice-slots/new">
            <Button>
              新規登録
            </Button>
          </Link>
        </div>

        {practiceSlots.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">練習枠が登録されていません</p>
            <Link href="/admin/practice-slots/new">
              <Button>最初の練習枠を登録する</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      練習日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      定員
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      予約数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      備考
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {practiceSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(slot.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.startTime} 〜 {slot.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.capacity}名
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.currentBookings}名
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${SlotStatusBadgeClasses[slot.status]}`}>
                          {SlotStatusLabels[slot.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {slot.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/practice-slots/${slot.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
