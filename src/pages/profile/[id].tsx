"use client";
// src/pages/profile/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import Layout from "../../components/Layout";
import Link from "next/link";

export default function PlayerProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [player, setPlayer] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      // Fetch player profile
      const snap = await getDoc(doc(db, "users", id as string));
      if (snap.exists()) {
        setPlayer({ id: snap.id, ...snap.data() });
      }

      // Fetch matches involving player
      const q = query(
        collection(db, "matches"),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc"),
      );
      const matchSnap = await getDocs(q);
      const allMatches = matchSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filtered = allMatches.filter(
        (m) => m.player1Id === id || m.player2Id === id,
      );

      setMatches(filtered);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading)
    return (
      <Layout>
        <p>Loading profile…</p>
      </Layout>
    );

  if (!player)
    return (
      <Layout>
        <p>Player not found.</p>
      </Layout>
    );

  const wins = matches.filter((m) => m.winnerId === id).length;
  const losses = matches.length - wins;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">
        {player.displayName || player.email}
      </h1>
      <div className="mb-6 space-y-2">
        <p>
          <strong>Wins:</strong> {wins}
        </p>
        <p>
          <strong>Losses:</strong> {losses}
        </p>
        <p>
          <strong>Total Matches:</strong> {matches.length}
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Match History</h2>

      <div className="space-y-3">
        {matches.map((match) => (
          <div key={match.id} className="border p-3 rounded bg-white shadow">
            <Link
              href={`/matches/${match.id}`}
              className="font-bold text-blue-600 hover:underline"
            >
              Match vs{" "}
              {match.player1Id === id ? match.player2Name : match.player1Name}
            </Link>
            <p className="text-sm text-gray-600">
              Result: {match.winnerId === id ? "Won" : "Lost"}
            </p>
          </div>
        ))}
        {matches.length === 0 && (
          <p className="text-gray-600">No matches yet.</p>
        )}
      </div>
    </Layout>
  );
}
