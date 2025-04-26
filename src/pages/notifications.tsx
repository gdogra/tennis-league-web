// src/pages/notifications.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, addDoc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import Link from 'next/link'
import dayjs from 'dayjs'

export default function NotificationsPage() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  async function markAsRead(id: string) {
    await updateDoc(doc(db, 'notifications', id), { read: true })
  }

  async function acceptChallenge(notif: any) {
    if (!notif.link) return

    const matchId = notif.link.split('/matches/')[1]

    await updateDoc(doc(db, 'matches', matchId), { status: 'approved' })

    const matchDoc = await getDoc(doc(db, 'matches', matchId))
    const match = matchDoc.data()

    await addDoc(collection(db, 'notifications'), {
      userId: match.player1Id,
      type: 'info',
      message: `${currentUser.displayName || currentUser.email} accepted your challenge!`,
      link: `/matches/${matchId}`,
      read: false,
      createdAt: new Date(),
    })

    await markAsRead(notif.id)
    router.push(`/matches/${matchId}`)
  }

  async function declineChallenge(notif: any) {
    if (!notif.link) return

    const matchId = notif.link.split('/matches/')[1]

    await updateDoc(doc(db, 'matches', matchId), { status: 'rejected' })

    const matchDoc = await getDoc(doc(db, 'matches', matchId))
    const match = matchDoc.data()

    await addDoc(collection(db, 'notifications'), {
      userId: match.player1Id,
      type: 'info',
      message: `${currentUser.displayName || currentUser.email} declined your challenge.`,
      link: `/matches/${matchId}`,
      read: false,
      createdAt: new Date(),
    })

    await markAsRead(notif.id)
    router.push(`/matches`)
  }

  function getBadgeColor(type: string) {
    if (type === 'challenge') return 'bg-yellow-400'
    if (type === 'info') return 'bg-blue-400'
    return 'bg-gray-400'
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {loading ? (
        <p>Loading notifications…</p>
      ) : (
        <div className="space-y-4">
          {notifications.length === 0 && <p>No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 border rounded bg-white shadow relative ${n.read ? 'opacity-60' : ''}`}>
              {/* Badge */}
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getBadgeColor(n.type)}`}></div>

              {/* Message */}
              <p className="text-lg font-semibold">{n.message}</p>

              {/* Timestamp */}
              {n.createdAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {dayjs(n.createdAt.toDate ? n.createdAt.toDate() : n.createdAt).format('MMM D, YYYY h:mm A')}
                </p>
              )}

              {/* Challenge Actions */}
              {n.type === 'challenge' && !n.read && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => acceptChallenge(n)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => declineChallenge(n)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    Decline
                  </button>
                </div>
              )}

              {/* View link */}
              {n.link && (
                <Link href={n.link} className="block mt-3 text-blue-600 hover:underline">
                  View
                </Link>
              )}

              {/* Mark as Read */}
              {!n.read && n.type !== 'challenge' && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

