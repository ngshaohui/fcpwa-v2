import { useCallback, useEffect } from "react";

import type { CourseItem } from "@/common/types";

import { ShowCue } from "./ShowCue";
import { ShowSentence } from "./ShowSentence";

import styles from "./CardBack.module.css";

interface RangeSliderProps {
  selectScore: (score: number) => void;
}

const KeyMap: Record<string, number> = {
  Digit0: 0,
  Digit1: 1,
  Digit2: 2,
  Digit3: 3,
  Digit4: 4,
  Digit5: 5,
  Digit6: 6,
};

function RangeSlider({ selectScore }: RangeSliderProps) {
  function pointerUpListener(e: React.PointerEvent<HTMLInputElement>) {
    const value = Number(e.currentTarget.value);
    selectScore(value);
  }
  const keyDownListener = useCallback(
    (e: KeyboardEvent) => {
      const value = Number(KeyMap[e.code]);
      selectScore(value);
    },
    [selectScore],
  );

  useEffect(() => {
    document.addEventListener("keydown", keyDownListener);

    return () => {
      document.removeEventListener("keydown", keyDownListener);
    };
  }, [keyDownListener]);

  return (
    <div>
      <input
        type="range"
        name="easeFactor"
        list="easeFactor"
        min="0"
        max="6"
        defaultValue="4"
        onPointerUp={pointerUpListener}
      />
      <datalist id="easeFactor">
        <option value="0"></option>
        <option value="1"></option>
        <option value="2"></option>
        <option value="3"></option>
        <option value="4"></option>
        <option value="5"></option>
        <option value="6"></option>
      </datalist>
      <div className={styles.sliderLabel}>
        <div>😵</div>
        <div>😇</div>
      </div>
    </div>
  );
}

interface CardBackProps {
  courseItem: CourseItem;
  setQuality: (value: number) => void;
}

/*
 * lifecycle for this component ends once setQuality callback is triggered
 */
export function CardBack({ courseItem, setQuality }: CardBackProps) {
  function selectScore(score: number) {
    if (isNaN(score)) {
      return;
    }
    setTimeout(() => {
      setQuality(score); // artificial delay
    }, 200);
  }

  return (
    <div className={styles.container}>
      <div className={styles.itemsContainer}>
        <ShowCue cue={courseItem.cue} />
        <ShowSentence sentences={courseItem.sentences} />
      </div>
      <RangeSlider selectScore={selectScore} />
    </div>
  );
}
