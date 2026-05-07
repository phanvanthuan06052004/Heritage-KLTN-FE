import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userInfo: (() => {
    const storedUserInfo = localStorage.getItem('userInfo')
    return storedUserInfo ? JSON.parse(storedUserInfo)?.user : null
  })(),
  accessToken: (() => {
    const storedAccessToken = localStorage.getItem('accessToken')
    return storedAccessToken ? JSON.parse(storedAccessToken).token : null
  })(),
  refreshToken: (() => {
    const storedRefreshToken = localStorage.getItem('refreshToken')
    return storedRefreshToken ? JSON.parse(storedRefreshToken).token : null
  })(),
  sessionId: (() => {
    const storedSessionId = localStorage.getItem('sessionId')
    return storedSessionId ? JSON.parse(storedSessionId).sessionId : null
  })(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken, sessionId } = action.payload
      state.userInfo = user
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.sessionId = sessionId

      const expires = new Date().getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days
      localStorage.setItem('userInfo', JSON.stringify({ user, expires }))
      localStorage.setItem('accessToken', JSON.stringify({ token: accessToken, expires }))
      localStorage.setItem('refreshToken', JSON.stringify({ token: refreshToken, expires }))
      localStorage.setItem('sessionId', JSON.stringify({ sessionId, expires }))
    },
    setAccessToken: (state, action) => {
      const { accessToken } = action.payload
      state.accessToken = accessToken
      const storedAccessToken = localStorage.getItem('accessToken')
      if (storedAccessToken) {
        const parsed = JSON.parse(storedAccessToken)
        parsed.token = accessToken
        localStorage.setItem('accessToken', JSON.stringify(parsed))
      }
    },
    setUser: (state, action) => {
      state.userInfo = action.payload
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo)
        parsedUserInfo.user = action.payload
        localStorage.setItem('userInfo', JSON.stringify(parsedUserInfo))
      }
    },
    logOut: (state) => {
      state.userInfo = null
      state.accessToken = null
      state.refreshToken = null
      state.sessionId = null
      localStorage.removeItem('userInfo')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('sessionId')
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
