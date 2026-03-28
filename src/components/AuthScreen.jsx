import { motion } from 'framer-motion'
import {
  ArrowRight,
  Fingerprint,
  KeyRound,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '../contexts/AuthContext'
import { featureCards, workflowSteps } from '../lib/demoContent'

function SupportPill({ label }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
      {label}
    </span>
  )
}

export function AuthScreen({ isDark, toggleTheme }) {
  const {
    loginWithPasskey,
    loginWithRecoveryKey,
    register,
    webAuthnSupported,
    platformPasskeyReady,
  } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryKey, setRecoveryKey] = useState('')
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')

  async function handlePasskeyLogin() {
    setBusy('signin')
    setNotice('')

    try {
      await loginWithPasskey()
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy('')
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    setBusy('register')
    setNotice('')

    try {
      await register(email)
      setEmail('')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy('')
    }
  }

  async function handleRecoveryLogin(event) {
    event.preventDefault()
    setBusy('recovery')
    setNotice('')

    try {
      await loginWithRecoveryKey(recoveryEmail, recoveryKey)
      setRecoveryKey('')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-stone-200/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg shadow-teal-900/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-stone-950 dark:text-white">
                Studio Pilot
              </p>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                A private demo of what your website builder can do
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm backdrop-blur transition-colors hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? 'Light look' : 'Dark look'}
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.88fr]">
          <motion.section
            className="relative overflow-hidden rounded-[36px] border border-white/40 bg-slate-950 px-6 py-7 text-white shadow-[0_32px_80px_rgba(15,23,42,0.22)] sm:px-8 sm:py-9"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.32),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.22),transparent_26%)]" />
            <div className="relative">
              <div className="flex flex-wrap gap-2">
                <SupportPill label="Private sign-in" />
                <SupportPill label="Saved ideas" />
                <SupportPill label="Phone ready" />
              </div>

              <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
                This test site shows the kind of polished, private, useful website experience I can
                build for you.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/74 sm:text-lg">
                It is more than a brochure. You can sign in, save your own ideas, revisit them on
                another device, and use the app like a real personal tool.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {featureCards.slice(0, 3).map((card, index) => {
                  const Icon = card.icon

                  return (
                    <motion.article
                      key={card.title}
                      className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 + 0.12, duration: 0.34 }}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-teal-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
                        {card.eyebrow}
                      </p>
                      <h2 className="mt-2 font-display text-xl font-semibold">{card.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-white/68">{card.description}</p>
                    </motion.article>
                  )
                })}
              </div>

              <div className="mt-8 grid gap-4 rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-sm md:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="space-y-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-teal-200">
                      {index + 1}
                    </div>
                    <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm leading-6 text-white/68">{step.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            className="rounded-[36px] border border-stone-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/78"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800 dark:bg-teal-500/10 dark:text-teal-100">
              <ShieldCheck className="h-4 w-4" />
              Passkey sign-in
            </div>

            <div className="mt-4">
              <h2 className="font-display text-3xl font-semibold text-stone-950 dark:text-white">
                Step into the demo
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
                Use a passkey for the smoothest sign-in. If you already have backup keys, you can
                use one of those instead.
              </p>
            </div>

            <div className="mt-6 space-y-4 rounded-[28px] bg-stone-100/80 p-4 dark:bg-slate-900/80">
              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={busy === 'signin' || !webAuthnSupported}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-stone-400 dark:disabled:bg-slate-700"
              >
                <Fingerprint className="h-4 w-4" />
                {busy === 'signin' ? 'Signing you in...' : 'Sign in with Passkey'}
              </button>

              <div className="rounded-[24px] border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
                <p className="text-sm font-semibold text-stone-900 dark:text-white">
                  Browser check
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
                  {webAuthnSupported
                    ? platformPasskeyReady
                      ? 'This device looks ready for quick passkey sign-in.'
                      : 'Passkeys are supported here. A security key or another device may still work.'
                    : 'This browser does not support passkeys yet, so creating a new account will not work here.'}
                </p>
              </div>
            </div>

            {mode === 'register' ? (
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700 dark:text-slate-200">
                    Email address
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={busy === 'register' || !webAuthnSupported}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-200"
                >
                  {busy === 'register' ? 'Creating your account...' : 'Create account'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : null}

            {mode === 'recovery' ? (
              <form onSubmit={handleRecoveryLogin} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700 dark:text-slate-200">
                    Email address
                  </span>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(event) => setRecoveryEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700 dark:text-slate-200">
                    Recovery key
                  </span>
                  <input
                    type="text"
                    value={recoveryKey}
                    onChange={(event) => setRecoveryKey(event.target.value.toUpperCase())}
                    placeholder="ABCD1234EFGH5678"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 font-mono text-base uppercase tracking-[0.2em] text-stone-950 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={busy === 'recovery'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-200"
                >
                  <KeyRound className="h-4 w-4" />
                  {busy === 'recovery' ? 'Signing you in...' : 'Use recovery key'}
                </button>
              </form>
            ) : null}

            {notice ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
                {notice}
              </div>
            ) : null}

            <div className="mt-6 space-y-3 text-sm text-stone-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => {
                  setMode('recovery')
                  setNotice('')
                }}
                className="font-semibold text-teal-700 transition-colors hover:text-teal-600 dark:text-teal-300"
              >
                Use a recovery key instead
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setNotice('')
                  }}
                  className="font-semibold text-stone-900 transition-colors hover:text-stone-700 dark:text-white dark:hover:text-slate-200"
                >
                  New here? Create an account
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setNotice('')
                  }}
                  className="font-semibold text-stone-900 transition-colors hover:text-stone-700 dark:text-white dark:hover:text-slate-200"
                >
                  Back to passkey sign-in
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
