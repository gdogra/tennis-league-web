// src/pages/admin/users.tsx

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import { useQuery } from "react-query";
import { auth } from "../../lib/firebase";

type UserRecord = {
  id: string;
  email: string;
  displayName?: string;
  role: string;
};

// This helper will retry internally until auth.currentUser is non-null
async function fetchUsers(): Promise<UserRecord[]> {
  const me = auth.currentUser;
  if (!me) {
    throw new Error("Not authenticated yet");
  }
  const token = await me.getIdToken();
  const res = await fetch("/api/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  const json = await res.json();
  return json.users;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  // redirect non-admins
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAdmin, router]);

  // only run once we have a signed-in admin
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery<UserRecord[]>("admin-users", fetchUsers, {
    enabled: !!user && !loading && isAdmin,
  });

  // show checking buffer
  if (loading || !isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-20">Checking permissions…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <p>Loading users…</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Display Name</th>
              <th className="p-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users!.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.displayName || "—"}</td>
                <td className="p-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
