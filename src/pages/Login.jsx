import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/common/ui/Button";
import { useSignInMutation } from "~/store/apis/authSlice";
import { setCredentials } from "~/store/slices/authSlice";
import { setAccessToken } from "~/store/slices/authSlice";

const Login = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const [signIn] = useSignInMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await signIn({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      const { accessToken, refreshToken, sessionId, user } = response;

      // dispatch(setAccessToken({ accessToken}));
      toast.success(t("auth.loginSuccess"));
      dispatch(setCredentials({ user, accessToken, refreshToken, sessionId }));
      // window.location.href = "/";
    } catch (err) {
      const errorMessage = err?.data?.message || t("common.error");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  return (
    <section className="museum-shell flex min-h-screen items-center justify-center px-4 py-12 pt-navbar-mobile sm:pt-navbar">
      <div className="w-full max-w-md animate-fade-up">
        <div className="museum-card overflow-hidden rounded-[2rem]">
          {/* Header */}
          <div className="museum-paper p-8 text-center space-y-1">
            <div className="w-16 h-16 rounded-full bg-museum-gold text-museum-black flex items-center justify-center mx-auto mb-3 shadow-museum-gold">
              <LogIn className="w-7 h-7" />
            </div>
            <h3 className="font-display text-3xl text-museum-espresso font-semibold tracking-tight">
              {t("auth.login_page.title")}
            </h3>
            <p className="text-sm text-museum-terracotta">
              {t("auth.login_page.subtitle")}
            </p>
          </div>

          {/* Form */}
          <div className="p-6 text-museum-ivory sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-museum-seal/35 bg-museum-seal/20 p-3 text-center text-sm text-museum-gold-light">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-museum-gold-light" htmlFor="email">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-muted" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder={t("auth.login_page.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 rounded-xl border border-museum-gold/20 bg-museum-ivory px-3 py-2 text-sm text-museum-black placeholder:text-museum-muted focus:ring-2 focus:ring-museum-gold-light focus:border-museum-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-museum-gold-light" htmlFor="password">
                    {t("auth.password")}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-museum-gold-light hover:text-museum-ivory hover:underline"
                  >
                    {t("auth.forgotPasswordLink")}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    placeholder={t("auth.login_page.passwordPlaceholder")}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-museum-gold/20 bg-museum-ivory px-3 py-2 text-sm text-museum-black placeholder:text-museum-muted focus:ring-2 focus:ring-museum-gold-light focus:border-museum-gold focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-museum-muted hover:text-museum-black transition-colors"
                    aria-label={t("auth.togglePasswordVisibility")}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-full bg-museum-gold text-museum-black shadow-museum-gold hover:bg-museum-gold-light"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {t("auth.processing")}
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t("auth.login_page.loginButton")}</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-museum-muted">
                {t("auth.dontHaveAccount")}{" "}
              </span>
              <Link
                to="/register"
                className="text-museum-gold-light font-medium hover:text-museum-ivory hover:underline"
              >
                {t("auth.signUpNow")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
