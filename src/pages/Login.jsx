import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/common/ui/Button'
import { useSignInMutation } from '~/store/apis/authSlice'
import { setCredentials } from '~/store/slices/authSlice'

const Login = () => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null) // State to handle errors
  const dispatch = useDispatch()

  // Use the signin mutation hook
  const [signIn] = useSignInMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await signIn({
        email: formData.email,
        password: formData.password
      }).unwrap()

      // BE returns { data: { accessToken, refreshToken, sessionId, user } }
      const { accessToken, refreshToken, sessionId, user } = response.data

      toast.success(t('auth.loginSuccess'))
      dispatch(setCredentials({ user, accessToken, refreshToken, sessionId }))
      window.location.href = '/'
    } catch (err) {
      const errorMessage = err?.data?.message || t('common.error')
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className='flex items-center justify-center sm:px-4 py-12 mt-navbar-mobile sm:mt-navbar'>
      <div className='max-w-md w-full animate-fade-up'>
        <div className='rounded-lg shadow-lg border border-heritage-light/50 bg-card text-card-foreground'>
          <div className='flex flex-col items-center p-6 gap-1'>
            <h3 className='text-xl sm:text-2xl text-heritage-dark font-bold tracking-tight'>{t('auth.login_page.title')}</h3>
            <p className='text-sm text-muted-foreground text-center'>{t('auth.login_page.subtitle')}</p>
          </div>
          <div className='pt-0 p-6'>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {error && (
                <div className='text-red-500 text-sm text-center'>
                  {error}
                </div>
              )}
              <div className='space-y-2'>
                <label className='text-sm font-medium' htmlFor='email'>{t('auth.email')}</label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  required
                  placeholder={t('auth.login_page.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  className='w-full h-10 rounded-md border px-3 py-2 placeholder:text-muted-foreground focus:ring-heritage focus:border-none focus:ring-2 focus:outline-none text-sm'
                />
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <label className='text-sm font-medium' htmlFor='password'>{t('auth.password')}</label>
                  <Link to='/forgot-password' className='text-xs text-heritage hover:underline'>{t('auth.forgotPasswordLink')}</Link>
                </div>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='password'
                    name='password'
                    required
                    placeholder={t('auth.login_page.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full h-10 rounded-md border px-3 py-2 placeholder:text-muted-foreground focus:ring-heritage focus:border-none focus:ring-2 focus:outline-none text-sm'
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-0 top-0 px-3 py-2 h-10'
                    type='button'
                    aria-label={t('auth.togglePasswordVisibility')}
                  >
                    {showPassword ? (
                      <EyeOff size={16} className='text-muted-foreground' />
                    ) : (
                      <Eye size={16} className='text-muted-foreground' />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type='submit'
                className='w-full'
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                    {t('auth.processing')}
                  </div>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>{t('auth.login_page.loginButton')}</span>
                  </>
                )}
              </Button>
            </form>
          </div>
          <div className='text-center pt-0 p-6 text-sm'>
            <span>{t('auth.dontHaveAccount')} </span>
            <Link to='/register' className='text-heritage font-medium hover:underline'>{t('auth.signUpNow')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
