// src/pages/leaderboard.tsx
import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Layout from '../components/Layout'
import Link from 'next/link'

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      const userSnap = await getDocs(collection(db, 'users'))
      const users: Record<string, any> = {}
      userSnap.forEach((doc) => {
        users[doc.id] = { id: doc.id, ...doc.data(), wins: 0, losses: 0 }
      })

      const matchSnap = await getDocs(
        query(collection(db, 'matches'), where('status', '==', 'approved'))
      )
      matchSnap.forEach((doc) => {
        const match = doc.data()
        if (!match.winnerId) return

        if (users[match.player1Id] && users[match.player2Id]) {
          if (match.winnerId === match.player1Id) {
            users[match.player1Id].wins++
            users[match.player2Id].losses++
          } else {
            users[match.player2Id].wins++
            users[match.player1Id].losses++
          }
        }
      })

      const sorted = Object.values(users)
        .filter(u => u.displayName)
        .map(u => ({
          ...u,
          points: u.wins * 3 + u.losses * 1
        }))
        .sort((a, b) => b.points - a.points)

      setPlayers(sorted)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  const getMedal = (idx: number) => {
    if (idx === 0) return '🥇'
    if (idx === 1) return '🥈'
    if (idx === 2) return '🥉'
    return idx + 1
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      {loading ? (
        <p>Loading leaderboard…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded shadow">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Player</th>
                <th className="p-3 text-center">Wins</th>
                <th className="p-3 text-center">Losses</th>
                <th className="p-3 text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr key={player.id} className="border-t">
                  <td className="p-3">{getMedal(idx)}</td>
                  <td className="p-3">
                    <Link href={`/profile/${player.id}`} className="text-blue-600 hover:underline">
                      {player.displayName || player.email}
                    </Link>
                  </td>
                  <td className="p-3 text-center">{player.wins}</td>
                  <td className="p-3 text-center">{player.losses}</td>
                  <td className="p-3 text-center font-bold">{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

