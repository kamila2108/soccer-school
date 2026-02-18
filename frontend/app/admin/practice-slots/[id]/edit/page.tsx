'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import { PracticeSlot, SlotStatus } from '@/types/practice-slot'

export default function EditPracticeSlotPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    capacity: '',
    status: 'OPEN' as SlotStatus,
    notes: '',
  })

  useEffect(() => {
    fetchPracticeSlot()
  }, [id])

  const fetchPracticeSlot = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/practice-slots/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '練習枠の取得に失敗しました')
      }

      const slot: PracticeSlot = data.practiceSlot
      
      console.log('取得した練習枠データ:', slot)
      
      // 日付をYYYY-MM-DD形式に変換
      const date = new Date(slot.date)
      const dateStr = date.toISOString().split('T')[0]

      // 時間をHH:MM形式に正規化（既にHH:MM形式の場合はそのまま、それ以外の場合は変換）
      const normalizeTime = (time: string): string => {
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

      setFormData({
        date: dateStr,
        startTime: normalizeTime(slot.startTime),
        endTime: normalizeTime(slot.endTime),
        capacity: slot.capacity.toString(),
        status: slot.status,
        notes: slot.notes || '',
      })
      
      console.log('フォームデータ:', {
        date: dateStr,
        startTime: normalizeTime(slot.startTime),
        endTime: normalizeTime(slot.endTime),
      })
    } catch (error) {
      console.error('練習枠取得エラー:', error)
      setError(error instanceof Error ? error.message : '練習枠の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      setSaving(true)

      const requestData = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        capacity: capacity,
        status: formData.status,
        notes: formData.notes || null,
      }
      
      console.log('送信するデータ:', requestData)

      const response = await fetch(`/api/practice-slots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '練習枠の更新に失敗しました')
      }

      // 成功したら一覧ページにリダイレクト
      router.push('/admin/practice-slots')
      router.refresh()
    } catch (error) {
      console.error('練習枠更新エラー:', error)
      setError(error instanceof Error ? error.message : '練習枠の更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error && !formData.date) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <Link href="/admin/practice-slots">
              <Button className="mt-4">練習枠一覧に戻る</Button>
            </Link>
          </div>
        </div>
      </div>
    )
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
            練習枠を編集
          </h1>
          <p className="text-gray-600 mt-2">
            練習枠の情報を編集できます
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
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="OPEN">受付中</option>
                <option value="FULL">満席</option>
                <option value="CLOSED">受付終了</option>
                <option value="CANCELLED">中止</option>
              </select>
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
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Link href="/admin/practice-slots">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? '更新中...' : '更新する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
