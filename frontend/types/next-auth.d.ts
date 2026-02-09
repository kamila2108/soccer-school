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
