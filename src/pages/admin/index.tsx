// src/pages/admin/index.tsx
import { NextPage } from "next";
import { useQuery } from "react-query";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import AdminLayout from "../../components/AdminLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

/* ──────────────────────────────────────────────────────────────────────────
   Firestore fetchers
   ──────────────────────────────────────────────────────────────────────── */
const fetchMetrics = async () => {
  const usersSnap = await getDocs(collection(db, "users"));
  const adminCnt = usersSnap.docs.filter(
    (d) => d.data().role === "admin",
  ).length;
  const matchSnap = await getDocs(collection(db, "matches"));
  const pending = matchSnap.docs.filter(
    (d) => d.data().status === "pending",
  ).length;
  const completed = matchSnap.docs.filter(
    (d) => d.data().status === "completed",
  ).length;

  return {
    userCount: usersSnap.size,
    adminCount: adminCnt,
    pendingMatches: pending,
    completedMatches: completed,
  };
};

const fetchRecentMatches = async () => {
  const qSnap = await getDocs(
    query(collection(db, "matches"), orderBy("createdAt", "desc"), limit(5)),
  );
  return qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};

const fetchSparkData = async () => {
  // count matches per day (last 7 days)
  const snap = await getDocs(collection(db, "matches"));
  const counts: Record<string, number> = {};
  snap.docs.forEach((doc) => {
    const day = dayjs(
      doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    ).format("YYYY-MM-DD");
    counts[day] = (counts[day] || 0) + 1;
  });
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = dayjs()
      .subtract(6 - i, "day")
      .format("YYYY-MM-DD");
    return { day: d.slice(5), count: counts[d] ?? 0 };
  });
  return last7;
};

/* ──────────────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────────────── */
const AdminDashboard: NextPage = () => {
  const { data: metrics = {}, isLoading: mLoad } = useQuery(
    "metrics",
    fetchMetrics,
  );
  const { data: recent = [], isLoading: rLoad } = useQuery(
    "recent",
    fetchRecentMatches,
  );
  const { data: spark = [], isLoading: sLoad } = useQuery(
    "spark",
    fetchSparkData,
  );

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={mLoad ? "…" : metrics.userCount} />
        <StatCard title="Admins" value={mLoad ? "…" : metrics.adminCount} />
        <StatCard
          title="Pending Matches"
          value={mLoad ? "…" : metrics.pendingMatches}
        />
        <StatCard
          title="Completed Matches"
          value={mLoad ? "…" : metrics.completedMatches}
        />
      </div>

      {/* ── Sparkline ─────────────────────────────────────────────── */}
      <div className="bg-white shadow rounded p-4 mb-8">
        <h2 className="font-semibold mb-2">Matches last 7 days</h2>
        {sLoad ? (
          <p>Loading chart…</p>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={spark}>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                fill="#60a5fa"
                stroke="#2563eb"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Latest matches table ──────────────────────────────────── */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Latest Pending Matches</h2>
        {rLoad ? (
          <p>Loading…</p>
        ) : recent.length === 0 ? (
          <p>No matches.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Player A</th>
                <th className="p-2">Player B</th>
                <th className="p-2">Scheduled</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-2">{m.playerA}</td>
                  <td className="p-2">{m.playerB}</td>
                  <td className="p-2">
                    {dayjs(m.scheduledAt).format("MMM D, HH:mm")}
                  </td>
                  <td className="p-2 capitalize">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

/* ── small reusable card ─────────────────────────────────────────── */
function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white shadow rounded p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default AdminDashboard;
