# LINEログイン実装（2） 実装手順（初心者向け）

## 📚 このガイドについて

このガイドは、**2/6（金）: LINEログイン実装（2）**の作業を初心者の方でも理解できるように、**用語の説明**や**各ステップの詳細**を丁寧に記載しています。

**所要時間**: 約3〜4時間（初めての場合）

---

## 📖 用語集（最初に読んでおくと理解が深まります）

### 認証フローに関する用語

- **認証フロー**: ユーザーがログインするまでの一連の流れ。LINE認証 → コールバック → ユーザー登録/ログイン → セッション作成
- **コールバック**: LINE認証が完了した後、LINEからアプリケーションに戻ってくる処理
- **初回ログイン**: 初めてLINEログインするユーザー。データベースにユーザー情報を登録する必要があります
- **2回目以降のログイン**: 既に登録済みのユーザー。データベースからユーザー情報を取得してログインします
- **セッション**: ログイン状態を保持する仕組み。ユーザーがログインしている間、セッション情報が保存されます
- **認証ガード**: ログインしていないユーザーが特定のページにアクセスできないようにする仕組み

### NextAuth.jsに関する用語

- **signIn**: ログイン処理を開始する関数
- **signOut**: ログアウト処理を実行する関数
- **auth**: サーバー側でセッション情報を取得する関数
- **useSession**: クライアント側でセッション情報を取得するフック（React Hooks）

---

## 📋 今日（2/6）の作業内容

開発スケジュールの「2/6（金）: LINEログイン実装（2）」を完了するためのステップバイステップガイドです。

**目標**: LINEログインが動作し、ユーザー登録・ログインができる状態にする

**作成・更新するもの**:
1. ログインページの実装（LINEログインボタンの動作）
2. NextAuth.jsのコールバック処理の実装（ユーザー登録・ログイン処理）
3. セッション管理の実装（ログイン状態の確認）
4. 認証ガードの実装（保護されたページの作成）

---

## ✅ ステップ1: ログインページの実装

### 1-1. ログインページとは？

**ログインページ**: ユーザーがLINEログインを開始するページです。LINEログインボタンをクリックすると、LINE認証画面に移動します。

**現在の状態**: ログインページは存在しますが、ボタンが動作していません。このステップで、ボタンをクリックするとLINEログインが開始されるようにします。

---

### 1-2. ログインページの更新

**目的**: LINEログインボタンをクリックすると、LINE認証が開始されるようにします。

**手順**:

1. **ログインページファイルを開く**
   - `frontend/app/login/page.tsx` を開く

2. **既存のコードを確認**
   - 現在はボタンが表示されているだけで、クリックしても何も起こりません

3. **以下のコードに置き換える**

```typescript
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
```

**コードの説明**:
- `'use client'`: クライアントコンポーネントであることを示す（Next.js App Routerの新しい書き方）
- `import { signIn } from 'next-auth/react'`: NextAuth.jsの`signIn`関数をインポート
- `handleLineLogin`: ボタンクリック時に実行される関数
- `signIn('line', { callbackUrl: '/' })`: LINEログインを開始し、ログイン後にトップページ（`/`）にリダイレクト
- `onClick={handleLineLogin}`: ボタンクリック時に`handleLineLogin`関数を実行

**現在の状態**: ✅ ログインページが更新され、LINEログインボタンが動作するようになりました

---

### 1-3. NextAuth.jsのクライアント側設定

**目的**: クライアント側でNextAuth.jsを使えるようにするため、SessionProviderを設定します。

**手順**:

1. **レイアウトファイルを開く**
   - `frontend/app/layout.tsx` を開く

2. **既存のコードを確認**
   - 現在のレイアウトファイルの内容を確認

3. **SessionProviderを追加**

まず、ファイルの内容を確認します：

```typescript
// 既存のlayout.tsxの内容を確認
```

4. **SessionProviderをインポートして追加**

