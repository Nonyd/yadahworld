"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const TICKER_ITEMS = [
  "WORSHIP",
  "·",
  "MINISTRY",
  "·",
  "100M STREAMS",
  "·",
  "YADAH AHFREEKAH",
  "·",
  "GLORY",
  "·",
  "THE LIGHT",
  "·",
  "GOSPEL",
  "·",
  "LIVE EXPERIENCE",
  "·",
];

function CrossIcon() {
  return (
    <svg
      className="w-3 h-3 flex-shrink-0 text-gold"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6 1L7.4 2.4 6 3.8 4.6 2.4 6 1zm0 8l1.4-1.4L6 6.2 4.6 7.6 6 9zM2.4 7.4L1 6l1.4-1.4L3.8 6 2.4 7.4zM9 6L7.6 4.6 6 6.2l1.4 1.4L9 6zm-3 3l.8-.8L6 7.4l-.8.8L6 9zM6 4.6L5.2 3.8 4.4 4.6 6 6.2l1.6-1.6L6 4.6z" />
    </svg>
  );
}

export default function Marquee() {
  const [hovered, setHovered] = useState(false);
  const content = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section
      id="marquee"
      className="py-3 bg-[var(--bg)] overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: hovered ? 999999 : 25,
            ease: "linear",
          },
        }}
        style={{ width: "max-content" }}
      >
        {content.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-gold text-sm font-medium tracking-widest uppercase"
          >
            {item === "·" ? <CrossIcon /> : item}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
