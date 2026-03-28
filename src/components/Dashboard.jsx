import { motion } from 'framer-motion'
import {
  ArrowRight,
  Compass,
  LogOut,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { useAuth } from '../contexts/AuthContext'
import { apiRequest } from '../lib/api'
import { featureCards, sampleBuilds } from '../lib/demoContent'
import { IdeasPanel } from './IdeasPanel'
import { SettingsPanel } from './SettingsPanel'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'ideas', label: 'Idea board' },
  { id: 'settings', label: 'Settings' },
]

export function Dashboard({ isDark, isOnline, toggleTheme }) {
  const {
    user,
    passkeys,
    recoveryPrompt,
    platformPasskeyReady,
    addPasskey,
    dismissRecoveryPrompt,
    loadPasskeys,
    regenerateRecoveryKeys,
    logout,
  } = useAuth()
  const [activeView, setActiveView] = useState('overview')
  const [ideas, setIdeas] = useState([])
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true)
  const [bannerMessage, setBannerMessage] = useState('')

  useEffect(() => {
    loadIdeas()
  }, [])

  async function loadIdeas() {
    setIsLoadingIdeas(true)

    try {
      const data = await apiRequest('/api/ideas')
      setIdeas(data.ideas || [])
    } catch (error) {
      setBannerMessage(error.message)
    } finally {
      setIsLoadingIdeas(false)
    }
  }

  async function createIdea(nextIdea) {
    const data = await apiRequest('/api/ideas', {
      method: 'POST',
      body: JSON.stringify(nextIdea),
    })

    setIdeas((currentIdeas) => [data.idea, ...currentIdeas])
    setActiveView('ideas')
    return data.idea
  }

  async function setIdeaStatus(ideaId, nextStatus) {
    const data = await apiRequest(`/api/ideas/${ideaId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus }),
    })

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) => (idea.id === ideaId ? data.idea : idea)),
    )
  }

  async function deleteIdea(ideaId) {
    await apiRequest(`/api/ideas/${ideaId}`, {
      method: 'DELETE',
    })

    setIdeas((currentIdeas) => currentIdeas.filter((idea) => idea.id !== ideaId))
  }

  async function addPasskeyFromPrompt() {
    try {
      await addPasskey()
      setBannerMessage('A new passkey was added for this account.')
    } catch (error) {
      setBannerMessage(error.message)
    }
  }

  const readyIdeas = ideas.filter((idea) => idea.status === 'ready').length
  const inMotionIdeas = ideas.filter((idea) => idea.status === 'taking-shape').length

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[32px] border border-stone-200/80 bg-white/88 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/78">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-teal-700 text-white shadow-lg shadow-teal-900/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                  Studio Pilot
                </p>
                <h1 className="font-display text-3xl font-semibold text-stone-950 dark:text-white">
                  Welcome back, {user.email}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? 'Light look' : 'Dark look'}
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeView === item.id
                    ? 'bg-teal-700 text-white'
                    : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {!isOnline ? (
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
            You&apos;re offline right now. Your data will be here when you reconnect.
          </div>
        ) : null}

        {bannerMessage ? (
          <div className="rounded-[28px] border border-stone-200 bg-white px-5 py-4 text-sm text-stone-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
            {bannerMessage}
          </div>
        ) : null}

        {recoveryPrompt ? (
          <div className="rounded-[32px] border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-amber-50 px-6 py-5 shadow-sm dark:border-teal-400/20 dark:from-teal-500/10 dark:via-slate-950 dark:to-amber-500/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-200">
                  Faster next time
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-stone-950 dark:text-white">
                  Add a passkey on this device
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 dark:text-slate-300">
                  You signed in with a recovery key. Add a passkey here so the next sign-in can be
                  one quick tap.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={addPasskeyFromPrompt}
                  className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
                >
                  Add passkey now
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={dismissRecoveryPrompt}
                  className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeView === 'overview' ? (
          <div className="space-y-6">
            <motion.section
              className="overflow-hidden rounded-[36px] border border-white/50 bg-slate-950 px-6 py-7 text-white shadow-[0_32px_80px_rgba(15,23,42,0.22)] sm:px-8 sm:py-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-teal-100">
                    <Compass className="h-4 w-4" />
                    Your test website
                  </div>
                  <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
                    A polished demo showing private sign-in, saved ideas, and a calm dashboard
                    experience.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                    This is a working sample of the kind of site I can build for you. It looks
                    finished, keeps things organized, and turns simple requests into something you
                    can actually use.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveView('ideas')}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
                    >
                      Open your idea board
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('settings')}
                      className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/88 transition-colors hover:bg-white/10"
                    >
                      Review sign-in settings
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Saved ideas
                    </p>
                    <p className="mt-3 font-display text-4xl font-semibold">{ideas.length}</p>
                    <p className="mt-2 text-sm text-white/68">
                      Private idea cards tied to your account.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Taking shape
                    </p>
                    <p className="mt-3 font-display text-4xl font-semibold">{inMotionIdeas}</p>
                    <p className="mt-2 text-sm text-white/68">
                      Ideas already moving beyond the rough sketch stage.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Ready to build
                    </p>
                    <p className="mt-3 font-display text-4xl font-semibold">{readyIdeas}</p>
                    <p className="mt-2 text-sm text-white/68">
                      Concepts that feel clear enough to turn into a full site next.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((card) => {
                const Icon = card.icon

                return (
                  <article
                    key={card.title}
                    className={`rounded-[32px] border border-stone-200/80 bg-gradient-to-br ${card.tone} p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                      {card.eyebrow}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-stone-950 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-slate-300">
                      {card.description}
                    </p>
                  </article>
                )
              })}
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
              <section className="rounded-[32px] border border-stone-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/78">
                <h3 className="font-display text-3xl font-semibold text-stone-950 dark:text-white">
                  What I can turn into a site
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
                  These are the kinds of personal and practical projects this setup is ready to grow
                  into next.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {sampleBuilds.map((build) => (
                    <article
                      key={build.name}
                      className="rounded-[28px] border border-stone-200/80 bg-stone-50/90 p-5 dark:border-white/10 dark:bg-slate-900/80"
                    >
                      <h4 className="font-display text-2xl font-semibold text-stone-950 dark:text-white">
                        {build.name}
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-slate-300">
                        {build.note}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-stone-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/78">
                <h3 className="font-display text-3xl font-semibold text-stone-950 dark:text-white">
                  Your snapshot right now
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
                  A quick read on where your saved ideas and sign-in setup stand today.
                </p>

                <div className="mt-6 space-y-4">
                  {[
                    {
                      label: 'Saved passkeys',
                      value: passkeys.length,
                      note: platformPasskeyReady
                        ? 'This device looks ready for smooth passkey sign-in.'
                        : 'Another device or key may be needed for passkeys here.',
                    },
                    {
                      label: 'Ideas taking shape',
                      value: inMotionIdeas,
                      note: 'These are the concepts already moving toward a clearer structure.',
                    },
                    {
                      label: 'Ready-to-build ideas',
                      value: readyIdeas,
                      note: 'These feel mature enough to become full website directions.',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[28px] border border-stone-200/80 bg-stone-50/90 p-5 dark:border-white/10 dark:bg-slate-900/80"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                        {item.label}
                      </p>
                      <div className="mt-3 flex items-end gap-3">
                        <span className="font-display text-4xl font-semibold text-stone-950 dark:text-white">
                          {item.value}
                        </span>
                        <span className="mb-1 text-sm text-stone-500 dark:text-slate-400">
                          total
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-slate-300">
                        {item.note}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {activeView === 'ideas' ? (
          <IdeasPanel
            ideas={ideas}
            isLoading={isLoadingIdeas}
            onCreateIdea={createIdea}
            onDeleteIdea={deleteIdea}
            onSetIdeaStatus={setIdeaStatus}
          />
        ) : null}

        {activeView === 'settings' ? (
          <SettingsPanel
            passkeys={passkeys}
            platformPasskeyReady={platformPasskeyReady}
            onAddPasskey={addPasskey}
            onRefreshPasskeys={loadPasskeys}
            onRegenerateRecoveryKeys={regenerateRecoveryKeys}
          />
        ) : null}
      </div>
    </div>
  )
}