レイアウトファイルに以下のように追加します：

```typescript
import { SessionProvider } from 'next-auth/react'
import { auth } from './api/auth/[...nextauth]/route'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="ja">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

**⚠️ 注意**: NextAuth.js v5では、SessionProviderの使い方が異なります。上記の方法がうまくいかない場合は、以下の方法を使用してください：

**代替方法（推奨）**:

1. **新しいコンポーネントファイルを作成**
   - `frontend/components/Providers.tsx` を作成

2. **以下のコードを追加**

```typescript
'use client'

import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

3. **レイアウトファイルを更新**

`frontend/app/layout.tsx`を開き、Providersコンポーネントでラップします：

```typescript
import Providers from '@/components/Providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**現在の状態**: ✅ SessionProviderが設定され、クライアント側でNextAuth.jsが使えるようになりました

---

## ✅ ステップ2: コールバック処理の実装

### 2-1. コールバック処理とは？

**コールバック処理**: LINE認証が完了した後、LINEからアプリケーションに戻ってきた時に実行される処理です。

**処理の流れ**:
1. ユーザーがLINEログインボタンをクリック
2. LINE認証画面に移動
3. ユーザーがLINEで認証
4. LINEからコールバックURLにリダイレクト
5. **コールバック処理が実行される**（ここでユーザー登録・ログイン処理を行う）

---

### 2-2. ユーザー登録処理の実装

**目的**: 初回ログイン時に、データベースにユーザー情報を登録します。

**手順**:

1. **NextAuth.jsの設定ファイルを開く**
   - `frontend/app/api/auth/[...nextauth]/route.ts` を開く

2. **既存のコードを確認**
   - 現在の設定ファイルの内容を確認

3. **Supabaseクライアントをインポート**
   - ファイルの先頭に以下を追加：

```typescript
import { supabase } from '@/lib/supabase'
```

4. **コールバック処理を追加**

既存の`callbacks`セクションを更新します：

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // LINE認証が成功した時の処理
    if (account?.provider === 'line' && account.providerAccountId) {
      try {
        // データベースから既存ユーザーを検索
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('line_user_id', account.providerAccountId)
          .single()

        // ユーザーが存在しない場合（初回ログイン）、新規登録
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              line_user_id: account.providerAccountId,
              name: user.name || profile?.name || 'ユーザー',
              email: user.email || profile?.email || null,
              profile_image: user.image || profile?.picture || null,
            })

          if (insertError) {
            console.error('ユーザー登録エラー:', insertError)
            return false // ログインを拒否
          }
        }
      } catch (error) {
        console.error('ログイン処理エラー:', error)
        return false // ログインを拒否
      }
    }
    return true // ログインを許可
  },
  async session({ session, token }) {
    // セッション情報にLINEユーザーIDとデータベースのユーザーIDを追加
    if (token.sub) {
      session.user.id = token.sub
      
      // データベースからユーザー情報を取得
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id, line_user_id, name, email')
          .eq('line_user_id', token.sub)
          .single()

        if (userData) {
          session.user.dbId = userData.id // データベースのユーザーID
          session.user.lineUserId = userData.line_user_id // LINEユーザーID
        }
      } catch (error) {
        console.error('ユーザー情報取得エラー:', error)
      }
    }
    return session
  },
  async jwt({ token, account, profile }) {
    // 初回ログイン時にLINEユーザーIDを保存
    if (account && profile) {
      token.sub = profile.sub || account.providerAccountId
    }
    return token
  },
},
```

**コードの説明**:
- `signIn`コールバック: LINE認証が成功した時に実行される
- `existingUser`: データベースから既存ユーザーを検索
- `insert`: ユーザーが存在しない場合、新規登録
- `session`コールバック: セッション情報にデータベースのユーザーIDを追加
- `jwt`コールバック: JWTトークンにLINEユーザーIDを保存

