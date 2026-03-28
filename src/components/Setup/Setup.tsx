import { ActiveStats } from "@/components/Data/ActiveStats";
import { useSettings, useSettingsDispatch } from "@/SettingsContext";
import { useState } from "react";
import styles from "./Setup.module.css";

const INPUT_NEW_QUIZ_ITEMS_NAME = "new";

export function QuizSetup() {
  const settings = useSettings();
  const [numNewQuizItems, setNumNewQuizItems] = useState(settings.numNewItems);

  const dispatch = useSettingsDispatch();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const numNew = Number(formData.get(INPUT_NEW_QUIZ_ITEMS_NAME) as string);

    dispatch({ type: "SET_NEW_QUIZ", payload: numNew });
  }

  return (
    <div className={styles.setupContainer}>
      <form className={styles.setupForm} onSubmit={handleSubmit}>
        <span>New items: {numNewQuizItems}</span>
        <input
          type="range"
          name={INPUT_NEW_QUIZ_ITEMS_NAME}
          min={0}
          max={20}
          step={1}
          value={numNewQuizItems}
          onChange={(e) => {
            setNumNewQuizItems(Number(e.target.value));
          }}
        />
        <br />
        <button type="submit">Start quiz</button>
      </form>
      <button onClick={() => dispatch({ type: "SET_APP_STATE", payload: "review" })}>Review</button>
      <ActiveStats />
    </div>
  );
}
