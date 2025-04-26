// src/pages/matches/[id].tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import dayjs from 'dayjs'

export default function MatchDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { currentUser } = useAuth()

  const [match, setMatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState('')
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    if (!id) return

    async function fetchMatch() {
      const snap = await getDoc(doc(db, 'matches', id as string))
      if (snap.exists()) {
        setMatch({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    }

    fetchMatch()
  }, [id])

  async function submitScore() {
    if (!currentUser || !match) return
    if (!score) return alert('Please enter the score!')

    const winnerId = window.confirm(`Did you win the match? OK = Yes, Cancel = No`) 
      ? currentUser.uid
      : (currentUser.uid === match.player1Id ? match.player2Id : match.player1Id)

    await updateDoc(doc(db, 'matches', id as string), {
      status: 'completed',
      winnerId,
      score,
    })

    alert('✅ Score reported successfully!')
    router.push('/matches')
  }

  if (loading) return (
    <Layout>
      <p>Loading match…</p>
    </Layout>
  )

  if (!match) return (
    <Layout>
      <p>Match not found.</p>
    </Layout>
  )

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Match Details</h1>

      <div className="bg-white rounded shadow p-6 space-y-4 max-w-2xl">
        <div>
          <p className="text-gray-600">Player 1:</p>
          <Link href={`/profile/${match.player1Id}`} className="text-lg font-semibold text-blue-600 hover:underline">
            {match.player1Name || match.player1Id}
          </Link>
        </div>

        <div>
          <p className="text-gray-600">Player 2:</p>
          <Link href={`/profile/${match.player2Id}`} className="text-lg font-semibold text-blue-600 hover:underline">
            {match.player2Name || match.player2Id}
          </Link>
        </div>

        <div>
          <p className="text-gray-600">Status:</p>
          <p className="text-lg font-semibold capitalize">{match.status}</p>
        </div>

        {match.winnerId && (
          <div>
            <p className="text-gray-600">Winner:</p>
            <p className="text-lg font-bold text-green-600">
              {match.winnerId === match.player1Id ? match.player1Name : match.player2Name}
            </p>
          </div>
        )}

        {match.score && (
          <div>
            <p className="text-gray-600">Score:</p>
            <p className="text-md">{match.score}</p>
          </div>
        )}

        {match.notes && (
          <div>
            <p className="text-gray-600">Notes:</p>
            <p className="text-md">{match.notes}</p>
          </div>
        )}

        {match.createdAt && (
          <div>
            <p className="text-gray-600">Created:</p>
            <p className="text-sm text-gray-500">
              {dayjs(match.createdAt.toDate ? match.createdAt.toDate() : match.createdAt).format('MMM D, YYYY h:mm A')}
            </p>
          </div>
        )}

        {/* Report score section */}
        {match.status === 'approved' && (
          <div className="mt-6 space-y-3">
            {!reporting ? (
              <button
                onClick={() => setReporting(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Report Score
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter final score (e.g., 6-4, 3-6, 7-5)"
                  className="w-full p-2 border rounded"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
                <button
                  onClick={submitScore}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit Score
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

