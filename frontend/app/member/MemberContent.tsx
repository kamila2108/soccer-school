'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Input from '@/components/Input'
import Button from '@/components/Button'

export default function MemberContent() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          会員情報
        </h1>

        {/* 基本情報表示 */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">基本情報</h2>
            <p className="text-gray-700">
              お名前: {session?.user?.name || '未設定'}
            </p>
            <p className="text-gray-700">
              メールアドレス: {session?.user?.email || '未設定'}
            </p>
            {session?.user?.lineUserId && (
              <p className="text-gray-700">
                LINEユーザーID: {session.user.lineUserId}
              </p>
            )}
          </div>
        </div>

        {/* 入会申込み状況へのリンク */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold mb-2">入会申込み</h2>
          <p className="text-gray-700 mb-4">
            入会申込みの状況を確認できます
          </p>
          <Link href="/member/applications">
            <Button className="w-full">
              申込み状況を確認する
            </Button>
          </Link>
        </div>

        {/* プロフィール編集フォーム（見た目のみ） */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold mb-2">プロフィール編集（見た目だけ）</h2>
          <form className="space-y-4">
            <Input
              label="お名前"
              name="name"
              defaultValue={session?.user?.name || ''}
              placeholder="山田 太郎"
            />
            <Input
              label="メールアドレス"
              name="email"
              type="email"
              defaultValue={session?.user?.email || ''}
              placeholder="example@example.com"
            />
            <Button onClick={() => alert('保存機能は後で実装します')}>
              保存（あとで実装）
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
