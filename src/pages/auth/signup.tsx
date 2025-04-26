"use client";
// src/pages/auth/signup.tsx
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../../components/AuthLayout";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        // update display name
        await updateProfile(cred.user, { displayName });
        // create Firestore profile
        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            email,
            displayName,
            role: "user",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Display Name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Confirm Password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? "Signing up…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </AuthLayout>
  );
}
// src/pages/auth/signup.tsx
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../../components/AuthLayout";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        // update display name
        await updateProfile(cred.user, { displayName });
        // create Firestore profile
        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            email,
            displayName,
            role: "user",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Display Name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Confirm Password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? "Signing up…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </AuthLayout>
  );
}
// src/pages/auth/signup.tsx
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../../components/AuthLayout";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        // update display name
        await updateProfile(cred.user, { displayName });
        // create Firestore profile
        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            email,
            displayName,
            role: "user",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Display Name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Confirm Password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? "Signing up…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </AuthLayout>
  );
}
// src/pages/auth/signup.tsx
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../../components/AuthLayout";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        // update display name
        await updateProfile(cred.user, { displayName });
        // create Firestore profile
        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            email,
            displayName,
            role: "user",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Display Name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Confirm Password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? "Signing up…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </AuthLayout>
  );
}
// src/pages/auth/signup.tsx
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../../components/AuthLayout";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        // update display name
        await updateProfile(cred.user, { displayName });
        // create Firestore profile
        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            email,
            displayName,
            role: "user",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Display Name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <label className="block">
          <span className="font-medium">Confirm Password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? "Signing up…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </AuthLayout>
  );
}
