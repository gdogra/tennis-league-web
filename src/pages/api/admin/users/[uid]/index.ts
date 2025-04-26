import type { NextApiRequest, NextApiResponse } from 'next'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from '../../../../../lib/serviceAccountKey.json' // ← five “../” to reach src/

// ─── Initialise Admin SDK (once) ───────────────────────────────────────────
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount as any) })
}
const adminAuth = getAdminAuth()
const db        = getFirestore()

// ─── Guard: caller must be role === 'admin' ───────────────────────────────
async function verifyAdmin(req: NextApiRequest) {
  const hdr = req.headers.authorization ?? ''
  if (!hdr.startsWith('Bearer ')) throw { status: 401, msg: 'Missing token' }
  const decoded = await adminAuth.verifyIdToken(hdr.split('Bearer ')[1])
  const snap    = await db.doc(`users/${decoded.uid}`).get()
  if (snap.data()?.role !== 'admin') throw { status: 403, msg: 'Not an admin' }
}

// ─── PATCH /api/admin/users/[uid]  → change role ──────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await verifyAdmin(req)

    if (req.method !== 'PATCH') {
      res.setHeader('Allow', ['PATCH'])
      return res.status(405).end()
    }

    const uid  = req.query.uid as string
    const { role } = req.body as { role: 'admin' | 'user' }

    if (!role) throw { status: 400, msg: 'Missing role' }

    await db.doc(`users/${uid}`).set({ role }, { merge: true })
    return res.status(200).json({ uid, role })
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.msg || e.message })
  }
}

