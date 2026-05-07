import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Button } from '~/components/common/ui/Button'
import { useVerifyOtpMutation, useResendOtpMutation } from '~/store/apis/authSlice'
import { setCredentials } from '~/store/slices/authSlice'

const AuthenConfirm = () => {
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMessage, setResendMessage] = useState(null)

  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''

  const [verifyOtp] = useVerifyOtpMutation()
  const [resendOtp] = useResendOtpMutation()
  const authToken = location.state?.authToken
  const dispatch = useDispatch()

  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!/^\d{6}$/.test(code)) {
      setError('OTP must be 6 digits.')
      toast.error('OTP must be 6 digits.')
      setIsLoading(false)
      return
    }

    try {
      const response = await verifyOtp({
        token: authToken,
        otpCode: code
      }).unwrap()

      // BE returns { data: { accessToken, refreshToken, sessionId, user } }
      const { accessToken, refreshToken, sessionId, user } = response.data

      dispatch(setCredentials({ user, accessToken, refreshToken, sessionId }))
      toast.success('Email verification successful! Logged in.')
      navigate('/')
    } catch (err) {
      const errorMessage = err?.data?.message || 'Verification failed. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Verify OTP error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setError(null)
    setResendMessage(null)
    setIsLoading(true)

    try {
      await resendOtp({ token: authToken }).unwrap()
      setResendMessage('A new OTP has been sent.')
      toast.success('A new OTP has been sent to your email.')
      setResendCooldown(60)
    } catch (err) {
      const errorMessage = err?.data?.message || 'Failed to resend OTP. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Resend OTP error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!email || !authToken) {
    navigate('/register')
    return null
  }

  return (
    <div className='flex items-center justify-center sm:px-4 py-12 mt-navbar-mobile sm:mt-navbar'>
      <div className='max-w-md w-full animate-fade-up'>
        <div className='border shadow-lg rounded-lg border-heritage-light/50 bg-card text-card-foreground'>
          <div className='text-center p-6 space-y-1'>
            <h3 className='text-xl sm:text-2xl text-heritage-dark font-bold tracking-tight'>Email Verification</h3>
            <p className='text-sm text-muted-foreground'>
              Enter the 6-digit OTP sent to <strong>{email}</strong>
            </p>
          </div>
          <div className='p-6 pt-0'>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {error && <div className='text-red-500 text-sm text-center'>{error}</div>}
              {resendMessage && <div className='text-green-500 text-sm text-center'>{resendMessage}</div>}
              <div className='space-y-2'>
                <label htmlFor='code' className='text-sm font-medium'>
                  Verification Code
                </label>
                <input
                  type='text'
                  id='code'
                  name='code'
                  required
                   placeholder='Enter 6-digit OTP...'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={8}
                  className='w-full h-10 px-3 py-2 rounded-md border focus:ring-2 focus:ring-heritage focus:outline-none focus:border-none placeholder:text-muted-foreground text-sm'
                />
              </div>
              <Button type='submit' disabled={isLoading} className='w-full'>
                {isLoading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                    Processing...
                  </div>
                ) : (
                  <span>Verify</span>
                )}
              </Button>
            </form>
            <div className='text-center pt-4 text-sm'>
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                className={`text-heritage hover:underline ${
                  resendCooldown > 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Resend code {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthenConfirm
