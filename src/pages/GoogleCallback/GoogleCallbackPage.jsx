import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { setCredentials } from "~/store/slices/authSlice";

/**
 * GoogleCallbackPage
 *
 * Landing page sau khi BE redirect về sau Google OAuth.
 * BE đã set 3 httpOnly cookies (accessToken, refreshToken, sessionId)
 * và 1 readable cookie (googleUser) chứa thông tin user.
 *
 * Page này đọc cookie googleUser, dispatch setCredentials vào Redux,
 * xoá cookie tạm, rồi navigate về trang chính.
 */
const GoogleCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userRaw = params.get("user");

    if (!userRaw) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      if (!user?.id) throw new Error("Invalid user data");

      dispatch(
        setCredentials({
          user,
          accessToken: "google-sso", // placeholder — actual token ở httpOnly cookie
          refreshToken: "google-sso",
          sessionId: user.id, // fallback
        })
      );

      toast.success(t("auth.loginSuccess"));
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Google OAuth Callback Error:", error);
      toast.error(t("auth.googleLoginFailed", { defaultValue: "Đăng nhập Google thất bại, vui lòng thử lại." }));
      navigate("/login", { replace: true });
    }
  }, [dispatch, navigate, t]);

  return (
    <section className="museum-shell flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        {/* Museum-style spinner */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-museum-gold/20 border-t-museum-gold" />
          <div className="absolute inset-2 animate-ping rounded-full bg-museum-gold/10" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-museum-gold-light">
            {t("auth.googleProcessing", { defaultValue: "Đang xác thực tài khoản Google..." })}
          </p>
          <p className="text-xs text-museum-muted">
            {t("auth.pleaseWait", { defaultValue: "Vui lòng chờ trong giây lát" })}
          </p>
        </div>
      </div>
    </section>
  );
};

export default GoogleCallbackPage;