**現在の状態**: ✅ コールバック処理が実装され、初回ログイン時にユーザー登録が行われます

---

### 2-3. 型定義の追加（TypeScript用）

**目的**: TypeScriptで型エラーを防ぐため、セッションの型を拡張します。

**手順**:

1. **型定義ファイルを作成**
   - `frontend/types/next-auth.d.ts` を作成

2. **以下のコードを追加**

```typescript
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      dbId?: string
      lineUserId?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
```

**コードの説明**:
- `declare module 'next-auth'`: NextAuth.jsの型定義を拡張
- `Session`: セッションの型を拡張して、`dbId`と`lineUserId`を追加

**現在の状態**: ✅ TypeScriptの型エラーが解消されました

---

## ✅ ステップ3: セッション管理の実装

### 3-1. セッション管理とは？

**セッション管理**: ユーザーがログインしているかどうかを確認し、ログイン状態を保持する仕組みです。

**用途**:
- ログインしているユーザーの情報を表示
- ログインしていないユーザーにログインページを表示
- ログアウト機能の実装

---

### 3-2. ヘッダーコンポーネントの更新

**目的**: ログイン状態に応じて、ヘッダーに「ログイン」ボタンまたは「ログアウト」ボタンを表示します。

**手順**:

1. **ヘッダーコンポーネントを開く**
   - `frontend/components/Header.tsx` を開く

2. **既存のコードを確認**
   - 現在は常に「ログイン」ボタンが表示されています

3. **以下のコードに更新**

```typescript
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
```

**コードの説明**:
- `useSession`: NextAuth.jsのフックで、セッション情報を取得
- `status === 'loading'`: セッション情報を読み込み中
- `session`: ログインしている場合はセッション情報が入る
- `signOut`: ログアウト処理を実行

**現在の状態**: ✅ ヘッダーがログイン状態に応じて表示が変わるようになりました

---

## ✅ ステップ4: 認証ガードの実装

### 4-1. 認証ガードとは？

**認証ガード**: ログインしていないユーザーが特定のページにアクセスできないようにする仕組みです。

**用途**:
- 会員専用ページの保護
- 予約ページや入会申込みページの保護
- 管理者ページの保護

---

### 4-2. 認証ガードコンポーネントの作成

**目的**: ログインしていないユーザーをログインページにリダイレクトするコンポーネントを作成します。

**手順**:

1. **認証ガードコンポーネントを作成**
   - `frontend/components/AuthGuard.tsx` を作成

2. **以下のコードを追加**

```typescript
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
```

**コードの説明**:
- `useSession`: セッション情報を取得
- `useRouter`: Next.jsのルーターを使用してリダイレクト
- `useEffect`: セッション状態が変わった時に実行される
- `status === 'unauthenticated'`: ログインしていない場合
- `router.push('/login')`: ログインページにリダイレクト

**現在の状態**: ✅ 認証ガードコンポーネントが作成されました

---

### 4-3. 保護されたページの作成例

**目的**: 認証ガードを使って、会員専用ページを作成します。

**手順**:

1. **会員専用ページを作成**
   - `frontend/app/member/page.tsx` を作成（例）

2. **以下のコードを追加**

```typescript
import AuthGuard from '@/components/AuthGuard'
import { useSession } from 'next-auth/react'

export default function MemberPage() {
  return (
    <AuthGuard>
      <MemberContent />
    </AuthGuard>
  )
}

function MemberContent() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">会員専用ページ</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">ようこそ、{session?.user?.name || 'ユーザー'}さん</h2>
          <p className="text-gray-600">
            このページは会員専用です。ログインしているユーザーのみアクセスできます。
          </p>
        </div>
      </div>
    </div>
  )
}
```

**コードの説明**:
- `AuthGuard`: 認証ガードコンポーネントでラップすることで、ログインしていないユーザーはアクセスできない
- `MemberContent`: 実際のページ内容を表示するコンポーネント

