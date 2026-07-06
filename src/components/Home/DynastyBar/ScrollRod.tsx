import { motion } from "motion/react";

export function ScrollRod({ position }: { position: "top" | "bottom" }) {
  return (
    <motion.div
      initial={{ scaleX: 0.3, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex h-[28px] w-full items-center"
    >
      <Finial />
      <div
        className="mx-[-3px] h-full flex-1 rounded-full"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 1px, transparent 1px 4px, rgba(0,0,0,.06) 4px 5px, transparent 5px 9px), linear-gradient(180deg, var(--dt-wood-3) 5%, var(--dt-wood-1) 35%, rgba(0,0,0,.18) 55%, var(--dt-wood-2) 100%)",
          boxShadow:
            "0 10px 28px rgba(0,0,0,.6), inset 0 2px 4px rgba(255,255,255,.12), inset 0 -4px 8px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.25)",
        }}
      />
      <Finial />
      {position === "bottom" && <Tassel />}
    </motion.div>
  );
}

function Finial() {
  return (
    <div
      className="h-9 w-9 flex-none rounded-full"
      style={{
        background:
          "radial-gradient(circle at 35% 30%, var(--dt-gold2), rgba(201,143,74,.9) 30%, var(--dt-wood-2) 70%, #1a0e06 100%)",
        boxShadow:
          "0 6px 16px rgba(0,0,0,.6), inset 0 0 0 2px rgba(255,255,255,.14), 0 0 0 1px rgba(0,0,0,.3)",
      }}
    />
  );
}

function Tassel() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 120, damping: 12 }}
      className="absolute left-1/2 top-full -translate-x-1/2"
    >
      <div
        className="mx-auto h-12 w-[3px]"
        style={{ background: "linear-gradient(180deg, var(--dt-lacquer), var(--dt-lacquer2))" }}
      />
      <motion.div
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "top center" }}
        className="mx-auto -mt-1 h-7 w-7 rounded-[50%_50%_46%_46%] shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
      >
        <div
          className="h-full w-full rounded-[50%_50%_46%_46%]"
          style={{
            background: "radial-gradient(circle at 35% 30%, #d4574a, var(--dt-lacquer2) 70%)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
