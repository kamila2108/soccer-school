'use client'

import { useState } from 'react'
import Input from '@/components/Input'
import Button from '@/components/Button'

type FormValues = {
  childName: string
  childFurigana: string
  grade: string
  parentName: string
  email: string
  phone: string
  note: string
}

export default function EntryPage() {
  const [form, setForm] = useState<FormValues>({
    childName: '',
    childFurigana: '',
    grade: '',
    parentName: '',
    email: '',
    phone: '',
    note: '',
  })

  // バリデーション用のエラーメッセージ（次のステップで使います）
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  
  // 5-1: 画面モード用の状態を追加
  const [isConfirmMode, setIsConfirmMode] = useState(false)

  const handleChange = (field: keyof FormValues, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 4-1: バリデーション関数を作る
  const validate = (values: FormValues) => {
    const newErrors: Partial<Record<keyof FormValues, string>> = {}

    if (!values.childName.trim()) {
      newErrors.childName = 'お子さまの氏名は必須です'
    }

    if (!values.childFurigana.trim()) {
      newErrors.childFurigana = 'フリガナは必須です'
    }

    if (!values.grade) {
      newErrors.grade = '学年を選択してください'
    }

    if (!values.email.trim()) {
      newErrors.email = 'メールアドレスは必須です'
    } else if (!values.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'メールアドレスの形式が正しくありません'
    }

    if (!values.phone.trim()) {
      newErrors.phone = '電話番号は必須です'
    }

    return newErrors
  }

  // 4-2: フォーム送信時にバリデーションを実行する
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validate(form)
    setErrors(validationErrors)

    // エラーが1つもなければ、次のステップ（確認画面表示）に進む
    if (Object.keys(validationErrors).length === 0) {
      // エラーがなければ確認画面に切り替え
      setIsConfirmMode(true)
    }
  }

  // 5-2: 「戻る」ボタン用のハンドラ
  const handleBack = () => {
    setIsConfirmMode(false)
  }

  // 2-3: 送信処理の状態を追加
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // 2-3: 送信処理の関数を追加
  const handleSubmitApplication = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // API Routeを呼び出してデータベースに保存
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childName: form.childName,
          childFurigana: form.childFurigana,
          grade: form.grade,
          parentName: form.parentName,
          email: form.email,
          phone: form.phone,
          note: form.note,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || '申込みの保存に失敗しました'
        throw new Error(errorMessage)
      }

      // 成功した場合、申込み完了画面に遷移
      window.location.href = `/entry/complete?id=${data.applicationId}`
    } catch (error) {
      console.error('申込みエラー:', error)
      setSubmitError(error instanceof Error ? error.message : '申込みの保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          入会申込みフォーム
        </h1>
        <p className="text-gray-600">
          必要事項をご入力のうえ、「確認へ進む」ボタンを押してください。
        </p>

        {!isConfirmMode ? (
          // 入力フォームモード
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="お子さまの氏名（必須）"
              name="childName"
              value={form.childName}
              onChange={(e) => handleChange('childName', e.target.value)}
              placeholder="山田 太郎"
              error={errors.childName}
            />

            <Input
              label="お子さまのフリガナ（必須）"
              name="childFurigana"
              value={form.childFurigana}
              onChange={(e) => handleChange('childFurigana', e.target.value)}
              placeholder="ヤマダ タロウ"
              error={errors.childFurigana}
            />

            {/* 学年（セレクトボックス） */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                学年（必須）
              </label>
              <select
                className={`
                  block w-full rounded-md border px-3 py-2 shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  ${errors.grade ? 'border-red-500' : 'border-gray-300'}
                `}
                value={form.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="小1">小1</option>
                <option value="小2">小2</option>
                <option value="小3">小3</option>
                <option value="小4">小4</option>
                <option value="小5">小5</option>
                <option value="小6">小6</option>
              </select>
              {errors.grade && (
                <p className="text-xs text-red-500">{errors.grade}</p>
              )}
            </div>

            <Input
              label="保護者氏名"
              name="parentName"
              value={form.parentName}
              onChange={(e) => handleChange('parentName', e.target.value)}
              placeholder="山田 花子"
              error={errors.parentName}
            />

            <Input
              label="メールアドレス（必須）"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="example@example.com"
              error={errors.email}
            />

            <Input
              label="電話番号（必須）"
              name="phone"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="090-1234-5678"
              error={errors.phone}
            />

            {/* その他・ご質問など（テキストエリア） */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                その他・ご質問など（任意）
              </label>
              <textarea
                className="
                  block w-full rounded-md border px-3 py-2 shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  border-gray-300
                "
                rows={4}
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="ご希望の曜日やご質問などがあればご記入ください。"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">
                確認へ進む
              </Button>
            </div>
          </form>
        ) : (
          // 確認画面モード
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                入力内容の確認
              </h2>
              <p className="text-gray-600 text-sm">
                以下の内容でよろしければ「この内容で申込む」を押してください。
                修正する場合は「入力に戻る」を押してください。
              </p>
            </div>

            <div className="space-y-4">
              <ConfirmRow label="お子さまの氏名" value={form.childName} />
              <ConfirmRow label="お子さまのフリガナ" value={form.childFurigana} />
              <ConfirmRow label="学年" value={form.grade} />
              <ConfirmRow label="保護者氏名" value={form.parentName || '（未入力）'} />
              <ConfirmRow label="メールアドレス" value={form.email} />
              <ConfirmRow label="電話番号" value={form.phone} />
              <ConfirmRow label="その他・ご質問など" value={form.note || '（未入力）'} />
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full md:w-1/2"
                onClick={handleBack}
              >
                入力に戻る
              </Button>
              <Button
                type="button"
                className="w-full md:w-1/2"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
              >
                {isSubmitting ? '送信中...' : 'この内容で申込む'}
              </Button>
              {submitError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 5-3: 確認画面用のコンポーネント
type ConfirmRowProps = {
  label: string
  value: string
}

function ConfirmRow({ label, value }: ConfirmRowProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-4 border-b border-gray-100 pb-3">
      <div className="w-full md:w-1/3 text-sm font-medium text-gray-600">
        {label}
      </div>
      <div className="w-full md:w-2/3 text-gray-900 whitespace-pre-wrap">
        {value}
      </div>
    </div>
  )
}