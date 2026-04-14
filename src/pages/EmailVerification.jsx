import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '~/components/common/ui/Button'
import { useSendVerificationEmailMutation, useVerifyEmailMutation } from '~/store/apis/mailSlice'

const AuthenConfirm = () => {
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMessage, setResendMessage] = useState(null)

  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''

  const [verifyEmail] = useVerifyEmailMutation()
  const [sendVerificationEmail] = useSendVerificationEmailMutation()

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

    if (!/^\d{8}$/.test(code)) {
      setError('Verification code must be 8 digits.')
      toast.error('Verification code must be 8 digits.')
      setIsLoading(false)
      return
    }

    try {
      await verifyEmail({ email, code }).unwrap()
      toast.success('Email verification successful! Please login.')
      navigate('/login')
    } catch (err) {
      const errorMessage = err?.data?.message || 'Verification failed. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Verify email error:', err)
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
      await sendVerificationEmail({ email }).unwrap()
      setResendMessage('A new verification code has been sent.')
      toast.success('A new verification code has been sent to your email.')
      setResendCooldown(60)
    } catch (err) {
      const errorMessage = err?.data?.message || 'Failed to resend code. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Resend code error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
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
              Enter the 8-digit code sent to <strong>{email}</strong>
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
                  placeholder='Enter 8-digit code...'
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
