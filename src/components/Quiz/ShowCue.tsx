import type { Cue } from "@/common/types";
import { useAudio } from "@/hooks/useAudio";
import { useSettings } from "@/SettingsContext";

import styles from "./ShowCue.module.css";

interface ShowCueProps {
  cue: Cue;
}

export function ShowCue({ cue }: ShowCueProps) {
  const settings = useSettings();
  const { play } = useAudio();
  const { text, translation, transliteration, audioUrl } = cue;
  return (
    <div onClick={() => play(audioUrl ?? "")}>
      <p className={styles.text}>{text}</p>
      {settings.config.showTransliteration ? (
        <p className={styles.transliteration}>{transliteration}</p>
      ) : null}
      {settings.config.showEnglish ? <p className={styles.translation}>{translation}</p> : null}
    </div>
  );
}
