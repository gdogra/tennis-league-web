// src/pages/admin/users.tsx
import { useState } from 'react'
import { NextPage } from 'next'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from 'react-query'
import AdminLayout from '../../components/AdminLayout'

type Role = 'admin' | 'user'
type UserRow = { id: string; email: string; displayName: string | null; role: Role }

// ── helper to fetch w/ caller’s Firebase ID-token ────────────────────────
const withToken = async <T,>(cb: (token: string) => Promise<T>) => {
  const token = await (window as any).auth.currentUser.getIdToken()
  return cb(token)
}

// list
const fetchUsers = () =>
  withToken(async (token) => {
    const r = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!r.ok) throw new Error((await r.json()).error || 'Fetch failed')
    return (await r.json()).users as UserRow[]
  })

// invite
const inviteUser = (p: {
  email: string
  displayName: string
  role: Role
}) =>
  withToken(async (token) => {
    const r = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(p),
    })
    if (!r.ok) throw new Error((await r.json()).error || 'Invite failed')
    return r.json()
  })

// toggle role
const setRole = (uid: string, role: Role) =>
  withToken(async (token) => {
    const r = await fetch(`/api/admin/users/${uid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    })
    if (!r.ok) throw new Error((await r.json()).error || 'Role update failed')
    return r.json()
  })

// reset-pw
const resetPw = (uid: string) =>
  withToken(async (token) => {
    const r = await fetch(`/api/admin/users/${uid}/reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!r.ok) throw new Error((await r.json()).error || 'Reset failed')
    return r.json() as { resetLink: string }
  })

// ─── Component ───────────────────────────────────────────────────────────
const AdminUsers: NextPage = () => {
  const qc = useQueryClient()
  const { data: users = [], isLoading } = useQuery('users', fetchUsers)

  const invite = useMutation(inviteUser, {
    onSuccess: () => qc.invalidateQueries('users'),
  })
  const toggle = useMutation(
    ({ uid, role }: { uid: string; role: Role }) => setRole(uid, role),
    { onSuccess: () => qc.invalidateQueries('users') }
  )
  const reset  = useMutation(resetPw)

  const [form, setForm] = useState({
    email: '', displayName: '', role: 'user' as Role,
  })

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Invite */}
      <div className="mb-8 p-4 bg-gray-50 rounded">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className="flex-1 p-2 border rounded" placeholder="Email"
            value={form.email}
            onChange={e=>setForm({ ...form, email: e.target.value })}/>
          <input className="flex-1 p-2 border rounded" placeholder="Display Name"
            value={form.displayName}
            onChange={e=>setForm({ ...form, displayName: e.target.value })}/>
          <select className="p-2 border rounded"
            value={form.role}
            onChange={e=>setForm({ ...form, role: e.target.value as Role })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={invite.isLoading}
            onClick={()=>invite.mutate(form)}
          >
            {invite.isLoading ? 'Inviting…' : 'Invite'}
          </button>
        </div>
        {invite.error && <p className="text-red-600 mt-1">
          {(invite.error as Error).message}
        </p>}
        {invite.data && (
          <p className="text-green-600 mt-1">
            Temp password: <code>{invite.data.tempPassword}</code>
          </p>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <table className="w-full table-auto bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Display Name</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.displayName || '—'}</td>
                <td className="p-2 text-center">{u.role}</td>
                <td className="p-2 space-x-2 text-center">
                  {u.role === 'user' ? (
                    <button
                      onClick={()=>toggle.mutate({ uid:u.id, role:'admin' })}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >Make Admin</button>
                  ) : (
                    <button
                      onClick={()=>toggle.mutate({ uid:u.id, role:'user' })}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                    >Revoke Admin</button>
                  )}
                  <button
                    onClick={()=>reset.mutate(u.id,{
                      onSuccess:d=>alert(`Reset link:\n${d.resetLink}`),
                    })}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                  >Reset Pw</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  )
}

export default AdminUsers

