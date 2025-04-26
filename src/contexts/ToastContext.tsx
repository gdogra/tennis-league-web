"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Toast = { msg: string; type: "success" | "error" };

const ToastContext = createContext<(toast: Toast) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 20 }}
              className={`px-4 py-2 rounded shadow text-white ${
                toast.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {toast.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
