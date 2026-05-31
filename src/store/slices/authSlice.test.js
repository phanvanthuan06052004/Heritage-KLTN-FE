import { configureStore } from '@reduxjs/toolkit'
import authSlice, {
  setCredentials,
  setAccessToken,
  logOut,
} from './authSlice'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('authSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    })
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should return initial state', () => {
    const state = store.getState().auth
    expect(state.userInfo).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.sessionId).toBeNull()
  })

  it('should handle setCredentials', () => {
    const user = { _id: '123', email: 'test@example.com' }
    const accessToken = 'access-token-123'
    const refreshToken = 'refresh-token-456'
    const sessionId = 'session-789'

    store.dispatch(setCredentials({ user, accessToken, refreshToken, sessionId }))

    const state = store.getState().auth
    // normalizeUser enriches the user shape; assert key fields instead of exact object
    expect(state.userInfo._id).toBe(user._id)
    expect(state.userInfo.email).toBe(user.email)
    expect(state.accessToken).toBe(accessToken)
    expect(state.refreshToken).toBe(refreshToken)
    expect(state.sessionId).toBe(sessionId)

    // Check localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'userInfo',
      expect.any(String)
    )
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'accessToken',
      expect.any(String)
    )
  })

  it('should handle setAccessToken', () => {
    // First set initial credentials
    store.dispatch(
      setCredentials({
        user: { _id: '123' },
        accessToken: 'old-access',
        refreshToken: 'refresh-123',
        sessionId: 'session-123',
      })
    )

    // Update access token
    store.dispatch(setAccessToken({ accessToken: 'new-access' }))

    const state = store.getState().auth
    expect(state.accessToken).toBe('new-access')
    expect(state.refreshToken).toBe('refresh-123')
  })

  it('should handle logOut', () => {
    // First set credentials
    store.dispatch(
      setCredentials({
        user: { _id: '123' },
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
        sessionId: 'session-123',
      })
    )

    // Logout
    store.dispatch(logOut())

    const state = store.getState().auth
    expect(state.userInfo).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.sessionId).toBeNull()

    expect(localStorage.removeItem).toHaveBeenCalledWith('userInfo')
    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken')
  })
})
