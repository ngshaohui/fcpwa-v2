import type { CourseItem } from "@/common/types";
import { ShowCue } from "./ShowCue";
import { ShowSentence } from "./ShowSentence";

import styles from "./CardBack.module.css";

interface RangeSliderProps {
  pointerUpListener: (e: React.PointerEvent<HTMLInputElement>) => void;
}

function RangeSlider({ pointerUpListener }: RangeSliderProps) {
  return (
    <div>
      <input
        type="range"
        name="easeFactor"
        list="easeFactor"
        min="0"
        max="6"
        defaultValue="3"
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
  function pointerUpListener(e: React.PointerEvent<HTMLInputElement>) {
    const value = Number(e.currentTarget.value);

    setTimeout(() => {
      setQuality(value); // artificial delay
    }, 200);
  }

  return (
    <div className={styles.container}>
      <div className={styles.itemsContainer}>
        <ShowCue cue={courseItem.cue} />
        <ShowSentence sentences={courseItem.sentences} />
      </div>
      <RangeSlider pointerUpListener={pointerUpListener} />
    </div>
  );
}
