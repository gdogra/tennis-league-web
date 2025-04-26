// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/* ----------------------------------------------------------------------------
   Firebase Config – pulled from .env.local  (NEXT_PUBLIC_* vars)
   -------------------------------------------------------------------------- */
export const firebaseConfig = {
  apiKey:               process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:           process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:                process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:        process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

/* ----------------------------------------------------------------------------
   Singleton initialisation (avoids duplicate-app errors on Fast-Refresh)
   -------------------------------------------------------------------------- */
const clientApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(clientApp)
export const db   = getFirestore(clientApp)

/* ----------------------------------------------------------------------------
   Dev-only helpers exposed to the browser console
   -------------------------------------------------------------------------- */
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  ;(window as any).auth = auth            // quick access in Console

  // mini debug toolbox
  ;(window as any).dev = {
    async token() {
      return auth.currentUser?.getIdToken()
    },
    async list() {
      const t = await this.token()
      return fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${t}` },
      }).then(r => r.json())
    },
    async makeAdmin(uid: string) {
      const t = await this.token()
      return fetch(`/api/admin/users/${uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ role: 'admin' }),
      }).then(r => r.json())
    },
    async revokeAdmin(uid: string) {
      const t = await this.token()
      return fetch(`/api/admin/users/${uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ role: 'user' }),
      }).then(r => r.json())
    },
    async resetPw(uid: string) {
      const t = await this.token()
      return fetch(`/api/admin/users/${uid}/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      }).then(r => r.json())
    },
  }

  console.info('%cdev helpers loaded -> window.dev', 'color:#0fa')
}

