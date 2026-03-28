import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function RecoveryKeysDialog({ open, recoveryKeys, onClose }) {
  const [copied, setCopied] = useState(false)

  async function handleCopyAll() {
    await navigator.clipboard.writeText(recoveryKeys.join('\n'))
    setCopied(true)
    window.setTimeout(() => {
      setCopied(false)
    }, 1800)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl rounded-[28px] border border-white/15 bg-white p-6 shadow-2xl dark:bg-slate-950"
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 14, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  Save these now
                </div>
                <div>
                  <h2 className="font-display text-3xl font-semibold text-stone-950 dark:text-white">
                    Your recovery keys
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-stone-600 dark:text-slate-300">
                    These are shown only once. Save them somewhere safe before closing this window.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                I saved them
              </button>
            </div>

            <div className="mt-6 grid gap-3 rounded-[24px] bg-stone-950 p-5 text-stone-50 sm:grid-cols-2 dark:bg-slate-900">
              {recoveryKeys.map((key) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-center font-mono text-lg tracking-[0.28em]"
                >
                  {key}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-500 dark:text-slate-400">
                One key works once. Making fresh keys later will replace this set.
              </p>

              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy all'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
