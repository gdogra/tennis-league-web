// src/components/Layout.tsx
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout, hasUnreadNotifications } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-blue-700 text-white p-4 flex items-center space-x-6">
        <Link href="/" className="font-semibold">
          Tennis League
        </Link>

        <nav className="flex-1 space-x-4 relative">
          {isAdmin && (
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          )}
          {user && (
            <>
              <Link href="/matches" className="hover:underline">My Matches</Link>
              <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
              <Link href="/notifications" className="hover:underline relative inline-block">
                Notifications
                {hasUnreadNotifications && (
                  <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full ml-1"></span>
                )}
              </Link>
              <Link href="/profile" className="hover:underline">Profile</Link>
            </>
          )}
        </nav>

        {user && (
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
          >
            Log out
          </button>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 p-6">{children}</main>

      <footer className="text-center text-sm text-gray-500 py-4">
        © 2025 Tennis League
      </footer>
    </div>
  )
}

