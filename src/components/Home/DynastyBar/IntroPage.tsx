import { motion } from "motion/react";

export function IntroPage({ onOpen, onRandom }: { onOpen: () => void; onRandom: () => void }) {
  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-center px-6 py-8 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: -6 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 140, damping: 12 }}
        className="dt-seal-stamp mb-7 grid h-24 w-24 place-items-center rounded-lg text-2xl font-black tracking-[0.1em]"
      >
        SẮC
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-4 text-[0.76rem] font-bold uppercase tracking-[0.28em]"
        style={{ color: "var(--dt-lacquer)" }}
      >
        — chiếu chỉ dòng sử việt —
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-[clamp(2.4rem,7vw,4.8rem)] font-black leading-[1.05]"
        style={{ color: "var(--dt-ink)" }}
      >
        Cuộn Chiếu Chỉ
        <span
          className="mt-2 block text-[0.55em] italic font-normal"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--dt-ink-soft)" }}
        >
          gần 3000 năm dựng nước và giữ nước
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="mx-auto mt-5 max-w-[560px] text-[clamp(0.9rem,1.2vw,1.02rem)] leading-[1.85]"
        style={{ color: "var(--dt-ink-soft)" }}
      >
        Mỗi lần lật là một đoạn chiếu chỉ được mở ra, kể lại một thời đại của lịch sử Việt Nam — từ huyền sử Hồng Bàng đến ngày kinh đô Huế khép lại nền quân chủ năm 1945.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mt-9 flex flex-wrap justify-center gap-2.5"
      >
        <motion.button
          whileHover={{ y: -3, background: "rgba(157,47,34,0.14)" }}
          onClick={onOpen}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition"
          style={{
            borderColor: "var(--dt-lacquer)",
            color: "var(--dt-lacquer)",
            background: "rgba(157,47,34,0.05)",
          }}
        >
          Mở chiếu chỉ <span className="text-lg">→</span>
        </motion.button>
        <motion.button
          whileHover={{ y: -3, background: "rgba(157,47,34,0.08)" }}
          onClick={onRandom}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition"
          style={{
            borderColor: "rgba(216,182,90,.32)",
            color: "var(--dt-gold)",
            background: "rgba(216,182,90,.04)",
          }}
        >
          Thời đại bất kỳ
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.3 }}
        className="mt-8 text-[0.68rem] uppercase tracking-[0.2em]"
        style={{ color: "var(--dt-ink-soft)" }}
      >
        Cuộn · phím ← → · vuốt dọc
      </motion.p>
    </div>
  );
}
