import type { CourseItem } from "@/common/types";

import { ShowCue } from "../Quiz/ShowCue";
import { ShowSentence } from "../Quiz/ShowSentence";

import styles from "./ReviewCard.module.css";

interface ReviewCardProps {
  courseItem: CourseItem | null;
  onClose: () => void;
  before: () => void;
  after: () => void;
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
        <div className={styles.actions}>
          <button onClick={before}>&#60;</button>
          <button onClick={onClose}>Close</button>
          <button onClick={after}>&#62;</button>
        </div>
      </div>
    </div>
  );
}
