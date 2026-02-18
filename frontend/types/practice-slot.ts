/**
 * 練習枠データモデルの型定義
 * 時間予約機能で使用する練習枠のデータ構造を定義します
 */

// 練習枠のステータス
export type SlotStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED'

// 練習枠のデータ型
export type PracticeSlot = {
  id: string
  date: string // 練習日（ISO 8601形式: YYYY-MM-DD）
  startTime: string // 開始時間（HH:MM形式）
  endTime: string // 終了時間（HH:MM形式）
  capacity: number // 定員
  currentBookings: number // 現在の予約数
  status: SlotStatus // ステータス
  notes: string | null // 備考
  createdAt: string // 作成日時
  updatedAt: string // 更新日時
}

// 練習枠作成時の入力データ型
export type CreatePracticeSlotInput = {
  date: string // 練習日（YYYY-MM-DD形式）
  startTime: string // 開始時間（HH:MM形式）
  endTime: string // 終了時間（HH:MM形式）
  capacity: number // 定員
  notes?: string // 備考（任意）
}

// 練習枠更新時の入力データ型
export type UpdatePracticeSlotInput = {
  date?: string
  startTime?: string
  endTime?: string
  capacity?: number
  status?: SlotStatus
  notes?: string | null
}

// 練習枠一覧取得時のフィルター
export type PracticeSlotFilter = {
  dateFrom?: string // 開始日（YYYY-MM-DD形式）
  dateTo?: string // 終了日（YYYY-MM-DD形式）
  status?: SlotStatus // ステータスでフィルター
}

// ステータスの日本語ラベル
export const SlotStatusLabels: Record<SlotStatus, string> = {
  OPEN: '受付中',
  FULL: '満席',
  CLOSED: '受付終了',
  CANCELLED: '中止',
}

// ステータスのバッジ用クラス名
export const SlotStatusBadgeClasses: Record<SlotStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  FULL: 'bg-red-100 text-red-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-yellow-100 text-yellow-800',
}

// 練習枠が予約可能かどうかを判定
export function isSlotAvailable(slot: PracticeSlot): boolean {
  return (
    slot.status === 'OPEN' &&
    slot.currentBookings < slot.capacity
  )
}

// 残り定員数を計算
export function getRemainingCapacity(slot: PracticeSlot): number {
  return Math.max(0, slot.capacity - slot.currentBookings)
}

// 練習枠の日時をフォーマット
export function formatSlotDateTime(slot: PracticeSlot): string {
  const date = new Date(slot.date)
  const dateStr = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  return `${dateStr} ${slot.startTime}〜${slot.endTime}`
}

// 練習枠の日付のみをフォーマット
export function formatSlotDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}
