"use client";

import {
  ArrowLeft,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/common/ui/Button";
import { useDispatch } from "react-redux";
import {
  useForgotPasswordMutation,
  useVerifyForgotPasswordOtpMutation,
  useResetPasswordMutation,
} from "~/store/apis/authSlice";
import { setCredentials } from "~/store/slices/authSlice";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const [forgotPassword, { isLoading: isRequestingCode }] =
    useForgotPasswordMutation();
  const [verifyForgotOtp, { isLoading: isVerifyingOtp }] =
    useVerifyForgotPasswordOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await forgotPassword({ email }).unwrap();
      const { resetToken } = response.data;
      setResetToken(resetToken);

      toast.success(response.data.message || t("auth.forgotPassword.codeSent"));
      setIsSubmitted(true);
      setCooldown(60);
    } catch (err) {
      const errorMessage =
        err?.data?.message || t("auth.forgotPassword.errors.sendFailed");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;

    setError(null);
    try {
      const response = await forgotPassword({ email }).unwrap();
      toast.success(response.message || t("auth.forgotPassword.codeResent"));
      setCooldown(60);
    } catch (err) {
      const errorMessage =
        err?.data?.message || t("auth.forgotPassword.errors.resendFailed");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t("auth.forgotPassword.errors.passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("auth.forgotPassword.errors.passwordTooShort"));
      return;
    }

    try {
      const verifyResponse = await verifyForgotOtp({
        token: resetToken,
        otpCode: verificationCode,
      }).unwrap();

      const verifiedResetToken = verifyResponse.data.resetToken;

      const resetResponse = await resetPassword({
        token: verifiedResetToken,
        newPassword,
      }).unwrap();

      const { accessToken, refreshToken, sessionId, user } = resetResponse.data;

      dispatch(setCredentials({ user, accessToken, refreshToken, sessionId }));
      toast.success(t("auth.forgotPassword.resetSuccess"));
      setIsResetComplete(true);

      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      const errorMessage =
        err?.data?.message || t("auth.forgotPassword.errors.invalidCode");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center sm:px-4 py-12 min-h-screen mt-navbar-mobile sm:mt-navbar">
      <div className="max-w-md w-full animate-fade-up">
        <div className="rounded-xl shadow-lg border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-heritage-light/50 to-accent p-8 text-center space-y-1">
            <div className="w-16 h-16 rounded-full bg-heritage text-white flex items-center justify-center mx-auto mb-3">
              {isResetComplete ? (
                <Check className="w-7 h-7" />
              ) : (
                <KeyRound className="w-7 h-7" />
              )}
            </div>
            <h3 className="text-xl sm:text-2xl text-heritage-dark font-bold tracking-tight">
              {isResetComplete
                ? t("auth.forgotPassword.titleSuccess")
                : isSubmitted
                  ? t("auth.forgotPassword.titleReset")
                  : t("auth.forgotPassword.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isResetComplete
                ? t("auth.forgotPassword.subtitleSuccess")
                : isSubmitted
                  ? t("auth.forgotPassword.subtitleReset")
                  : t("auth.forgotPassword.subtitle")}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Success state */}
            {isResetComplete ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300 flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">
                      {t("auth.forgotPassword.resetSuccessMessage")}
                    </p>
                    <p className="mt-1">
                      {t("auth.forgotPassword.redirectMessage")}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t("auth.forgotPassword.goToLogin")}</span>
                </Button>
              </div>
            ) : !isSubmitted ? (
              /* Email form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder={t("auth.forgotPassword.emailPlaceholder")}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full h-11 pl-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isRequestingCode}
                >
                  {isRequestingCode ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      {t("auth.processing")}
                    </div>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>{t("auth.forgotPassword.sendCodeButton")}</span>
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* Verification form */
              <div className="space-y-5">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                  {t("auth.forgotPassword.emailSentMessage", { email })}
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="verificationCode"
                    >
                      {t("auth.forgotPassword.verificationCode")}
                    </label>
                    <input
                      type="text"
                      id="verificationCode"
                      required
                      placeholder={t(
                        "auth.forgotPassword.verificationCodePlaceholder",
                      )}
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="newPassword"
                    >
                      {t("auth.forgotPassword.newPassword")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        required
                        placeholder={t(
                          "auth.forgotPassword.newPasswordPlaceholder",
                        )}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full h-11 pl-10 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="confirmPassword"
                    >
                      {t("auth.confirmPassword")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        required
                        placeholder={t(
                          "auth.forgotPassword.confirmPasswordPlaceholder",
                        )}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full h-11 pl-10 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={isResetting}
                    >
                      {isResetting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          {t("auth.processing")}
                        </div>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>{t("auth.forgotPassword.resetButton")}</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      className="w-full h-11"
                      variant="outline"
                      disabled={cooldown > 0 || isResetting}
                      onClick={handleResendCode}
                    >
                      <Mail className="w-4 h-4" />
                      <span>
                        {cooldown > 0
                          ? t("auth.forgotPassword.resendCodeCooldown", {
                              time: cooldown,
                            })
                          : t("auth.forgotPassword.resendCode")}
                      </span>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="text-center p-6 pt-0 text-sm">
            <Link
              to="/login"
              className="text-heritage font-medium hover:underline inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
