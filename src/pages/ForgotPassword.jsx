"use client"

import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useTranslation } from "react-i18next"
import { Button } from "~/components/common/ui/Button"
import { useDispatch } from 'react-redux'
import { useForgotPasswordMutation, useVerifyForgotPasswordOtpMutation, useResetPasswordMutation } from "~/store/apis/authSlice"
import { setCredentials } from '~/store/slices/authSlice'

const ForgotPassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isResetComplete, setIsResetComplete] = useState(false)
  const [error, setError] = useState(null)
  const [cooldown, setCooldown] = useState(0)

  // Use the mutation hooks
  const [forgotPassword, { isLoading: isRequestingCode }] = useForgotPasswordMutation()
  const [verifyForgotOtp, { isLoading: isVerifyingOtp }] = useVerifyForgotPasswordOtpMutation()
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()
  const [resetToken, setResetToken] = useState('')

  // Handle cooldown timer for resend button
  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await forgotPassword({ email }).unwrap()

      // BE returns { data: { resetToken } }
      const { resetToken } = response.data
      setResetToken(resetToken)

      toast.success(response.data.message || t('auth.forgotPassword.codeSent'))
      setIsSubmitted(true)
      setCooldown(60)
    } catch (err) {
      const errorMessage = err?.data?.message || t('auth.forgotPassword.errors.sendFailed')
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleResendCode = async () => {
    if (cooldown > 0) return

    setError(null)
    try {
      const response = await forgotPassword({ email }).unwrap()
      toast.success(response.message || t('auth.forgotPassword.codeResent'))
      setCooldown(60) // Reset cooldown timer
    } catch (err) {
      const errorMessage = err?.data?.message || t('auth.forgotPassword.errors.resendFailed')
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError(t('auth.forgotPassword.errors.passwordMismatch'))
      return
    }

    if (newPassword.length < 6) {
      setError(t('auth.forgotPassword.errors.passwordTooShort'))
      return
    }

    try {
      // Step 1: Verify OTP
      const verifyResponse = await verifyForgotOtp({
        token: resetToken,
        otpCode: verificationCode,
      }).unwrap()

      const verifiedResetToken = verifyResponse.data.resetToken

      // Step 2: Reset password
      const resetResponse = await resetPassword({
        token: verifiedResetToken,
        newPassword,
      }).unwrap()

      // BE returns { data: { accessToken, refreshToken, sessionId, user } }
      const { accessToken, refreshToken, sessionId, user } = resetResponse.data

      dispatch(setCredentials({ user, accessToken, refreshToken, sessionId }))
      toast.success(t('auth.forgotPassword.resetSuccess'))
      setIsResetComplete(true)

      setTimeout(() => navigate("/"), 3000)
    } catch (err) {
      const errorMessage = err?.data?.message || t('auth.forgotPassword.errors.invalidCode')
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="flex items-center justify-center sm:px-4 py-12 mt-navbar-mobile sm:mt-navbar">
      <div className="max-w-md w-full animate-fade-up">
        <div className="rounded-lg shadow-lg border border-heritage-light/50 bg-card text-card-foreground">
          <div className="flex flex-col items-center p-6 gap-1">
            <h3 className="text-xl sm:text-2xl text-heritage-dark font-bold tracking-tight">
              {isResetComplete 
                ? t('auth.forgotPassword.titleSuccess') 
                : isSubmitted 
                  ? t('auth.forgotPassword.titleReset') 
                  : t('auth.forgotPassword.title')}
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              {isResetComplete
                ? t('auth.forgotPassword.subtitleSuccess')
                : isSubmitted
                  ? t('auth.forgotPassword.subtitleReset')
                  : t('auth.forgotPassword.subtitle')}
            </p>
          </div>
          <div className="pt-0 p-6">
            {isResetComplete ? (
              <div className="space-y-4">
                <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm flex items-start">
                  <Check size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('auth.forgotPassword.resetSuccessMessage')}</p>
                    <p className="mt-1">{t('auth.forgotPassword.redirectMessage')}</p>
                  </div>
                </div>
                <Button type="button" className="w-full" onClick={() => navigate("/login")}>
                  <ArrowLeft size={16} />
                  <span>{t('auth.forgotPassword.goToLogin')}</span>
                </Button>
              </div>
            ) : !isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded-md border px-3 py-2 placeholder:text-muted-foreground focus:ring-heritage focus:border-none focus:ring-2 focus:outline-none text-sm"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isRequestingCode}>
                  {isRequestingCode ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      {t('auth.processing')}
                    </div>
                  ) : (
                    <>
                      <Mail size={16} />
                      <span>{t('auth.forgotPassword.sendCodeButton')}</span>
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm" dangerouslySetInnerHTML={{
                  __html: t('auth.forgotPassword.emailSentMessage', { email })
                }} />

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="verificationCode">
                      {t('auth.forgotPassword.verificationCode')}
                    </label>
                    <input
                      type="text"
                      id="verificationCode"
                      name="verificationCode"
                      required
                      placeholder={t('auth.forgotPassword.verificationCodePlaceholder')}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full h-10 rounded-md border px-3 py-2 placeholder:text-muted-foreground focus:ring-heritage focus:border-none focus:ring-2 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="newPassword">
                      {t('auth.forgotPassword.newPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        required
                        placeholder={t('auth.forgotPassword.newPasswordPlaceholder')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-10 rounded-md border px-3 py-2 placeholder:text-muted-foreground focus:ring-heritage focus:border-none focus:ring-2 focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 px-3 py-2 h-10"
                      >
                        {showPassword ? (
                          <EyeOff size={16} className="text-muted-foreground" />
                        ) : (
                          <Eye size={16} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="confirmPassword">
                      {t('auth.confirmPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        placeholder={t('auth.forgotPassword.confirmPasswordPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-10 rounded-md border px-3 py-2 placeholder:text-muted-foreground focus:ring-heritage focus:border-none focus:ring-2 focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-0 px-3 py-2 h-10"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} className="text-muted-foreground" />
                        ) : (
                          <Eye size={16} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <Button type="submit" className="w-full" disabled={isResetting}>
                      {isResetting ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          {t('auth.processing')}
                        </div>
                      ) : (
                        <>
                          <KeyRound size={16} />
                          <span>{t('auth.forgotPassword.resetButton')}</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      className="w-full"
                      variant="outline"
                      disabled={cooldown > 0 || isResetting}
                      onClick={handleResendCode}
                    >
                      <Mail size={16} />
                      <span>{cooldown > 0 ? t('auth.forgotPassword.resendCodeCooldown', { time: cooldown }) : t('auth.forgotPassword.resendCode')}</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
          <div className="text-center pt-0 p-6 text-sm">
            <Link to="/login" className="text-heritage font-medium hover:underline inline-flex items-center">
              <ArrowLeft size={16} className="mr-1" />
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
