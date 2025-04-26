import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading, logout, user } = useAuth();

  if (loading) return <div className="p-10">Loading…</div>;
  if (!isAdmin) return <div className="p-10 text-red-600">Not authorized</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="bg-blue-700 text-white p-4 flex items-center space-x-6">
        <nav className="flex-1 space-x-4">
          <Link href="/admin" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/users" className="hover:underline">
            User Management
          </Link>
          <Link href="/admin/matches" className="hover:underline">
            Match Approvals
          </Link>
          <Link href="/profile" className="hover:underline">
            Profile
          </Link>
        </nav>

        {/* current user + logout */}
        <span className="hidden sm:inline text-sm opacity-80">
          {user?.email}
        </span>
        <button
          onClick={logout}
          className="ml-3 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
        >
          Log out
        </button>
      </header>

      {/* ── page body ────────────────────────────────────────────── */}
      <main className="p-6">{children}</main>
    </div>
  );
}
