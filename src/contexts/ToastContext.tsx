import { createContext, useContext, useState, ReactNode } from 'react'

type Toast = { id: number; msg: string; type: 'success' | 'error' }
const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, set] = useState<Toast[]>([])
  const push = (t: Omit<Toast, 'id'>) =>
    set(l => [...l, { ...t, id: Date.now() }])
  const remove = (id: number) => set(l => l.filter(t => t.id !== id))

  return (
    <ToastCtx.Provider value={push}>
      {children}
      {/* container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {list.map(t => (
          <ToastItem key={t.id} {...t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)

import { Transition } from '@headlessui/react'
import { useEffect, Fragment } from 'react'
function ToastItem({
  id, msg, type, onDone,
}: Toast & { onDone: () => void }) {
  useEffect(() => {
    const h = setTimeout(onDone, 3000)
    return () => clearTimeout(h)
  }, [id])
  return (
    <Transition
      appear
      as={Fragment}
      show
      enter="transition ease-out duration-100"
      enterFrom="translate-y-4 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`px-4 py-2 rounded shadow text-white ${
          type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        {msg}
      </div>
    </Transition>
  )
}

