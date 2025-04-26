// src/pages/api/admin/users/[uid]/reset.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'          // ← added
import serviceAccount from '../../../../../lib/serviceAccountKey.json'

// ─── Initialise Admin SDK once ─────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount as any) })
}
const adminAuth = getAdminAuth()
const db        = getFirestore()

// ─── Guard: caller must be an admin ────────────────────────────────────────
async function verifyAdmin(req: NextApiRequest) {
  const hdr = req.headers.authorization ?? ''
  if (!hdr.startsWith('Bearer ')) throw { status: 401, msg: 'Missing token' }

  const decoded = await adminAuth.verifyIdToken(hdr.split('Bearer ')[1])
  const snap    = await db.doc(`users/${decoded.uid}`).get()
  if (snap.data()?.role !== 'admin') throw { status: 403, msg: 'Not an admin' }
}

// ─── POST /api/admin/users/[uid]/reset ─────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await verifyAdmin(req)

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).end()
    }

    const uid   = req.query.uid as string
    const email = (await adminAuth.getUser(uid)).email
    if (!email) throw { status: 400, msg: 'User has no email' }

    // Generate password-reset link (valid for 1h by default)
    const link = await adminAuth.generatePasswordResetLink(email)

    // In production you’d send an email; here we simply return the link
    return res.status(200).json({ resetLink: link })
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.msg || e.message })
  }
}

