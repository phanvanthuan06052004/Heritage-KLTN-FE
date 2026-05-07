import { Eye, EyeOff, UserPlus, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/common/ui/Button";
import { useSignUpMutation } from "~/store/apis/authSlice";

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

      const { authToken } = response.data;

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
    <div className="flex items-center justify-center sm:px-4 py-12 min-h-screen mt-navbar-mobile sm:mt-navbar">
      <div className="max-w-md w-full animate-fade-up">
        <div className="rounded-xl shadow-lg border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-heritage-light/50 to-accent p-8 text-center space-y-1">
            <div className="w-16 h-16 rounded-full bg-heritage text-white flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-7 h-7" />
            </div>
            <h3 className="text-2xl text-heritage-dark font-bold tracking-tight">
              {t("auth.register_page.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("auth.register_page.subtitle")}
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
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
                    name="email"
                    required
                    placeholder={t("auth.register_page.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    placeholder={t("auth.register_page.passwordPlaceholder")}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  className="text-sm font-medium"
                  htmlFor="confirmPassword"
                >
                  {t("auth.confirmPassword")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                    className="w-full h-11 pl-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
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

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {t("auth.alreadyHaveAccount")}{" "}
              </span>
              <Link
                to="/login"
                className="text-heritage font-medium hover:underline"
              >
                {t("auth.loginNow")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
