// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import { auth, db } from '../lib/firebase'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

type AuthContextType = {
  user: FirebaseUser | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true)

      if (fbUser) {
        // Fetch the Firestore profile doc for this user
        const docRef = doc(db, 'users', fbUser.uid)
        const docSnap = await getDoc(docRef)
        console.log('Fetched user profile:', fbUser.uid, docSnap.data())

        setUser(fbUser)
        setRole(docSnap.data()?.role ?? 'user')
      } else {
        setUser(null)
        setRole(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signOut = () => firebaseSignOut(auth)

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: role === 'admin',
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

