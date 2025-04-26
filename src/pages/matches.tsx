"use client";
// src/pages/matches.tsx
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import Link from "next/link";

export default function MyMatches() {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [challengeId, setChallengeId] = useState("");
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState("");

  // Subscribe in real-time to matches
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "matches"),
      where("playerIds", "array-contains", currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser]);

  // One-time load of players list
  useEffect(() => {
    if (!currentUser) return;
    collection(db, "users")
      .get()
      .then((snap) =>
        setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      );
  }, [currentUser]);

  // Challenge another player
  async function challengePlayer() {
    if (!challengeId || challengeId === currentUser?.uid) {
      alert("Select a different player!");
      return;
    }
    const opponent = players.find((p) => p.id === challengeId);
    if (!opponent) return alert("Player not found.");

    // create match + notification in Cloud Functions or here...
    const matchRef = await collection(db, "matches").add({
      player1Id: currentUser.uid,
      player1Name: currentUser.displayName || currentUser.email,
      player2Id: opponent.id,
      player2Name: opponent.displayName || opponent.email,
      playerIds: [currentUser.uid, opponent.id],
      status: "pending",
      createdAt: new Date(),
    });

    await collection(db, "notifications").add({
      userId: opponent.id,
      type: "challenge",
      message: `${currentUser.displayName || currentUser.email} has challenged you!`,
      link: `/matches/${matchRef.id}`,
      read: false,
      createdAt: new Date(),
    });

    alert(`Challenge sent to ${opponent.displayName || opponent.email}!`);
    setChallengeId("");
  }

  // Report a score
  async function submitScore(match: any) {
    if (!scoreInput.trim()) return alert("Enter a score!");
    await updateDoc(doc(db, "matches", match.id), {
      score: scoreInput,
      winnerId: currentUser.uid,
      status: "pending",
    });
    alert("Score submitted! Awaiting approval.");
    setReportingId(null);
    setScoreInput("");
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">My Matches</h1>

      {/* Challenge Form */}
      {players.length > 1 && (
        <div className="p-4 mb-6 bg-white border rounded shadow max-w-md">
          <h2 className="font-semibold mb-2">Challenge a Player</h2>
          <select
            className="w-full p-2 border rounded mb-2"
            value={challengeId}
            onChange={(e) => setChallengeId(e.target.value)}
          >
            <option value="">Select Player</option>
            {players
              .filter((p) => p.id !== currentUser.uid)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName || p.email}
                </option>
              ))}
          </select>
          <button
            onClick={challengePlayer}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Challenge
          </button>
        </div>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((m) => (
          <div key={m.id} className="p-4 bg-white border rounded shadow">
            <Link href={`/matches/${m.id}`}>
              <a className="block hover:underline">
                <p>
                  <strong>Opponent:</strong>{" "}
                  {m.player1Id === currentUser.uid
                    ? m.player2Name
                    : m.player1Name}
                </p>
                <p>
                  <strong>Status:</strong> {m.status}
                </p>
                <p>
                  <strong>Score:</strong> {m.score || "Pending"}
                </p>
              </a>
            </Link>

            {/* Report Result */}
            {m.score == null &&
              (reportingId === m.id ? (
                <div className="mt-2 flex space-x-2">
                  <input
                    className="flex-1 p-2 border rounded"
                    placeholder="e.g. 6-4, 7-5"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                  />
                  <button
                    onClick={() => submitScore(m)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setReportingId(null)}
                    className="px-3 py-1 bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setReportingId(m.id)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Report Result
                </button>
              ))}
          </div>
        ))}
      </div>
    </Layout>
  );
}
