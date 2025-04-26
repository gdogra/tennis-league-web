import type { NextApiRequest, NextApiResponse } from 'next'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from '../../../../lib/serviceAccountKey.json'

// ───────────────────── Firebase Admin initialisation ──────────────────────
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount as any) })
}
const adminAuth = getAdminAuth()
const db        = getFirestore()

// ─────────────────────────── Helpers ──────────────────────────────────────
async function verifyAdmin(req: NextApiRequest) {
  const hdr = req.headers.authorization ?? ''
  if (!hdr.startsWith('Bearer ')) throw { status: 401, msg: 'Missing token' }
  const idToken = hdr.split('Bearer ')[1]

  const decoded = await adminAuth.verifyIdToken(idToken)
  const docSnap = await db.doc(`users/${decoded.uid}`).get()
  if (docSnap.data()?.role !== 'admin') throw { status: 403, msg: 'Not an admin' }
}

// ─────────────────────────── Handler ──────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await verifyAdmin(req)

    // ── GET  /api/admin/users  → list all user docs
    if (req.method === 'GET') {
      const snap  = await db.collection('users').get()
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return res.status(200).json({ users })
    }

    // ── POST /api/admin/users  → invite / create new user
    if (req.method === 'POST') {
      const { email, displayName, role } = req.body as {
        email: string
        displayName: string
        role: 'admin' | 'user'
      }
      if (!email || !role) throw { status: 400, msg: 'Missing email or role' }

      const tempPassword = Math.random().toString(36).slice(-8)

      // 1) Auth user
      const userRec = await adminAuth.createUser({
        email,
        displayName,
        password: tempPassword,
        emailVerified: false,
      })

      // 2) Firestore profile
      await db.doc(`users/${userRec.uid}`).set(
        { email, displayName, role, createdAt: new Date() },
        { merge: true }
      )

      return res.status(201).json({
        uid: userRec.uid,
        email,
        displayName,
        role,
        tempPassword,
      })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.msg || e.message })
  }
}

