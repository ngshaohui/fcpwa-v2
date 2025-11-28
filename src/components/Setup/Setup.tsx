import type { QuizItem } from "@/common/types";
import { useSettingsDispatch } from "@/SettingsContext";
import { getNewQuizItems, getQuizItems } from "@/utils/quiz";
import { useState } from "react";
import styles from "./Setup.module.css";

const INPUT_EXISTING_QUIZ_ITEMS_NAME = "existing";
const INPUT_NEW_QUIZ_ITEMS_NAME = "new";

async function createQuizSession(
  numExisting: number,
  numNew: number
): Promise<QuizItem[]> {
  const existing = await getQuizItems(numExisting);
  const newItems = await getNewQuizItems(numNew);
  return newItems.concat(existing);
}

export function QuizSetup() {
  const [numQuizItems, setNumQuizItems] = useState(10);
  const [numNewQuizItems, setNumNewQuizItems] = useState(0);

  const dispatch = useSettingsDispatch();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const numExisting = Number(
      formData.get(INPUT_EXISTING_QUIZ_ITEMS_NAME) as string
    );
    const numNew = Number(formData.get(INPUT_NEW_QUIZ_ITEMS_NAME) as string);
    const quizItems = await createQuizSession(numExisting, numNew);
    dispatch({ type: "SET_APP_STATE", payload: "quiz" });
    dispatch({
      type: "SET_QUIZ_ITEMS",
      payload: quizItems,
    });
  }

  return (
    <div className={styles.setupContainer}>
      <form className={styles.setupForm} onSubmit={handleSubmit}>
        <span>Revision: {numQuizItems}</span>
        <input
          type="range"
          name={INPUT_EXISTING_QUIZ_ITEMS_NAME}
          min={0}
          max={20}
          step={1}
          value={numQuizItems}
          onChange={(e) => {
            setNumQuizItems(Number(e.target.value));
          }}
        />
        <span>New: {numNewQuizItems}</span>
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
        <button type="submit">Start</button>
      </form>
    </div>
  );
}
