import { KeyRound, RefreshCcw, ShieldCheck, Smartphone } from 'lucide-react'
import { useState } from 'react'

function formatDate(value) {
  if (!value) {
    return 'Just added'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function SettingsPanel({
  passkeys,
  platformPasskeyReady,
  onAddPasskey,
  onRefreshPasskeys,
  onRegenerateRecoveryKeys,
}) {
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')

  async function runAction(actionName, task, successMessage) {
    setBusy(actionName)
    setMessage('')

    try {
      await task()
      setMessage(successMessage)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[32px] border border-stone-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/78">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800 dark:bg-teal-500/10 dark:text-teal-100">
          <ShieldCheck className="h-4 w-4" />
          Account security
        </div>

        <h2 className="mt-4 font-display text-3xl font-semibold text-stone-950 dark:text-white">
          Passkeys and recovery
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600 dark:text-slate-300">
          Keep your sign-in smooth by saving a passkey on the device you use most. Recovery keys are
          the backup plan if you ever lose access to your passkey.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              runAction(
                'add-passkey',
                onAddPasskey,
                'A new passkey was added for this account.',
              )
            }
            className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
          >
            <KeyRound className="h-4 w-4" />
            {busy === 'add-passkey' ? 'Adding passkey...' : 'Add passkey to this device'}
          </button>

          <button
            type="button"
            onClick={() =>
              runAction(
                'recovery-keys',
                onRegenerateRecoveryKeys,
                'Fresh recovery keys are ready. Save the new set now.',
              )
            }
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <RefreshCcw className="h-4 w-4" />
            {busy === 'recovery-keys' ? 'Making fresh keys...' : 'Generate fresh recovery keys'}
          </button>

          <button
            type="button"
            onClick={() =>
              runAction(
                'refresh-passkeys',
                onRefreshPasskeys,
                'Your saved passkeys list is up to date.',
              )
            }
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <RefreshCcw className="h-4 w-4" />
            {busy === 'refresh-passkeys' ? 'Refreshing...' : 'Refresh passkey list'}
          </button>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
            {message}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {passkeys.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center dark:border-white/10 dark:bg-slate-900">
              <h3 className="font-display text-2xl font-semibold text-stone-950 dark:text-white">
                No passkeys listed yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
                Add a passkey on this device so the next sign-in can be a quick tap instead of
                typing anything.
              </p>
            </div>
          ) : (
            passkeys.map((passkey) => (
              <article
                key={passkey.id}
                className="rounded-[28px] border border-stone-200/80 bg-stone-50/85 p-5 dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-stone-950 dark:text-white">
                      {passkey.label}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
                      {passkey.deviceType === 'singleDevice'
                        ? 'Saved on one device'
                        : 'Can travel across synced devices'}
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-500/10 dark:text-teal-100">
                    {passkey.transports?.includes('internal') ? 'Built into device' : 'External or shared'}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                      Added
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-white">
                      {formatDate(passkey.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                      Last used
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-white">
                      {formatDate(passkey.lastUsedAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                      Backup
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-white">
                      {passkey.backedUp ? 'Backed up' : 'Not backed up'}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[32px] border border-stone-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/78">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-100">
          <Smartphone className="h-4 w-4" />
          Phone-friendly setup
        </div>

        <h2 className="mt-4 font-display text-3xl font-semibold text-stone-950 dark:text-white">
          Built to feel handy
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
          This demo works in a normal browser tab and can also be added to a phone home screen. If
          you go offline, your last-loaded screens stay available with a friendly notice.
        </p>

        <div className="mt-6 space-y-4 rounded-[28px] bg-stone-100/80 p-5 dark:bg-slate-900/80">
          <div className="rounded-[24px] bg-white p-4 dark:bg-slate-950">
            <p className="text-sm font-semibold text-stone-900 dark:text-white">This device</p>
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">
              {platformPasskeyReady
                ? 'This device looks ready for a smooth built-in passkey experience.'
                : 'A built-in passkey may not be ready here, but another passkey device can still work.'}
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-4 dark:bg-slate-950">
            <p className="text-sm font-semibold text-stone-900 dark:text-white">What this shows</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-stone-600 dark:text-slate-300">
              <li>Private sign-in that feels fast instead of fussy.</li>
              <li>Saved app data tied to your own account.</li>
              <li>Installable app behavior without losing the normal website version.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
