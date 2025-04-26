import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user, role, loading } = useAuth()

  if (loading) return (
    <Layout>
      <div className="text-center py-20">Loading…</div>
    </Layout>
  )

  if (!user) return (
    <Layout>
      <div className="text-center py-20">Not signed in.</div>
    </Layout>
  )

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="max-w-md space-y-4">
        <div className="p-4 bg-white rounded shadow">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Display&nbsp;Name:</strong> {user.displayName || '—'}</p>
          <p><strong>Role:</strong> {role}</p>
        </div>
      </div>
    </Layout>
  )
}

