// src/pages/auth/signup.tsx

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { auth, db } from '../../lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function SignupPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

  if (user) {
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      // Create the Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password)

      // Update displayName in Auth profile
      if (displayName) {
        await updateProfile(cred.user, { displayName })
      }

      // Create Firestore user profile
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        displayName,
        role: 'user',
        createdAt: new Date(),
      })

      toast({ msg: 'Account created!', type: 'success' })
      router.push('/profile')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else {
        setError(err.message || 'Sign up failed.')
      }
      toast({ msg: err.message || 'Sign up failed', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Sign Up — Tennis League</title>
      </Head>

      <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8 space-y-4">
        <h1 className="text-2xl font-bold">Sign Up</h1>

        {error && <div className="text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="font-medium">Display Name</span>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
            />
          </label>

          <label className="block">
            <span className="font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
            />
          </label>

          <label className="block">
            <span className="font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
            />
          </label>

          <label className="block">
            <span className="font-medium">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
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

