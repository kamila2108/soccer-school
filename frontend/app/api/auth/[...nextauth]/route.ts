import NextAuth from 'next-auth'
import LineProvider from 'next-auth/providers/line'
import { supabase } from '@/lib/supabase'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID || '',
      clientSecret: process.env.LINE_CHANNEL_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // LINE認証が成功した時の処理
      if (account?.provider === 'line' && account.providerAccountId) {
        try {
          console.log('LINE認証成功:', {
            providerAccountId: account.providerAccountId,
            userName: user.name,
          })

          // データベースから既存ユーザーを検索
          const { data: existingUser, error: selectError } = await supabase
            .from('users')
            .select('id')
            .eq('line_user_id', account.providerAccountId)
            .maybeSingle() // single()の代わりにmaybeSingle()を使用（データが見つからない場合もエラーにならない）
  
          // エラーが発生した場合（テーブルが存在しない、接続エラーなど）
          if (selectError) {
            console.error('ユーザー検索エラー:', selectError)
            // エラーが発生してもログインは許可する（データベースの問題でログインを拒否しない）
            return true
          }
  
          // ユーザーが存在しない場合（初回ログイン）、新規登録
          if (!existingUser) {
            console.log('新規ユーザーを登録します')
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
              // ユーザー登録に失敗してもログインは許可する（後で手動で登録できる）
              // ただし、重要なエラーの場合はfalseを返すことも検討
              return true
            }
            console.log('ユーザー登録成功')
          } else {
            console.log('既存ユーザーとしてログイン')
          }
        } catch (error) {
          console.error('ログイン処理エラー（予期しないエラー）:', error)
          // 予期しないエラーが発生しても、ログインは許可する
          // データベースの問題でログインを完全に拒否しない
          return true
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
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, line_user_id, name, email')
            .eq('line_user_id', token.sub)
            .maybeSingle()
  
          if (userError) {
            console.error('ユーザー情報取得エラー:', userError)
          } else if (userData) {
            session.user.dbId = userData.id // データベースのユーザーID
            session.user.lineUserId = userData.line_user_id // LINEユーザーID
            console.log('セッションにユーザー情報を設定:', {
              dbId: userData.id,
              lineUserId: userData.line_user_id,
            })
          } else {
            console.warn('ユーザー情報が見つかりませんでした。line_user_id:', token.sub)
          }
        } catch (error) {
          console.error('ユーザー情報取得エラー（予期しないエラー）:', error)
        }
      } else {
        console.warn('token.subが存在しません')
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
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export const { GET, POST } = handlers