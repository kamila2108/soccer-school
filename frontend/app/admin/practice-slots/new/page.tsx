'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'

export default function NewPracticeSlotPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    capacity: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // バリデーション
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.capacity) {
      setError('必須項目が入力されていません')
      return
    }

    const capacity = parseInt(formData.capacity, 10)
    if (isNaN(capacity) || capacity <= 0) {
      setError('定員は1以上の数値を入力してください')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/practice-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          capacity: capacity,
          notes: formData.notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '練習枠の登録に失敗しました')
      }

      // 成功したら一覧ページにリダイレクト
      router.push('/admin/practice-slots')
      router.refresh()
    } catch (error) {
      console.error('練習枠登録エラー:', error)
      setError(error instanceof Error ? error.message : '練習枠の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/admin/practice-slots"
            className="text-green-600 hover:text-green-900 mb-4 inline-block"
          >
            ← 練習枠一覧に戻る
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">
            練習枠を登録
          </h1>
          <p className="text-gray-600 mt-2">
            新しい練習枠の情報を入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                練習日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  開始時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-1 text-sm text-gray-500">HH:MM形式（例: 10:00）</p>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  終了時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-1 text-sm text-gray-500">HH:MM形式（例: 12:00）</p>
              </div>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                定員 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">参加できる最大人数</p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                備考
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">任意のメモや注意事項</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Link href="/admin/practice-slots">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? '登録中...' : '登録する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
