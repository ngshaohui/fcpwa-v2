import { ActiveStats } from "@/components/Data/ActiveStats";
import { useSettingsDispatch } from "@/SettingsContext";

import styles from "./Setup.module.css";

export function QuizSetup() {
  const dispatch = useSettingsDispatch();

  return (
    <div className={styles.setupContainer}>
      <button onClick={() => dispatch({ type: "SET_APP_STATE", payload: "quiz" })}>
        Start quiz
      </button>
      <button onClick={() => dispatch({ type: "SET_APP_STATE", payload: "review" })}>Review</button>
      <ActiveStats />
    </div>
  );
}
