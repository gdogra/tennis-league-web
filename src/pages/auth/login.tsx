// src/pages/auth/login.tsx

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { auth } from '../../lib/firebase'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Redirect signed-in users to home
  useEffect(() => {
    if (!loading && user) {
      router.replace('/')
    }
  }, [user, loading, router])

  // Show loading placeholder while auth state is resolving
  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">Loading…</div>
      </Layout>
    )
  }

  // If already signed in, do not render the form (redirect is in-flight)
  if (user) {
    return null
  }

  // Google OAuth handler
  const handleGoogleSignIn = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Email/password submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/')
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No user found with that email.')
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.')
      } else {
        setError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Login — Tennis League</title>
      </Head>

      <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8 space-y-4">
        <h1 className="text-2xl font-bold">Log In</h1>

        {error && <div className="text-red-600">{error}</div>}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="w-full flex items-center justify-center space-x-2 border border-gray-300 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          <FcGoogle className="h-5 w-5" />
          <span>Sign in with Google</span>
        </button>

        <div className="border-t my-4" />

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Don’t have an account?{' '}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </Layout>
  )
}