**現在の状態**: ✅ 保護されたページが作成されました

---

### 4-4. サーバー側での認証チェック（オプション）

**目的**: サーバー側でも認証チェックを行い、より安全にページを保護します。

**手順**:

1. **サーバーコンポーネントで認証チェック**

```typescript
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth()

  // ログインしていない場合、ログインページにリダイレクト
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">保護されたページ</h1>
        <p className="text-gray-600">
          ようこそ、{session.user?.name || 'ユーザー'}さん
        </p>
      </div>
    </div>
  )
}
```

**コードの説明**:
- `auth`: サーバー側でセッション情報を取得する関数
- `redirect`: Next.jsの関数で、指定したページにリダイレクト

**現在の状態**: ✅ サーバー側での認証チェックが実装されました

---

## ✅ ステップ5: 動作確認

### 5-1. 開発サーバーの起動

**手順**:

1. **開発サーバーを起動**
   ```bash
   cd frontend
   npm run dev
   ```

2. **起動を確認**
   - `- Local: http://localhost:3000` と表示されれば成功

---

### 5-2. ログインフローの確認

**手順**:

1. **ログインページにアクセス**
   - ブラウザで `http://localhost:3000/login` にアクセス

2. **LINEログインボタンをクリック**
   - 「LINEでログイン」ボタンをクリック

3. **LINE認証画面が表示されることを確認**
   - LINEの認証画面にリダイレクトされることを確認

4. **LINEで認証**
   - LINEアカウントでログイン

5. **コールバック処理の確認**
   - 認証後、アプリケーションに戻ってくることを確認
   - トップページ（`/`）にリダイレクトされることを確認

6. **ヘッダーの確認**
   - ヘッダーに「ログアウト」ボタンが表示されることを確認
   - ユーザー名が表示されることを確認

---

### 5-3. ユーザー登録の確認

**手順**:

1. **Supabaseでユーザー情報を確認**
   - Supabaseのダッシュボードにアクセス
   - `users`テーブルを開く
   - 新しく登録されたユーザー情報が表示されることを確認

2. **2回目のログインをテスト**
   - ログアウト
   - 再度ログイン
   - 既存ユーザーとしてログインできることを確認（新規登録されないことを確認）

---

### 5-4. 認証ガードの確認

**手順**:

1. **ログアウト状態で保護されたページにアクセス**
   - ログアウト状態で `http://localhost:3000/member` にアクセス（例）
   - ログインページにリダイレクトされることを確認

2. **ログイン状態で保護されたページにアクセス**
   - ログイン状態で `http://localhost:3000/member` にアクセス
   - ページが表示されることを確認

---

## ✅ 完了チェックリスト

以下の項目を確認して、すべて完了したらLINEログイン実装（2）が完了です！

- [ ] ログインページが更新され、LINEログインボタンが動作する
- [ ] SessionProviderが設定されている
- [ ] コールバック処理が実装されている（初回ログイン時のユーザー登録）
- [ ] 2回目以降のログインが動作する（既存ユーザーとしてログイン）
- [ ] ヘッダーがログイン状態に応じて表示が変わる
- [ ] ログアウト機能が動作する
- [ ] 認証ガードコンポーネントが作成されている
- [ ] 保護されたページが作成されている（オプション）
- [ ] 動作確認が完了している

---

## 📝 次のステップ

次回（2/7）の作業内容：
- レスポンシブデザインの実装
- 共通コンポーネントの作成
- レイアウトコンポーネントの作成

詳細は `開発スケジュール.md` を参照してください。

---

## ⚠️ トラブルシューティング

### エラー1: signIn is not a function

**エラーメッセージ例**:
```
TypeError: signIn is not a function
```

**原因**: `next-auth/react`から`signIn`をインポートしていない、またはSessionProviderが設定されていない。

**解決方法**:

1. **インポートを確認**
   ```typescript
   import { signIn } from 'next-auth/react'
   ```

