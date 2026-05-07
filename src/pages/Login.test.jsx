import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { useSignInMutation } from '~/store/apis/authSlice'
import { setCredentials } from '~/store/slices/authSlice'

// Mock hooks
vi.mock('~/store/apis/authSlice', () => ({
  useSignInMutation: vi.fn(),
}))

vi.mock('~/store/slices/authSlice', () => ({
  ...vi.importActual('~/store/slices/authSlice'),
  setCredentials: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}))

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { accessToken: null, userInfo: null }) => state,
    },
    preloadedState,
  })
}

describe('Login Component', () => {
  let signInMock
  let store

  beforeEach(() => {
    signInMock = vi.fn()
    useSignInMutation.mockReturnValue([signInMock])
    store = createTestStore()
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByLabelText(/auth.email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/auth.password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /auth.login_page.loginButton/i })).toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    )

    const passwordInput = screen.getByLabelText(/auth.password/i)
    const toggleButton = screen.getByRole('button', { name: /auth.togglePasswordVisibility/i })

    // Initially type password
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('handles successful login', async () => {
    const mockResponse = {
      data: {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        sessionId: 'session-789',
        user: { _id: '123', email: 'test@example.com' },
      },
    }
    signInMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(mockResponse),
    })

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    )

    fireEvent.change(screen.getByLabelText(/auth.email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/auth.password/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /auth.login_page.loginButton/i }))

    await waitFor(() => {
      expect(signInMock().unwrap).toHaveBeenCalled()
      expect(setCredentials).toHaveBeenCalledWith({
        user: mockResponse.data.user,
        accessToken: mockResponse.data.accessToken,
        refreshToken: mockResponse.data.refreshToken,
        sessionId: mockResponse.data.sessionId,
      })
    })
  })

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials'
    signInMock.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        data: { message: errorMessage },
      }),
    })

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    )

    fireEvent.change(screen.getByLabelText(/auth.email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/auth.password/i), {
      target: { value: 'wrong-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: /auth.login_page.loginButton/i }))

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })
})
