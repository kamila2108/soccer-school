import AuthGuard from '@/components/AuthGuard'
import ApplicationDetailContent from './ApplicationDetailContent'

export default function MyApplicationDetailPage() {
  return (
    <AuthGuard>
      <ApplicationDetailContent />
    </AuthGuard>
  )
}
