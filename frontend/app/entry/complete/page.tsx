'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'

function EntryCompleteContent() {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('id')
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 申込みIDが取得できた場合、申込み情報を取得（オプション）
    if (applicationId) {
      // ここでは申込みIDを表示するだけでもOK
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [applicationId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            入会申込みが完了しました
          </h1>
          <p className="text-gray-600 mb-6">
            お申込みありがとうございます。内容を確認のうえ、ご連絡させていただきます。
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            申込み内容
          </h2>
          {applicationId && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">申込みID</span>
                <span className="font-mono text-sm text-gray-900">
                  {applicationId}
                </span>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-600 mt-4">
            ※ 申込みIDは、お問い合わせの際にお伝えください。
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>次のステップ</strong>
            <br />
            申込み内容を確認後、メールまたは電話にてご連絡させていただきます。
            承認が完了しましたら、入会手続きのご案内をお送りします。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full">
              ホームに戻る
            </Button>
          </Link>
          <Link href="/entry" className="flex-1">
            <Button className="w-full">
              もう一度申込む
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function EntryCompletePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    }>
      <EntryCompleteContent />
    </Suspense>
  )
}
