"use client";
// src/pages/challenge/[id].tsx
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";

export default function ChallengePlayerPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();

  const [opponent, setOpponent] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchOpponent() {
      const snap = await getDoc(doc(db, "users", id as string));
      if (snap.exists()) {
        setOpponent({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }

    fetchOpponent();
  }, [id]);

  async function submitChallenge() {
    if (!currentUser || !opponent) return;

    // Create Match (pending)
    const matchRef = await addDoc(collection(db, "matches"), {
      player1Id: currentUser.uid,
      player1Name: currentUser.displayName || currentUser.email,
      player2Id: opponent.id,
      player2Name: opponent.displayName || opponent.email,
      status: "pending",
      createdAt: Timestamp.now(),
      notes,
    });

    // Notify opponent
    await addDoc(collection(db, "notifications"), {
      userId: opponent.id,
      type: "challenge",
      message: `${currentUser.displayName || currentUser.email} challenged you to a match!`,
      link: `/matches/${matchRef.id}`,
      read: false,
      createdAt: new Date(),
    });

    alert("✅ Challenge sent!");
    router.push("/matches");
  }

  if (loading)
    return (
      <Layout>
        <p>Loading…</p>
      </Layout>
    );

  if (!opponent)
    return (
      <Layout>
        <p>Opponent not found.</p>
      </Layout>
    );

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Challenge {opponent.displayName || opponent.email}
      </h1>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Optional Message:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Optional: Pick a time, court, etc."
          />
        </div>

        <button
          onClick={submitChallenge}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send Challenge
        </button>
      </div>
    </Layout>
  );
}
