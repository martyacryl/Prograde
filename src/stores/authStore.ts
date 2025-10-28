import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  teamId: string | null
  team?: {
    id: string
    name: string
    abbreviation: string
    level: string
  } | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface TeamData {
  name: string
  abbreviation: string
  level: string
  conference?: string
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, teamData?: TeamData) => Promise<boolean>
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  forceRefresh: () => void
}

type AuthStore = AuthState & AuthActions

// Get API base URL
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:3000'
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (data.success && data.user && data.token) {
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
            return true
          } else {
            set({
              error: data.error || 'Login failed',
              isLoading: false
            })
            return false
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          })
          return false
        }
      },

      signup: async (name: string, email: string, password: string, teamData?: TeamData) => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch(`${getApiBaseUrl()}/api/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, teamData }),
          })

          const data = await response.json()

          if (data.success && data.user && data.token) {
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
            return true
          } else {
            set({
              error: data.error || 'Signup failed',
              isLoading: false
            })
            return false
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Signup failed',
            isLoading: false
          })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      clearError: () => {
        set({ error: null })
      },

      forceRefresh: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isLoading: false
        })
        localStorage.removeItem('auth-storage')
        sessionStorage.clear()
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      initialize: async () => {
        const { token } = get()
        if (!token) return

        try {
          const response = await fetch(`${getApiBaseUrl()}/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          })

          if (response.ok) {
            const data = await response.json()
            set({
              user: data.user,
              isAuthenticated: true
            })
          } else {
            // Token is invalid, clear it
            set({
              user: null,
              token: null,
              isAuthenticated: false
            })
          }
        } catch (error) {
          // Token verification failed, clear it
          set({
            user: null,
            token: null,
            isAuthenticated: false
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const state = useAuthStore.getState()
  const token = state.token
  
  const apiUrl = getApiBaseUrl()
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}
