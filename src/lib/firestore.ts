// src/lib/firestore.ts
import { db } from './firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'user'

/**
 * Creates/updates a user document under /users/{uid}.
 * Defaults to role === 'user'.
 */
export async function createUserProfile(
  uid: string,
  email: string,
  displayName?: string,
  role: UserRole = 'user'
) {
  await setDoc(doc(db, 'users', uid), {
    email,
    displayName: displayName || null,
    role,
    createdAt: serverTimestamp(),
  })
}

