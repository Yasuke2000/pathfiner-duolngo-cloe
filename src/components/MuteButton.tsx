"use client";

import { useEffect, useState } from "react";
import { isMuted, sfx, toggleMuted } from "@/lib/sound";

export function MuteButton() {
  const [m, setM] = useState(false);
  useEffect(() => setM(isMuted()), []);

  return (
    <button
      className="mute-btn"
      aria-label={m ? "Unmute sound" : "Mute sound"}
      title={m ? "Sound off" : "Sound on"}
      onClick={() => {
        const nm = toggleMuted();
        setM(nm);
        if (!nm) {
          sfx.unlock();
          sfx.click();
        }
      }}
    >
      {m ? "🔇" : "🔊"}
    </button>
  );
}
