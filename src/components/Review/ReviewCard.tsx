import type { CourseItem } from "@/common/types";

import { ShowCue } from "../Quiz/ShowCue";
import { ShowSentence } from "../Quiz/ShowSentence";

import styles from "./ReviewCard.module.css";

interface ReviewCardProps {
  courseItem: CourseItem | null;
  onClose: () => void;
  before: () => void | null;
  after: () => void | null;
}

export default function ReviewCard({ courseItem, onClose, before, after }: ReviewCardProps) {
  if (courseItem === null) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.itemsContainer}>
        <ShowCue cue={courseItem.cue} />
        <ShowSentence sentences={courseItem.sentences} />
        <div>
          <button disabled={before === null} onClick={before}>
            &#60;
          </button>
          <button onClick={onClose}>Close</button>
          <button disabled={before === null} onClick={after}>
            &#62;
          </button>
        </div>
      </div>
    </div>
  );
}
