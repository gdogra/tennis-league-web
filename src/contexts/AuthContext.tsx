"use client";
// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getIdToken, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[AuthStateChanged]", firebaseUser);
      if (firebaseUser) {
        const token = await getIdToken(firebaseUser);
        setUser(firebaseUser);
        setToken(token);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    router.push("/auth/login"); // <--- Optional hard redirect after logout
  };

  const isAdmin = user?.email && user?.email.endsWith("@example.com"); // Adjust your logic here

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
