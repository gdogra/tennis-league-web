// src/pages/admin/matches.tsx
import { NextPage } from "next";
import { useQuery, useQueryClient } from "react-query";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import AdminLayout from "../../components/AdminLayout";

type MatchDoc = {
  playerA: string;
  playerB: string;
  scheduledAt: string;
  status: "pending" | "approved" | "rejected";
};

const fetchPendingMatches = async (): Promise<
  Array<{ id: string; data: MatchDoc }>
> => {
  const q = query(collection(db, "matches"), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as MatchDoc }));
};

const AdminMatchesPage: NextPage = () => {
  const qc = useQueryClient();
  const { data: matches, isLoading } = useQuery(
    "pendingMatches",
    fetchPendingMatches,
  );

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    await updateDoc(doc(db, "matches", id), { status });
    qc.invalidateQueries("pendingMatches");
  };

  if (isLoading)
    return (
      <AdminLayout>
        <div>Loading matches…</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Match Approvals</h1>
      {matches!.length === 0 ? (
        <p>No pending matches.</p>
      ) : (
        <ul className="space-y-4">
          {matches!.map(({ id, data }) => (
            <li
              key={id}
              className="p-4 bg-white shadow rounded flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>{data.playerA}</strong> vs{" "}
                  <strong>{data.playerB}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Scheduled: {new Date(data.scheduledAt).toLocaleString()}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => updateStatus(id, "approved")}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(id, "rejected")}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
};

export default AdminMatchesPage;
