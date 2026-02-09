'use client'

import { signIn } from 'next-auth/react'

export default function Login() {
  const handleLineLogin = async () => {
    try {
      // LINEログインを開始
      await signIn('line', { callbackUrl: '/' })
    } catch (error) {
      console.error('ログインエラー:', error)
      alert('ログインに失敗しました。もう一度お試しください。')
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          ログイン
        </h1>
        
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4">
            LINEアカウントでログインしてください
          </p>
          <button 
            onClick={handleLineLogin}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            LINEでログイン
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>ログインすると、予約や入会申込みができるようになります。</p>
        </div>
      </div>
    </div>
  )
}