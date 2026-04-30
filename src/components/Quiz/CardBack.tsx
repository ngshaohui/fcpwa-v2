import { useCallback, useEffect } from "react";

import type { CourseItem } from "@/common/types";

import { ShowCue } from "./ShowCue";
import { ShowSentence } from "./ShowSentence";

import styles from "./CardBack.module.css";

interface RangeSelectorProps {
  selectScore: (score: number) => void;
}

const KeyMap: Record<string, number> = {
  Digit0: 0,
  Digit1: 1,
  Digit2: 2,
  Digit3: 3,
  Digit4: 4,
  Digit5: 5,
};

function RangeSelector({ selectScore }: RangeSelectorProps) {
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
    <div className={styles.ranges}>
      <button className={styles.rangeBtn} onClick={() => selectScore(0)}>
        😵
      </button>
      <button className={styles.rangeBtn} onClick={() => selectScore(1)}>
        🧐
      </button>
      <button className={styles.rangeBtn} onClick={() => selectScore(2)}>
        🤨
      </button>
      <button className={styles.rangeBtn} onClick={() => selectScore(3)}>
        🫡
      </button>
      <button className={styles.rangeBtn} onClick={() => selectScore(4)}>
        😎
      </button>
      <button className={styles.rangeBtn} onClick={() => selectScore(5)}>
        😇
      </button>
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
      <RangeSelector selectScore={selectScore} />
    </div>
  );
}
