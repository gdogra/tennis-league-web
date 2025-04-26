// src/pages/auth/signup.tsx

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { auth } from '../../lib/firebase'
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { createUserProfile } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'

export default function SignupPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string|null>(null)
  const [submitting, setSubmitting] = useState(false)

  // If already signed in, go home
  useEffect(() => {
    if (!loading && user) {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">Loading…</div>
      </Layout>
    )
  }
  if (user) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // 1) Create auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // 2) Optionally set their displayName on the Auth user
      if (displayName) await updateProfile(cred.user, { displayName })
      // 3) Mirror to Firestore under /users
      await createUserProfile(cred.user.uid, cred.user.email!, displayName)
      // 4) Send them to login to sign in
      router.push('/auth/login')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <Head><title>Sign Up — Tennis League</title></Head>

      <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
        <h1 className="text-2xl font-bold mb-4">Create Account</h1>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </label>

          <label className="block">
            <span className="font-medium">Display Name (optional)</span>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </label>

          <label className="block">
            <span className="font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </Layout>
  )
}

