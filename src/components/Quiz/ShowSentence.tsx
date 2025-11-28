import { useState } from "react";
import type { Sentence } from "@/common/types";
import { useAudio } from "@/hooks/useAudio";
import styles from "./ShowSentence.module.css";

/*
 * a future enhancement will be to highlight the textCue in the sentence
 */
interface ShowSentenceProps {
  sentences: Sentence[];
}

export function ShowSentence({ sentences }: ShowSentenceProps) {
  const [pos, setPos] = useState(0);
  const { play } = useAudio();
  const { text, translation, transliteration, audioUrl } = sentences[pos];
  function next() {
    setPos((prev) => (prev + 1) % sentences.length);
  }
  function prev() {
    setPos((prev) => (prev - 1 < 0 ? sentences.length - 1 : prev - 1));
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    // Measure click position using the wrapper itself instead of capturing
    // clicks on an overlay element. The wrapper lets the event bubble normally
    // so text underneath remains selectable, while still allowing us to
    // determine left / center / right click zones based on its bounding box
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;

    if (x < 0.2) {
      prev(); // first 20%
    } else if (x > 0.8) {
      next(); // last 20%
    } else {
      play(audioUrl ?? ""); // middle 60%
    }
  }

  return (
    <div onClick={handleOverlayClick} className={styles.overlayWrapper}>
      <div className={styles.container}>
        <p className={styles.text}>{text}</p>
        <p className={styles.transliteration}>{transliteration}</p>
        <p className={styles.translation}>{translation}</p>
      </div>
    </div>
  );
}
