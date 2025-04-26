import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useQuery, useMutation } from 'react-query'
import { db } from '../../lib/firebase'
import AdminLayout from '../../components/AdminLayout'
import { useState } from 'react'
import { useToast } from '../../contexts/ToastContext'

export default function AdminSettings() {
  const toast = useToast()
  const { data, isLoading } = useQuery('settings', async () => {
    const snap = await getDoc(doc(db, 'config', 'global'))
    return snap.data()
  })
  const [form, set] = useState<any>({})
  const mut = useMutation(
    (v: any) => setDoc(doc(db, 'config', 'global'), v, { merge: true }),
    {
      onSuccess: () => toast({ msg: 'Saved', type:'success' }),
    }
  )

  if (isLoading) return <AdminLayout><p>Loading…</p></AdminLayout>

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">League Settings</h1>
      <div className="max-w-md space-y-4">
        {['seasonStart','seasonEnd','maxSets'].map(k=>(
          <div key={k}>
            <label className="block text-sm text-gray-600 mb-1">{k}</label>
            <input
              className="w-full p-2 border rounded"
              defaultValue={data?.[k]}
              onChange={e=>set((p:any)=>({...p,[k]:e.target.value}))}
            />
          </div>
        ))}
        <button
          onClick={()=>mut.mutate(form)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </AdminLayout>
  )
}

