// src/pages/matches.tsx
import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import Link from 'next/link'

export default function MyMatches() {
  const { currentUser } = useAuth()
  const [matches, setMatches] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [challengeId, setChallengeId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    const fetchMatches = async () => {
      const q = query(
        collection(db, 'matches'),
        where('playerIds', 'array-contains', currentUser.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }

    const fetchPlayers = async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      setPlayers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    fetchMatches()
    fetchPlayers()
  }, [currentUser])

  async function challengePlayer() {
    if (!challengeId) return alert('Please select a player to challenge!')
    if (challengeId === currentUser?.uid) return alert('You cannot challenge yourself!')

    const opponent = players.find(p => p.id === challengeId)

    if (!opponent) return alert('Player not found.')

    const matchRef = await addDoc(collection(db, 'matches'), {
      player1Id: currentUser.uid,
      player2Id: challengeId,
      player1Name: currentUser.displayName || currentUser.email,
      player2Name: opponent.displayName || opponent.email,
      playerIds: [currentUser.uid, challengeId],
      score: null,
      winnerId: null,
      status: 'pending',
      createdAt: new Date(),
    })

    // Push notification
    await addDoc(collection(db, 'notifications'), {
      userId: challengeId,
      type: 'challenge',
      message: `${currentUser.displayName || currentUser.email} has challenged you!`,
      link: `/matches/${matchRef.id}`,
      read: false,
      createdAt: new Date()
    })

    alert(`✅ Challenge sent to ${opponent.displayName || opponent.email}!`)
    setChallengeId('')
    location.reload()
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">My Matches</h1>

      {/* Challenge Player */}
      {players.length > 1 && (
        <div className="p-4 mb-6 bg-white border rounded shadow space-y-2 max-w-md">
          <h2 className="font-semibold text-lg mb-2">Challenge a Player</h2>
          <select
            className="w-full p-2 border rounded"
            value={challengeId}
            onChange={(e) => setChallengeId(e.target.value)}
          >
            <option value="">Select Player</option>
            {players
              .filter(p => p.id !== currentUser?.uid)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName || p.email}
                </option>
              ))}
          </select>
          <button
            onClick={challengePlayer}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded"
          >
            Challenge
          </button>
        </div>
      )}

      {/* Matches list */}
      {loading ? (
        <p>Loading matches…</p>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <div key={m.id} className="p-4 border rounded bg-white shadow">
              <Link href={`/matches/${m.id}`}>
                <div className="cursor-pointer hover:underline">
                  <p><strong>Opponent:</strong> {m.player1Id === currentUser.uid ? m.player2Name : m.player1Name}</p>
                  <p><strong>Status:</strong> {m.status}</p>
                  <p><strong>Score:</strong> {m.score || 'Pending'}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

