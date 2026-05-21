import { createSlice } from '@reduxjs/toolkit'

const AUTH_STORAGE_TTL = 30 * 24 * 60 * 60 * 1000

const safeParseStorage = (key) => {
  try {
    const value = localStorage.getItem(key)
    if (!value) return null

    const parsed = JSON.parse(value)
    if (parsed?.expires && parsed.expires < Date.now()) {
      localStorage.removeItem(key)
      return null
    }

    return parsed
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

const normalizeUser = (user) => {
  if (!user) return null

  const safeUser = { ...user }
  delete safeUser.password
  delete safeUser.isActiveUser

  const id = user.id || user._id
  const email = user.email || user.account?.email || null
  const displayname = user.displayname || user.displayName || email?.split('@')[0] || 'User'

  return {
    ...safeUser,
    id,
    _id: id,
    email,
    displayname,
    account: {
      ...user.account,
      email,
      isActive: user.account?.isActive ?? user.isActive,
    },
  }
}

const clearAuthStorage = () => {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('sessionId')
}

const persistAuth = ({ user, accessToken, refreshToken, sessionId }) => {
  const expires = Date.now() + AUTH_STORAGE_TTL

  if (!user || !accessToken || !refreshToken || !sessionId) {
    clearAuthStorage()
    return
  }

  localStorage.setItem('userInfo', JSON.stringify({ user, expires }))
  localStorage.setItem('accessToken', JSON.stringify({ token: accessToken, expires }))
  localStorage.setItem('refreshToken', JSON.stringify({ token: refreshToken, expires }))
  localStorage.setItem('sessionId', JSON.stringify({ sessionId, expires }))
}

const initialState = {
  userInfo: (() => {
    const storedUserInfo = safeParseStorage('userInfo')
    const normalizedUser = normalizeUser(storedUserInfo?.user)

    if (storedUserInfo && normalizedUser) {
      localStorage.setItem(
        'userInfo',
        JSON.stringify({ ...storedUserInfo, user: normalizedUser }),
      )
    }

    return normalizedUser
  })(),
  accessToken: (() => {
    const storedAccessToken = safeParseStorage('accessToken')
    return storedAccessToken?.token || null
  })(),
  refreshToken: (() => {
    const storedRefreshToken = safeParseStorage('refreshToken')
    return storedRefreshToken?.token || null
  })(),
  sessionId: (() => {
    const storedSessionId = safeParseStorage('sessionId')
    return storedSessionId?.sessionId || null
  })(),
}

if (
  initialState.refreshToken &&
  (!initialState.userInfo || !initialState.accessToken || !initialState.sessionId)
) {
  clearAuthStorage()
  initialState.userInfo = null
  initialState.accessToken = null
  initialState.refreshToken = null
  initialState.sessionId = null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const authData = action.payload?.data || action.payload || {}
      const { user, accessToken, refreshToken, sessionId } = authData
      const normalizedUser = normalizeUser(user)

      state.userInfo = normalizedUser
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.sessionId = sessionId

      persistAuth({ user: normalizedUser, accessToken, refreshToken, sessionId })
    },
    setAccessToken: (state, action) => {
      const { accessToken } = action.payload?.data || action.payload || {}
      if (!accessToken) return

      state.accessToken = accessToken

      const storedAccessToken = safeParseStorage('accessToken') || {}
      localStorage.setItem(
        'accessToken',
        JSON.stringify({
          ...storedAccessToken,
          token: accessToken,
          expires: storedAccessToken.expires || Date.now() + AUTH_STORAGE_TTL,
        }),
      )
    },
    setUser: (state, action) => {
      const normalizedUser = normalizeUser(action.payload)
      state.userInfo = normalizedUser

      const storedUserInfo = safeParseStorage('userInfo') || {}
      localStorage.setItem(
        'userInfo',
        JSON.stringify({
          ...storedUserInfo,
          user: normalizedUser,
          expires: storedUserInfo.expires || Date.now() + AUTH_STORAGE_TTL,
        }),
      )
    },
    logOut: (state) => {
      state.userInfo = null
      state.accessToken = null
      state.refreshToken = null
      state.sessionId = null
      clearAuthStorage()
    },
  },
})

export const { setCredentials, setAccessToken, setUser, logOut } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.userInfo
export const selectCurrentAccessToken = (state) => state.auth.accessToken
export const selectCurrentRefreshToken = (state) => state.auth.refreshToken
export const selectCurrentSessionId = (state) => state.auth.sessionId
export const selectCurrentToken = (state) => state.auth.accessToken // Backward compatible
