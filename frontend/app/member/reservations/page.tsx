'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import { formatSlotDate } from '@/types/practice-slot'

type Reservation = {
  id: string
  status: string
  createdAt: string
  cancelledAt: string | null
  practiceSlot: {
    id: string
    date: string
    startTime: string
    endTime: string
    capacity: number
    currentBookings: number
    status: string
    notes: string | null
  }
}

export default function ReservationsListPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingReservationId, setCancellingReservationId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.dbId) {
      fetchReservations()
    }
  }, [session])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reservations')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '予約一覧の取得に失敗しました')
      }

      setReservations(data.reservations || [])
    } catch (error) {
      console.error('予約一覧取得エラー:', error)
      setError(error instanceof Error ? error.message : '予約一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (reservationId: string) => {
    if (!confirm('この予約をキャンセルしますか？')) {
      return
    }

    try {
      setCancellingReservationId(reservationId)

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '予約のキャンセルに失敗しました')
      }

      alert('予約をキャンセルしました')
      // 一覧を再取得
      fetchReservations()
    } catch (error) {
      console.error('予約キャンセルエラー:', error)
      alert(error instanceof Error ? error.message : '予約のキャンセルに失敗しました')
    } finally {
      setCancellingReservationId(null)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!session?.user?.dbId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">ログインが必要です</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            ログインページへ
          </Button>
        </div>
      </div>
    )
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
            <Button onClick={fetchReservations} className="mt-4">
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
              予約一覧
            </h1>
            <p className="text-gray-600">
              あなたの予約を確認・管理できます
            </p>
          </div>
          <Link href="/member/practice-slots">
            <Button variant="outline">
              練習一覧に戻る
            </Button>
          </Link>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">予約がありません</p>
            <Button onClick={() => router.push('/member/practice-slots')}>
              練習一覧を見る
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const isCancelling = cancellingReservationId === reservation.id
              const slotDate = new Date(reservation.practiceSlot.date)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              slotDate.setHours(0, 0, 0, 0)
              const isPast = slotDate < today

              return (
                <div key={reservation.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {formatSlotDate(reservation.practiceSlot.date)}
                      </h2>
                      <p className="text-gray-600">
                        {reservation.practiceSlot.startTime} 〜 {reservation.practiceSlot.endTime}
                      </p>
                    </div>
                    {!isPast && (
                      <Button
                        onClick={() => handleCancel(reservation.id)}
                        disabled={isCancelling}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {isCancelling ? 'キャンセル中...' : 'キャンセル'}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">予約日時:</span>{' '}
                      {formatDateTime(reservation.createdAt)}
                    </div>
                    {reservation.practiceSlot.notes && (
                      <div>
                        <span className="font-semibold">備考:</span>{' '}
                        {reservation.practiceSlot.notes}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