2. **SessionProviderが設定されているか確認**
   - `frontend/app/layout.tsx`または`frontend/components/Providers.tsx`でSessionProviderが設定されているか確認

---

### エラー2: useSession must be used within a SessionProvider

**エラーメッセージ例**:
```
Error: useSession must be used within a SessionProvider
```

**原因**: SessionProviderが設定されていない、または`useSession`を使っているコンポーネントがSessionProviderの外にある。

**解決方法**:

1. **SessionProviderを設定**
   - ステップ1-3を参照して、SessionProviderを設定してください

2. **コンポーネントの配置を確認**
   - `useSession`を使っているコンポーネントがSessionProviderの子要素になっているか確認

---

### エラー3: ユーザー登録が失敗する

**エラーメッセージ例**:
```
ユーザー登録エラー: ...
```

**原因**: データベースの`users`テーブルが存在しない、またはカラム名が間違っている。

**解決方法**:

1. **データベーステーブルを確認**
   - Supabaseのダッシュボードで`users`テーブルが存在するか確認
   - カラム名が正しいか確認（`line_user_id`, `name`, `email`, `profile_image`）

2. **エラーログを確認**
   - ターミナルに表示されるエラーメッセージを確認
   - どのカラムが問題か確認

---

### エラー4: コールバック処理が実行されない

**原因**: NextAuth.jsの設定ファイルの`signIn`コールバックが正しく設定されていない。

**解決方法**:

1. **設定ファイルを確認**
   - `frontend/app/api/auth/[...nextauth]/route.ts`を開く
   - `callbacks`セクションに`signIn`コールバックが追加されているか確認

2. **コールバックの戻り値を確認**
   - `signIn`コールバックは`true`を返す必要があります（ログインを許可する場合）

---

### エラー5: セッション情報が取得できない

**原因**: セッション情報が正しく保存されていない、または型定義が間違っている。

**解決方法**:

1. **型定義ファイルを確認**
   - `frontend/types/next-auth.d.ts`が作成されているか確認
   - 型定義が正しいか確認

2. **セッション情報を確認**
   - ブラウザの開発者ツールでセッション情報を確認
   - `localStorage`や`sessionStorage`にセッション情報が保存されているか確認

---

## 💡 よくある質問（FAQ）

### Q1: ログイン後、どのページにリダイレクトされますか？

**A**: ログインページの`signIn`関数で`callbackUrl`を指定できます。

```typescript
await signIn('line', { callbackUrl: '/member' })
```

指定しない場合、デフォルトでトップページ（`/`）にリダイレクトされます。

---

### Q2: ログアウト後、どのページにリダイレクトされますか？

**A**: `signOut`関数で`callbackUrl`を指定できます。

```typescript
await signOut({ callbackUrl: '/' })
```

指定しない場合、デフォルトでトップページ（`/`）にリダイレクトされます。

---

### Q3: セッション情報はどこに保存されますか？

**A**: NextAuth.jsはデフォルトでJWT（JSON Web Token）を使用してセッション情報を保存します。セッション情報は暗号化されて、クライアント側のCookieに保存されます。

---

### Q4: ユーザー情報を更新したい場合は？

**A**: データベースの`users`テーブルを直接更新するか、ユーザー情報編集ページを作成してください。

---

### Q5: 複数のページを保護したい場合は？

**A**: 各ページで`AuthGuard`コンポーネントを使用するか、ミドルウェアを作成して複数のページを一度に保護できます。

---

## 📞 参考リンク

- **NextAuth.js公式ドキュメント**: https://next-auth.js.org/
- **NextAuth.js v5（Beta）ドキュメント**: https://authjs.dev/
- **LINE Login公式ドキュメント**: https://developers.line.biz/ja/docs/line-login/
- **Supabase公式ドキュメント**: https://supabase.com/docs

---

**最終更新**: 2024年2月6日  
**対象**: プログラミング初心者の方
