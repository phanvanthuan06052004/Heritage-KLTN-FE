import { useState, useEffect, useRef } from "react";
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

const SESSION_KEY = "otp_verify_session";

const AuthenConfirm = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Persist authToken + email in sessionStorage so resend works even after re-render
  const emailFromState = location.state?.email;
  const authTokenFromState = location.state?.authToken;

  const [sessionData] = useState(() => {
    if (emailFromState && authTokenFromState) {
      const data = { email: emailFromState, authToken: authTokenFromState };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      return data;
    }
    // Try to restore from sessionStorage (e.g. after hot-reload)
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const email = sessionData?.email || "";
  const authToken = sessionData?.authToken || null;

  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();
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

      // Clear persisted session after successful verification
      sessionStorage.removeItem(SESSION_KEY);

      dispatch(setCredentials({ user, accessToken, refreshToken, sessionId }));
      toast.success("Email verification successful! Logged in.");
      navigate("/");
    } catch (err) {
      const errorMessage =
        err?.data?.message || "Verification failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    if (!authToken) {
      toast.error("Session expired. Please register again.");
      navigate("/register");
      return;
    }

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
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !authToken) {
    navigate("/register");
    return null;
  }


  return (
    <section className="museum-shell flex min-h-screen items-center justify-center px-4 py-12 pt-navbar-mobile sm:pt-navbar">
      <div className="w-full max-w-md animate-fade-up">
        <div className="museum-card overflow-hidden rounded-[2rem]">
          {/* Header */}
          <div className="museum-paper p-8 text-center space-y-1">
            <div className="w-16 h-16 rounded-full bg-museum-gold text-museum-black flex items-center justify-center mx-auto mb-3 shadow-museum-gold">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="font-display text-3xl text-museum-espresso font-semibold tracking-tight">
              Email Verification
            </h3>
            <p className="text-sm text-museum-terracotta">
              Enter the 6-digit OTP sent to{" "}
              <strong className="text-museum-espresso">{email}</strong>
            </p>
          </div>

          {/* Content */}
          <div className="p-6 text-museum-ivory sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {resendMessage && (
                <div className="rounded-2xl border border-museum-jade/30 bg-museum-jade/15 p-3 text-center text-sm text-museum-jade-light">
                  {resendMessage}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-museum-seal/35 bg-museum-seal/20 p-3 text-center text-sm text-museum-gold-light">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-museum-gold-light" htmlFor="code">
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
                  className="w-full h-12 text-center text-lg font-mono tracking-widest rounded-xl border border-museum-gold/20 bg-museum-ivory text-museum-black placeholder:text-museum-terracotta/60 focus:ring-2 focus:ring-museum-gold-light focus:border-museum-gold focus:outline-none transition-colors"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-full bg-museum-gold text-museum-black shadow-museum-gold hover:bg-museum-gold-light"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-museum-black border-t-transparent rounded-full" />
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

            <div className="pt-6 text-center text-sm">
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                className="inline-flex items-center gap-2 text-museum-gold-light hover:text-museum-ivory hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Resend code {resendCooldown > 0 ? `(${resendCooldown}s)` : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthenConfirm;
