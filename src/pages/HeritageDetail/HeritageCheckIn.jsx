import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ShieldCheck, Stamp, LogIn } from "lucide-react";
import { selectCurrentUser } from "~/store/slices/authSlice";
import { useGetPassportQuery } from "~/store/apis/gamificationApi";
import CheckInModal from "~/pages/HeritagePassport/CheckInModal";

/**
 * HeritageCheckIn — khối điểm danh ngay trên trang chi tiết di tích.
 * Bắt buộc đăng nhập. Đã ghé thăm thì hiện tem; chưa thì mở CheckInModal (GPS).
 */
export default function HeritageCheckIn({ id, data }) {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const userId = user?._id || user?.id || null;
  const isAuth = !!userId;

  const { data: stamps = [], isLoading, refetch } = useGetPassportQuery(userId, { skip: !userId });
  const [showModal, setShowModal] = useState(false);

  const stamp = stamps.find((s) => s.heritageId === id);
  const visited = !!stamp;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDone =
    stamp?.lastVisit && new Date(stamp.lastVisit).toISOString().slice(0, 10) === todayStr;

  const province =
    data?.location || data?.province || data?.locations?.[0]?.address || "Việt Nam";

  return (
    <div className="rounded-[2rem] border border-museum-gold/25 bg-gradient-to-br from-museum-gold/10 to-museum-black/40 p-5 shadow-museum-card">
      <div className="mb-3 flex items-center gap-2 text-museum-gold-light">
        <Stamp className="h-5 w-5" />
        <h4 className="font-display text-lg font-semibold">Hộ chiếu di sản</h4>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-4 text-museum-muted animate-pulse">
          <span className="loading-spinner inline-block w-4 h-4 border-2 border-museum-gold/30 border-t-museum-gold rounded-full animate-spin" />
          Đang tải hộ chiếu...
        </div>
      ) : visited ? (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-museum-gold/35 bg-museum-gold/10 px-3 py-2.5 text-sm text-museum-gold-light">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Bạn đã ghé thăm di tích này{stamp?.visits > 1 ? ` (${stamp.visits} lượt)` : ""}.
        </div>
      ) : (
        <p className="mb-3 text-sm leading-relaxed text-museum-muted">
          Đến tận nơi và điểm danh để nhận <span className="text-museum-gold-light">con tem "Đã ghé thăm"</span> +50 XP,
          lưu vào hộ chiếu di sản của bạn.
        </p>
      )}

      {!isAuth ? (
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-museum-gold/40 bg-museum-gold/12 px-4 py-2.5 text-sm font-medium text-museum-gold-light transition-colors hover:bg-museum-gold/20"
        >
          <LogIn className="h-4 w-4" /> Đăng nhập để điểm danh
        </button>
      ) : todayDone ? (
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-museum-gold/30 bg-museum-gold/15 px-4 py-2.5 text-sm font-medium text-museum-gold-light/80"
        >
          <ShieldCheck className="h-4 w-4" /> Đã điểm danh hôm nay
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-museum-gold px-4 py-2.5 text-sm font-semibold text-museum-black transition-colors hover:bg-museum-gold-light"
        >
          <MapPin className="h-4 w-4" /> Điểm danh tại đây
        </button>
      )}

      {visited && (
        <Link
          to="/passport"
          className="mt-2 block text-center text-xs text-museum-muted underline-offset-2 hover:text-museum-gold-light hover:underline"
        >
          Xem hộ chiếu của bạn →
        </Link>
      )}

      {showModal && (
        <CheckInModal
          location={{ id, name: data?.name || "Di tích", type: "heritage", province }}
          userId={userId}
          onClose={() => setShowModal(false)}
          onDone={() => refetch()}
        />
      )}
    </div>
  );
}
