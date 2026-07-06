import { motion } from "motion/react";

export function FinalePage({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-center px-6 py-8 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: -6 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 140, damping: 12 }}
        className="dt-seal-stamp mb-6 grid h-[70px] w-[70px] place-items-center rounded-lg text-lg font-black tracking-[0.1em]"
      >
        CHUNG
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-[clamp(1.8rem,4.4vw,2.8rem)] font-black"
        style={{ color: "var(--dt-ink)" }}
      >
        Chiếu chỉ khép lại
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mx-auto mt-4 max-w-[600px] leading-[1.85] text-[0.92rem]"
        style={{ color: "var(--dt-ink-soft)" }}
      >
        Khi Bảo Đại thoái vị tại Huế năm 1945, chế độ quân chủ Việt Nam kết thúc. Nhưng dòng chảy lịch sử không dừng ở một cột mốc — nó vẫn tiếp tục trong di tích, địa danh và cách người Việt kể về nguồn cội của mình.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        whileHover={{ y: -3, background: "rgba(157,47,34,0.12)" }}
        onClick={onRestart}
        className="mt-9 inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition"
        style={{
          borderColor: "var(--dt-lacquer)",
          color: "var(--dt-lacquer)",
          background: "rgba(157,47,34,0.04)",
        }}
      >
        <span className="text-lg">↺</span> Cuộn lại từ đầu
      </motion.button>
    </div>
  );
}
