// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser)
      if (firebaseUser) {
        const refDoc = doc(db, 'users', firebaseUser.uid)
        const snap = await getDoc(refDoc)
        const profile = snap.data()

        if (profile) {
          setUser({ ...firebaseUser, ...profile })
          setIsAdmin(profile.role === 'admin')
        }
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasUnreadNotifications(!snapshot.empty)
    })

    return () => unsubscribe()
  }, [currentUser])

  const logout = () => auth.signOut()

  return (
    <AuthContext.Provider value={{ user, currentUser, isAdmin, logout, hasUnreadNotifications }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

