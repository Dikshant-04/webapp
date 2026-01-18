import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, userAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      const savedUser = localStorage.getItem('user')

      if (token && savedUser) {
        try {
          // Verify token by fetching current user
          const response = await userAPI.getMe()
          setUser(response.data)
          localStorage.setItem('user', JSON.stringify(response.data))
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { access, refresh, user: userData } = response.data

      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(userData))

      setUser(userData)
      toast.success('Login successful!')

      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin')
      } else if (userData.role === 'staff') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please check your credentials.'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (data) => {
    try {
      const response = await authAPI.register(data)
      const { tokens, user: userData } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      localStorage.setItem('user', JSON.stringify(userData))

      setUser(userData)
      toast.success('Registration successful!')
      navigate('/')

      return { success: true }
    } catch (error) {
      const errors = error.response?.data
      let message = 'Registration failed.'

      if (errors) {
        if (typeof errors === 'string') {
          message = errors
        } else {
          message = Object.values(errors).flat().join(' ')
        }
      }

      toast.error(message)
      return { success: false, error: errors }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
      toast.success('Logged out successfully')
      navigate('/login')
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!user) return false
    if (typeof roles === 'string') {
      return user.role === roles
    }
    return roles.includes(user.role)
  }

  const isAdmin = () => hasRole('admin')
  const isStaff = () => hasRole(['staff', 'admin'])
  const isAuthenticated = () => !!user

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isStaff,
    isAuthenticated,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
