import { Lightbulb, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ideaCategories, starterIdeas, statusMeta } from '../lib/demoContent'

const BLANK_FORM = {
  title: '',
  summary: '',
  category: ideaCategories[0],
  status: 'fresh',
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function IdeasPanel({ ideas, isLoading, onCreateIdea, onDeleteIdea, onSetIdeaStatus }) {
  const [form, setForm] = useState(BLANK_FORM)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      await onCreateIdea(form)
      setForm(BLANK_FORM)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleQuickStart(idea) {
    setBusy(true)
    setMessage('')

    try {
      await onCreateIdea(idea)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(ideaId) {
    setMessage('')

    try {
      await onDeleteIdea(ideaId)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleStatusChange(ideaId, nextStatus) {
    setMessage('')

    try {
      await onSetIdeaStatus(ideaId, nextStatus)
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[32px] border border-stone-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/78">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800 dark:bg-teal-500/10 dark:text-teal-100">
          <Plus className="h-4 w-4" />
          Save a new idea
        </div>

        <h2 className="mt-4 font-display text-3xl font-semibold text-stone-950 dark:text-white">
          Start something worth building
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-stone-600 dark:text-slate-300">
          Drop in a rough idea, a quick note about what it should do, and a general category. This
          board keeps everything private to your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700 dark:text-slate-200">
              Title
            </span>
            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  title: event.target.value,
                }))
              }
              placeholder="Home pet care tracker"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700 dark:text-slate-200">
              Short note
            </span>
            <textarea
              value={form.summary}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  summary: event.target.value,
                }))
              }
              placeholder="A calm dashboard for meals, routines, and reminders."
              rows={4}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700 dark:text-slate-200">
              Category
            </span>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  category: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
            >
              {ideaCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-200"
          >
            <Plus className="h-4 w-4" />
            {busy ? 'Saving your idea...' : 'Save idea'}
          </button>
        </form>

        {message ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
            {message}
          </div>
        ) : null}

        <div className="mt-6 rounded-[28px] bg-stone-100/80 p-4 dark:bg-slate-900/80">
          <p className="text-sm font-semibold text-stone-900 dark:text-white">Quick-start ideas</p>
          <div className="mt-3 grid gap-3">
            {starterIdeas.map((idea) => (
              <button
                key={idea.title}
                type="button"
                onClick={() => handleQuickStart(idea)}
                className="rounded-[24px] border border-stone-200 bg-white px-4 py-4 text-left transition hover:border-teal-200 hover:shadow-sm dark:border-white/10 dark:bg-slate-950 dark:hover:border-teal-400/30"
              >
                <p className="font-display text-lg font-semibold text-stone-950 dark:text-white">
                  {idea.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-slate-300">
                  {idea.summary}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-stone-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/78">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-semibold text-stone-950 dark:text-white">
              Your saved ideas
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
              Track what is brand new, what is taking shape, and what feels ready to turn into a
              full site.
            </p>
          </div>
          <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 dark:bg-slate-900 dark:text-slate-200">
            {ideas.length} saved
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
              Loading your saved ideas...
            </div>
          ) : ideas.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center dark:border-white/10 dark:bg-slate-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold text-stone-950 dark:text-white">
                No ideas saved yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
                Add your first idea on the left, or tap one of the quick-start options to fill this
                space with something useful right away.
              </p>
            </div>
          ) : (
            ideas.map((idea) => (
              <article
                key={idea.id}
                className="rounded-[28px] border border-stone-200/80 bg-stone-50/85 p-5 dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta[idea.status].badge}`}>
                        {statusMeta[idea.status].label}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                        {idea.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-stone-950 dark:text-white">
                        {idea.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 dark:text-slate-300">
                        {idea.summary}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(idea.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-stone-500 dark:text-slate-400">
                    Updated {formatDate(idea.updatedAt)}
                  </p>

                  <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700 dark:text-slate-200">
                    Stage
                    <select
                      value={idea.status}
                      onChange={(event) => handleStatusChange(idea.id, event.target.value)}
                      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-950 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="fresh">Just sparked</option>
                      <option value="taking-shape">Taking shape</option>
                      <option value="ready">Ready to build</option>
                    </select>
                  </label>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
