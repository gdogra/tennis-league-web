// src/components/Layout.tsx
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ─────────── Top-bar ─────────── */}
      <header className="bg-blue-700 text-white p-4 flex items-center space-x-6">
        {/* logo / home */}
        <Link href="/" className="font-semibold">
          Tennis League
        </Link>

        {/* nav links */}
        <nav className="flex-1 space-x-4">
          {isAdmin && (
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          )}
          {user && (
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
          )}
        </nav>

        {/* logout */}
        {user && (
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
          >
            Log out
          </button>
        )}
      </header>

      {/* ─────────── Page body ────────── */}
      <main className="flex-1 p-6">{children}</main>

      <footer className="text-center text-sm text-gray-500 py-4">
        © 2025 Tennis League
      </footer>
    </div>
  )
}

