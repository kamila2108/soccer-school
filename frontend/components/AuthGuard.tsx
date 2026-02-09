'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // セッション情報の読み込みが完了したら
    if (status === 'unauthenticated') {
      // ログインしていない場合、ログインページにリダイレクト
      router.push('/login')
    }
  }, [status, router])

  // セッション情報を読み込み中
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    )
  }

  // ログインしていない場合、何も表示しない（リダイレクト中）
  if (status === 'unauthenticated') {
    return null
  }

  // ログインしている場合、子コンポーネントを表示
  return <>{children}</>
}
