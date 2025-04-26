"use client";
// src/pages/index.tsx
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    // VERY important: no Layout yet during loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Also don't Layout when no user
    return null;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Welcome to the Tennis League</h1>
      <p className="mt-2">Upcoming matches and schedule will appear here.</p>
    </Layout>
  );
}
