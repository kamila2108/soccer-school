import AuthGuard from '@/components/AuthGuard'
import MyApplicationsContent from './MyApplicationsContent'

export default function MyApplicationsPage() {
  return (
    <AuthGuard>
      <MyApplicationsContent />
    </AuthGuard>
  )
}
