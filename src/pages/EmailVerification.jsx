import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Mail, Shield, RefreshCw } from "lucide-react";
import { Button } from "~/components/common/ui/Button";
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "~/store/apis/authSlice";
import { setCredentials } from "~/store/slices/authSlice";

const AuthenConfirm = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();
  const authToken = location.state?.authToken;
  const dispatch = useDispatch();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!/^\d{6}$/.test(code)) {
      setError("OTP must be 6 digits.");
      toast.error("OTP must be 6 digits.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await verifyOtp({
        token: authToken,
        otpCode: code,
      }).unwrap();

      const { accessToken, refreshToken, sessionId, user } = response;

      dispatch(setCredentials({ user, accessToken, refreshToken, sessionId }));
      toast.success("Email verification successful! Logged in.");
      navigate("/");
    } catch (err) {
      const errorMessage =
        err?.data?.message || "Verification failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Verify OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setError(null);
    setResendMessage(null);
    setIsLoading(true);

    try {
      await resendOtp({ token: authToken }).unwrap();
      setResendMessage("A new OTP has been sent.");
      toast.success("A new OTP has been sent to your email.");
      setResendCooldown(60);
    } catch (err) {
      const errorMessage =
        err?.data?.message || "Failed to resend OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Resend OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !authToken) {
    navigate("/register");
    return null;
  }

  return (
    <div className="flex items-center justify-center sm:px-4 py-12 min-h-screen mt-navbar-mobile sm:mt-navbar">
      <div className="max-w-md w-full animate-fade-up">
        <div className="rounded-xl shadow-lg border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-heritage-light/50 to-accent p-8 text-center space-y-1">
            <div className="w-16 h-16 rounded-full bg-heritage text-white flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl text-heritage-dark font-bold tracking-tight">
              Email Verification
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit OTP sent to{" "}
              <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Success message */}
              {resendMessage && (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300 text-center">
                  {resendMessage}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              {/* Code input */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="code"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  required
                  placeholder="Enter 6-digit OTP..."
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError(null);
                  }}
                  maxLength={8}
                  className="w-full h-12 text-center text-lg font-mono tracking-widest rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Verify Email</span>
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-6 text-sm">
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                className="inline-flex items-center gap-2 text-heritage hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Resend code {resendCooldown > 0 ? `(${resendCooldown}s)` : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenConfirm;
