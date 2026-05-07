import type { CourseItem } from "@/common/types";

import { ShowCue } from "../Quiz/ShowCue";
import { ShowSentence } from "../Quiz/ShowSentence";

import styles from "./ReviewCard.module.css";

interface ReviewCardProps {
  courseItem: CourseItem | null;
  onClose: () => void;
}

export default function ReviewCard({ courseItem, onClose }: ReviewCardProps) {
  if (courseItem === null) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.itemsContainer}>
        <ShowCue cue={courseItem.cue} />
        <ShowSentence sentences={courseItem.sentences} />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
