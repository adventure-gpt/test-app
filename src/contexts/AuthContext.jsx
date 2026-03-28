import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser'
import { createContext, useContext, useEffect, useState } from 'react'

import { apiRequest } from '../lib/api'

const AuthContext = createContext(null)

function getMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)
  const [passkeys, setPasskeys] = useState([])
  const [recoveryKeys, setRecoveryKeys] = useState([])
  const [showRecoveryKeys, setShowRecoveryKeys] = useState(false)
  const [recoveryPrompt, setRecoveryPrompt] = useState(false)
  const [webAuthnSupported, setWebAuthnSupported] = useState(false)
  const [platformPasskeyReady, setPlatformPasskeyReady] = useState(false)

  useEffect(() => {
    const supported = browserSupportsWebAuthn()
    setWebAuthnSupported(supported)

    if (supported) {
      platformAuthenticatorIsAvailable()
        .then((available) => {
          setPlatformPasskeyReady(available)
        })
        .catch(() => {
          setPlatformPasskeyReady(false)
        })
    }

    refreshSession()
  }, [])

  async function refreshSession() {
    try {
      const data = await apiRequest('/api/auth/me')
      setUser(data.user)
      setPasskeys(data.passkeys || [])
    } catch {
      setUser(null)
      setPasskeys([])
    } finally {
      setStatus('ready')
    }
  }

  async function loadPasskeys() {
    const data = await apiRequest('/api/auth/passkeys')
    setPasskeys(data.passkeys || [])
    return data.passkeys || []
  }

  async function register(email) {
    const optionsData = await apiRequest('/api/auth/register-options', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    const response = await startRegistration({
      optionsJSON: optionsData.options,
    })

    const verification = await apiRequest('/api/auth/register-verify', {
      method: 'POST',
      body: JSON.stringify({
        email,
        mode: 'register',
        response,
      }),
    })

    setUser(verification.user)
    setPasskeys(verification.passkeys || [])
    setRecoveryKeys(verification.recoveryKeys || [])
    setShowRecoveryKeys(Boolean(verification.recoveryKeys?.length))
    setRecoveryPrompt(false)

    return verification
  }

  async function loginWithPasskey() {
    const optionsData = await apiRequest('/api/auth/login-options', {
      method: 'POST',
    })

    const response = await startAuthentication({
      optionsJSON: optionsData.options,
    })

    const verification = await apiRequest('/api/auth/login-verify', {
      method: 'POST',
      body: JSON.stringify({ response }),
    })

    setUser(verification.user)
    setRecoveryPrompt(false)
    await loadPasskeys()
    return verification
  }

  async function loginWithRecoveryKey(email, recoveryKey) {
    const data = await apiRequest('/api/auth/recovery-login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        recoveryKey,
      }),
    })

    setUser(data.user)
    setRecoveryPrompt(Boolean(data.promptAddPasskey))
    await loadPasskeys()
    return data
  }

  async function addPasskey() {
    const optionsData = await apiRequest('/api/auth/register-options', {
      method: 'POST',
      body: JSON.stringify({ mode: 'add' }),
    })

    const response = await startRegistration({
      optionsJSON: optionsData.options,
    })

    const verification = await apiRequest('/api/auth/register-verify', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'add',
        response,
      }),
    })

    setUser(verification.user)
    setRecoveryPrompt(false)
    await loadPasskeys()
    return verification
  }

  async function regenerateRecoveryKeys() {
    const data = await apiRequest('/api/auth/recovery-keys', {
      method: 'POST',
    })

    setRecoveryKeys(data.recoveryKeys || [])
    setShowRecoveryKeys(Boolean(data.recoveryKeys?.length))
    return data
  }

  async function logout() {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      })
    } finally {
      setUser(null)
      setPasskeys([])
      setRecoveryPrompt(false)
      setShowRecoveryKeys(false)
      setRecoveryKeys([])
    }
  }

  const value = {
    status,
    user,
    passkeys,
    recoveryKeys,
    showRecoveryKeys,
    recoveryPrompt,
    webAuthnSupported,
    platformPasskeyReady,
    refreshSession,
    register: async (email) => {
      try {
        return await register(email)
      } catch (error) {
        throw new Error(getMessage(error, 'We could not create your account just yet.'))
      }
    },
    loginWithPasskey: async () => {
      try {
        return await loginWithPasskey()
      } catch (error) {
        throw new Error(getMessage(error, 'We could not sign you in with a passkey.'))
      }
    },
    loginWithRecoveryKey: async (email, recoveryKey) => {
      try {
        return await loginWithRecoveryKey(email, recoveryKey)
      } catch (error) {
        throw new Error(getMessage(error, 'We could not use that recovery key.'))
      }
    },
    addPasskey: async () => {
      try {
        return await addPasskey()
      } catch (error) {
        throw new Error(getMessage(error, 'We could not add that passkey.'))
      }
    },
    regenerateRecoveryKeys: async () => {
      try {
        return await regenerateRecoveryKeys()
      } catch (error) {
        throw new Error(getMessage(error, 'We could not create fresh recovery keys.'))
      }
    },
    loadPasskeys,
    logout,
    closeRecoveryKeys() {
      setShowRecoveryKeys(false)
    },
    dismissRecoveryPrompt() {
      setRecoveryPrompt(false)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
