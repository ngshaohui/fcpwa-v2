import type { Cue } from "@/common/types";
import { useAudio } from "@/hooks/useAudio";
import styles from "./ShowCue.module.css";

interface ShowCueProps {
  cue: Cue;
}

export function ShowCue({ cue }: ShowCueProps) {
  const { play } = useAudio();
  const { text, translation, transliteration, audioUrl } = cue;
  return (
    <div onClick={() => play(audioUrl ?? "")}>
      <p className={styles.text}>{text}</p>
      <p className={styles.transliteration}>{transliteration}</p>
      <p className={styles.translation}>{translation}</p>
    </div>
  );
}
