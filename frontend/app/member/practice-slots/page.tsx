'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import { PracticeSlot, SlotStatusLabels, SlotStatusBadgeClasses, isSlotAvailable, getRemainingCapacity, formatSlotDate } from '@/types/practice-slot'

// 予約情報の型定義
type Reservation = {
  id: string
  practiceSlot: {
    id: string
  }
  status: string
}

// 練習枠に予約情報を追加した型
type PracticeSlotWithReservation = PracticeSlot & {
  isReserved: boolean
  reservationId: string | null
}

export default function PracticeSlotsListPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [practiceSlots, setPracticeSlots] = useState<PracticeSlotWithReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reservingSlotId, setReservingSlotId] = useState<string | null>(null)
  const [cancellingReservationId, setCancellingReservationId] = useState<string | null>(null)

  useEffect(() => {
    fetchPracticeSlots()
  }, [session])

  const fetchPracticeSlots = async () => {
    try {
      setLoading(true)
      
      // 練習枠一覧を取得
      const slotsResponse = await fetch('/api/practice-slots')
      const slotsData = await slotsResponse.json()

      if (!slotsResponse.ok) {
        throw new Error(slotsData.error || '練習枠一覧の取得に失敗しました')
      }

      // 未来の日付の練習枠のみを表示（過去の練習は表示しない）
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let futureSlots = (slotsData.practiceSlots || []).filter((slot: PracticeSlot) => {
        const slotDate = new Date(slot.date)
        slotDate.setHours(0, 0, 0, 0)
        return slotDate >= today
      })

      // ログインしている場合は、ユーザーの予約情報も取得
      if (session?.user?.dbId) {
        try {
          const reservationsResponse = await fetch('/api/reservations')
          const reservationsData = await reservationsResponse.json()

          if (reservationsResponse.ok && reservationsData.reservations) {
            // 予約情報をマップに変換（練習枠ID → 予約ID）
            const reservationMap = new Map<string, string>()
            reservationsData.reservations.forEach((reservation: Reservation) => {
              if (reservation.practiceSlot && reservation.practiceSlot.id) {
                reservationMap.set(reservation.practiceSlot.id, reservation.id)
              }
            })

            // 練習枠に予約情報を追加
            futureSlots = futureSlots.map((slot: PracticeSlot) => ({
              ...slot,
              isReserved: reservationMap.has(slot.id),
              reservationId: reservationMap.get(slot.id) || null,
            }))
          }
        } catch (reservationError) {
          console.error('予約情報の取得エラー:', reservationError)
          // 予約情報の取得に失敗しても、練習枠一覧は表示する
          futureSlots = futureSlots.map((slot: PracticeSlot) => ({
            ...slot,
            isReserved: false,
            reservationId: null,
          }))
        }
      } else {
        // ログインしていない場合は、予約情報なし
        futureSlots = futureSlots.map((slot: PracticeSlot) => ({
          ...slot,
          isReserved: false,
          reservationId: null,
        }))
      }

      setPracticeSlots(futureSlots)
    } catch (error) {
      console.error('練習枠一覧取得エラー:', error)
      setError(error instanceof Error ? error.message : '練習枠一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async (slotId: string) => {
    if (!session?.user?.dbId) {
      router.push('/login')
      return
    }

    if (!confirm('この練習枠を予約しますか？')) {
      return
    }

    try {
      setReservingSlotId(slotId)

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          practiceSlotId: slotId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '予約に失敗しました')
      }

      alert('予約が完了しました')
      // 一覧を再取得
      fetchPracticeSlots()
    } catch (error) {
      console.error('予約エラー:', error)
      alert(error instanceof Error ? error.message : '予約に失敗しました')
    } finally {
      setReservingSlotId(null)
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
        throw new Error(data.error || 'キャンセルに失敗しました')
      }

      alert('予約をキャンセルしました')
      // 一覧を再取得
      fetchPracticeSlots()
    } catch (error) {
      console.error('キャンセルエラー:', error)
      alert(error instanceof Error ? error.message : 'キャンセルに失敗しました')
    } finally {
      setCancellingReservationId(null)
    }
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
              練習一覧
            </h1>
            <p className="text-gray-600">
              予約可能な練習枠を確認できます
            </p>
          </div>
          <Link href="/member/reservations">
            <Button variant="outline">
              予約一覧を見る
            </Button>
          </Link>
        </div>

        {practiceSlots.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">現在、予約可能な練習枠がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceSlots.map((slot) => {
              const isAvailable = isSlotAvailable(slot)
              const remainingCapacity = getRemainingCapacity(slot)
              const isReserving = reservingSlotId === slot.id
              const isCancelling = cancellingReservationId === slot.reservationId
              const isReserved = slot.isReserved

              return (
                <div key={slot.id} className={`bg-white rounded-lg shadow-md p-6 ${isReserved ? 'border-2 border-green-500' : ''}`}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {formatSlotDate(slot.date)}
                      </h2>
                      {isReserved && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          予約済み
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {slot.startTime} 〜 {slot.endTime}
                    </p>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">定員:</span>
                      <span className="font-semibold">{slot.capacity}名</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">予約数:</span>
                      <span className="font-semibold">{slot.currentBookings}名</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">空き枠:</span>
                      <span className={`font-semibold ${remainingCapacity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {remainingCapacity}名
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ステータス:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${SlotStatusBadgeClasses[slot.status]}`}>
                        {SlotStatusLabels[slot.status]}
                      </span>
                    </div>
                  </div>

                  {slot.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">{slot.notes}</p>
                    </div>
                  )}

                  {isReserved ? (
                    <div className="space-y-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                        <p className="text-sm text-green-800 font-semibold text-center">
                          ✓ 予約済み
                        </p>
                      </div>
                      <Button
                        onClick={() => slot.reservationId && handleCancel(slot.reservationId)}
                        disabled={isCancelling}
                        variant="outline"
                        className="w-full"
                      >
                        {isCancelling ? 'キャンセル中...' : 'キャンセルする'}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleReserve(slot.id)}
                      disabled={!isAvailable || isReserving}
                      className="w-full"
                    >
                      {isReserving 
                        ? '予約中...' 
                        : isAvailable 
                          ? '予約する' 
                          : slot.status === 'FULL'
                            ? '満席'
                            : slot.status === 'CLOSED'
                              ? '受付終了'
                              : slot.status === 'CANCELLED'
                                ? '中止'
                                : '予約不可'}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
