// src/pages/profile.tsx
import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function ProfilePage() {
  const { currentUser } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentUser) return

    async function fetchProfile() {
      const refDoc = doc(db, 'users', currentUser.uid)
      const snap = await getDoc(refDoc)
      setProfile(snap.data())
      setLoading(false)
    }

    fetchProfile()
  }, [currentUser])

  async function saveProfile() {
    if (!currentUser) return
    setSaving(true)
    await setDoc(doc(db, 'users', currentUser.uid), {
      displayName: profile.displayName || '',
      phone: profile.phone || '',
      city: profile.city || '',
      avatarUrl: profile.avatarUrl || '',
    }, { merge: true })
    setSaving(false)
    alert('✅ Profile updated!')
  }

  async function uploadAvatar(e: any) {
    const file = e.target.files[0]
    if (!file || !currentUser) return

    const storageRef = ref(storage, `avatars/${currentUser.uid}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)

    setProfile((p: any) => ({ ...p, avatarUrl: url }))
    alert('✅ Avatar uploaded! Don’t forget to Save Changes.')
  }

  if (loading) return <Layout><p>Loading profile…</p></Layout>

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="max-w-md space-y-4">
        {/* Avatar display */}
        {profile?.avatarUrl && (
          <img src={profile.avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
        )}

        {/* Avatar upload */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="block w-full text-sm"
          />
        </div>

        {/* Profile fields */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">Display Name</label>
          <input
            className="w-full p-2 border rounded"
            value={profile?.displayName || ''}
            onChange={(e) => setProfile((p: any) => ({ ...p, displayName: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-gray-600">Phone</label>
          <input
            className="w-full p-2 border rounded"
            value={profile?.phone || ''}
            onChange={(e) => setProfile((p: any) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-gray-600">City</label>
          <input
            className="w-full p-2 border rounded"
            value={profile?.city || ''}
            onChange={(e) => setProfile((p: any) => ({ ...p, city: e.target.value }))}
          />
        </div>

        {/* Save button */}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Layout>
  )
}

