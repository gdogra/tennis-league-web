import type { NextApiRequest, NextApiResponse } from 'next'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { validate } from '../../../../lib/validate'
import serviceAccount from '../../../../lib/serviceAccountKey.json'

if (!getApps().length)
  initializeApp({ credential: cert(serviceAccount as any) })

const adminAuth = getAdminAuth()
const db        = getFirestore()

async function verifyAdmin(req: NextApiRequest): Promise<string> {
  const hdr = req.headers.authorization ?? ''
  if (!hdr.startsWith('Bearer ')) throw { status: 401, msg: 'Missing token' }

  const token   = hdr.split('Bearer ')[1]
  const decoded = await adminAuth.verifyIdToken(token)
  const snap    = await db.doc(`users/${decoded.uid}`).get()

  if (snap.data()?.role !== 'admin') throw { status: 403, msg: 'Not admin' }
  return decoded.uid
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const actorUid = await verifyAdmin(req)

    /* ───────────── GET  list users (cursor optional) ───────────── */
    if (req.method === 'GET') {
      const usersSnap = await db.collection('users').orderBy('createdAt', 'desc').get()
      const users = usersSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }))
      return res.status(200).json({ users })
    }

    /* ───────────── POST  create user + profile ─────────────────── */
    if (req.method === 'POST') {
      const data = validate(
        z.object({
          email:       z.string().email(),
          displayName: z.string().min(2).max(40),
          role:        z.enum(['admin', 'user']),
        }),
        req.body
      )

      // create Auth user with random 12-char pwd
      const tmpPwd = nanoid(12)
      const { uid } = await adminAuth.createUser({
        email: data.email,
        password: tmpPwd,
        displayName: data.displayName,
      })

      // Firestore profile
      await db.doc(`users/${uid}`).set({
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        createdAt: FieldValue.serverTimestamp(),
      })

      // Audit
      await db.doc(`adminLogs/${nanoid()}`).set({
        actorUid,
        action: 'create_user',
        target: { type: 'user', id: uid },
        after: { role: data.role },
        at: FieldValue.serverTimestamp(),
      })

      return res.status(201).json({ uid, tempPassword: tmpPwd })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end()
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.msg || e.message })
  }
}

