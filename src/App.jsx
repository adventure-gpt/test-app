import { Sparkles } from 'lucide-react'

import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import { RecoveryKeysDialog } from './components/RecoveryKeysDialog'
import { useAuth } from './contexts/AuthContext'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useTheme } from './hooks/useTheme'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-[32px] border border-stone-200/80 bg-white/88 px-8 py-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/78">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg shadow-teal-900/20">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold text-stone-950 dark:text-white">
          Opening Studio Pilot
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-slate-300">
          Checking your sign-in and getting the dashboard ready.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const auth = useAuth()
  const isOnline = useOnlineStatus()
  const { isDark, toggleTheme } = useTheme()

  if (auth.status === 'loading') {
    return <LoadingScreen />
  }

  return (
    <>
      {auth.user ? (
        <Dashboard isDark={isDark} isOnline={isOnline} toggleTheme={toggleTheme} />
      ) : (
        <AuthScreen isDark={isDark} toggleTheme={toggleTheme} />
      )}

      <RecoveryKeysDialog
        open={auth.showRecoveryKeys}
        recoveryKeys={auth.recoveryKeys}
        onClose={auth.closeRecoveryKeys}
      />
    </>
  )
}
