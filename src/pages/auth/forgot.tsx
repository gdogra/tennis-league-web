// src/pages/auth/forgot.tsx

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { auth } from '../../lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useToast } from '../../contexts/ToastContext'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await sendPasswordResetEmail(auth, email)
      toast({ msg: 'Password reset email sent!', type: 'success' })
      router.push('/auth/login')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/user-not-found') {
        setError('No user found with that email.')
      } else {
        setError(err.message || 'Failed to send reset email.')
      }
      toast({ msg: err.message || 'Failed to send reset email.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Reset Password — Tennis League</title>
      </Head>

      <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8 space-y-4">
        <h1 className="text-2xl font-bold">Reset Password</h1>

        {error && <div className="text-red-600">{error}</div>}

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

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Remembered your password?{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </Layout>
  )
}

