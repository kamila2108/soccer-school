import AuthGuard from '@/components/AuthGuard'
import MemberContent from './MemberContent'

export default function MemberPage() {
  return (
    <AuthGuard>
      <MemberContent />
    </AuthGuard>
  )
}