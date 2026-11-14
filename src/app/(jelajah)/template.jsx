"use client";

import { motion } from "framer-motion";

/** Transisi antarhalaman seperti berpindah lokasi dalam game. */
export default function Template({ children }) {
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
