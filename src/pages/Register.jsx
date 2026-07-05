import { Eye, EyeOff, UserPlus, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/common/ui/Button";
import { useSignUpMutation } from "~/store/apis/authSlice";
import { BASE_URL } from "~/constants/fe.constant";

/** Google "G" SVG icon */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const Register = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [signUp] = useSignUpMutation();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/auth/google`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const validateForm = () => {
    const { email, password, confirmPassword } = formData;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return t("auth.register_page.errors.invalidEmail");
    }
    if (!password || password.length < 8) {
      return t("auth.register_page.errors.passwordTooShort");
    }
    if (password !== confirmPassword) {
      return t("auth.register_page.errors.passwordMismatch");
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const response = await signUp({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      const { authToken } = response;

      toast.success(
        `${t("auth.registerSuccess")} ${t("auth.register_page.verifyEmailMessage")}`,
      );
      navigate("/authen-confirm", {
        state: { email: formData.email, authToken },
      });
    } catch (err) {
      const errorMessage =
        err?.data?.message || t("auth.register_page.errors.registrationFailed");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="museum-shell flex min-h-screen items-center justify-center px-4 py-12 pt-navbar-mobile sm:pt-navbar">
      <div className="w-full max-w-md animate-fade-up">
        <div className="museum-card overflow-hidden rounded-[2rem]">
          {/* Header */}
          <div className="museum-paper p-8 text-center space-y-1">
            <div className="w-16 h-16 rounded-full bg-museum-gold text-museum-black flex items-center justify-center mx-auto mb-3 shadow-museum-gold">
              <UserPlus className="w-7 h-7" />
            </div>
            <h3 className="font-display text-3xl text-museum-espresso font-semibold tracking-tight">
              {t("auth.register_page.title")}
            </h3>
            <p className="text-sm text-museum-terracotta">
              {t("auth.register_page.subtitle")}
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
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-terracotta" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder={t("auth.register_page.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 rounded-xl border border-museum-gold/20 bg-museum-ivory px-3 py-2 text-sm text-museum-black placeholder:text-museum-terracotta/60 focus:ring-2 focus:ring-museum-gold-light focus:border-museum-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-museum-gold-light" htmlFor="password">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-terracotta" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    placeholder={t("auth.register_page.passwordPlaceholder")}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-museum-gold/20 bg-museum-ivory px-3 py-2 text-sm text-museum-black placeholder:text-museum-terracotta/60 focus:ring-2 focus:ring-museum-gold-light focus:border-museum-gold focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-museum-terracotta hover:text-museum-seal transition-colors"
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

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-museum-gold-light"
                  htmlFor="confirmPassword"
                >
                  {t("auth.confirmPassword")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-terracotta" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    placeholder={t(
                      "auth.register_page.confirmPasswordPlaceholder",
                    )}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 rounded-xl border border-museum-gold/20 bg-museum-ivory px-3 py-2 text-sm text-museum-black placeholder:text-museum-terracotta/60 focus:ring-2 focus:ring-museum-gold-light focus:border-museum-gold focus:outline-none transition-colors"
                  />
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
                    <UserPlus className="w-4 h-4" />
                    <span>{t("auth.register_page.signUpButton")}</span>
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5 mt-9">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-museum-gold/20" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-museum-espresso px-3 text-museum-parchment/70">
                  {t("auth.orContinueWith", { defaultValue: "Hoặc tiếp tục với" })}
                </span>
              </div>
            </div>

            {/* Google Register Button */}
            <button
              type="button"
              id="btn-google-register"
              onClick={handleGoogleLogin}
              className="w-full h-11 rounded-full border border-museum-gold/30 bg-transparent
                         text-museum-gold-light text-sm font-medium
                         hover:bg-museum-gold/10 hover:border-museum-gold/60
                         flex items-center justify-center gap-3
                         transition-all duration-200 active:scale-[0.98]"
            >
              <GoogleIcon />
              {t("auth.continueWithGoogle", { defaultValue: "Đăng ký với Google" })}
            </button>

            <div className="mt-6 text-center text-sm">
              <span className="text-museum-muted">
                {t("auth.alreadyHaveAccount")}{" "}
              </span>
              <Link
                to="/login"
                className="text-museum-gold-light font-medium hover:text-museum-ivory hover:underline"
              >
                {t("auth.loginNow")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
