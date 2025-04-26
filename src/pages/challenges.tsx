// src/pages/challenges.tsx
import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import dayjs from 'dayjs'

export default function ChallengesSentPage() {
  const { currentUser } = useAuth()
  const [challenges, setChallenges] = useState<any[]>([])

  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'matches'),
      where('player1Id', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [currentUser])

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Challenges You’ve Sent</h1>
      {challenges.length === 0 ? (
        <p>No challenges yet.</p>
      ) : (
        <div className="space-y-4">
          {challenges.map(c => (
            <div key={c.id} className="p-4 bg-white border rounded shadow">
              <Link href={`/matches/${c.id}`}>
                <a className="text-lg font-bold text-blue-600 hover:underline">
                  {c.player2Name}
                </a>
              </Link>
              <p className="text-sm text-gray-600">Status: {c.status}</p>
              <p className="text-xs text-gray-500">
                {dayjs(c.createdAt.toDate?.() || c.createdAt).format('MMM D, YYYY h:mm A')}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

