'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="text-2xl font-bold text-green-600">
            ⚽ サッカー教室
          </Link>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-green-600 transition">
              ホーム
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600 transition">
              教室について
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 transition">
              お問い合わせ
            </Link>
            
            {/* ログイン状態に応じてボタンを表示 */}
            {status === 'loading' ? (
              <div className="text-gray-500">読み込み中...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {session.user?.name || 'ユーザー'}さん
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                ログイン
              </Link>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニュー"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link 
              href="/" 
              className="block py-2 text-gray-700 hover:text-green-600"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            <Link 
              href="/about" 
              className="block py-2 text-gray-700 hover:text-green-600"
              onClick={() => setIsMenuOpen(false)}
            >
              教室について
            </Link>
            <Link 
              href="/contact" 
              className="block py-2 text-gray-700 hover:text-green-600"
              onClick={() => setIsMenuOpen(false)}
            >
              お問い合わせ
            </Link>
            
            {/* ログイン状態に応じてボタンを表示 */}
            {status === 'loading' ? (
              <div className="text-gray-500 py-2">読み込み中...</div>
            ) : session ? (
              <div className="space-y-2">
                <div className="text-gray-700 py-2">
                  {session.user?.name || 'ユーザー'}さん
                </div>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="block py-2 bg-green-600 text-white rounded-lg text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                ログイン
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}