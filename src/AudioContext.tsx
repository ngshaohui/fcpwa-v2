import { createContext, useRef, useEffect } from "react";

import { StorageKeys } from "@/common/constants";
import { idbDB } from "@/utils/services"; // your db

interface AudioContextValue {
  play: (id: string) => Promise<void>;
  muted: boolean;
}

export const AudioContext = createContext<AudioContextValue | null>(null);

let lastUrl: string | null = null;

export function AudioProvider({ children, muted }: { children: React.ReactNode; muted: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // create audio element exactly once
  if (!audioRef.current) {
    audioRef.current = new Audio();
  }

  // update settings when props change
  useEffect(() => {
    const el = audioRef.current!;
    el.muted = muted;
  }, [muted]);

  async function play(id: string) {
    const el = audioRef.current!;

    if (muted) return; // setting-based mute

    const blob = await (await idbDB).get(StorageKeys.Audio, id);
    if (!blob) return;

    // cleanup old URL
    if (lastUrl) URL.revokeObjectURL(lastUrl);

    const url = (lastUrl = URL.createObjectURL(blob));
    el.src = url;

    try {
      await el.play();
    } catch (err) {
      console.warn("Playback blocked:", err);
    }
  }

  return <AudioContext.Provider value={{ play, muted }}>{children}</AudioContext.Provider>;
}
