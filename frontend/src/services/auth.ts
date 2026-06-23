const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed')
      }

      const authData = data.data as AuthResponse
      if (authData.accessToken) {
        this.saveSession(authData)
      }
      return authData
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Failed to connect to authentication server. Please check if the backend is running.')
      }
      throw error
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed')
      }

      const authData = data.data as AuthResponse
      this.saveSession(authData)
      return authData
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Failed to connect to authentication server. Please check if the backend is running.')
      }
      throw error
    }
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('accessToken')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (err) {
        console.warn('⚠️ Failed to sign out from backend:', err)
      }
    }
  },

  async getMe(): Promise<User> {
    const token = localStorage.getItem('accessToken')
    if (!token) throw new Error('No access token found')

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch user profile')
    }

    return data.data as User
  },

  saveSession(data: AuthResponse) {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
  },
}
