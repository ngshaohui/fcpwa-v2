import { useEffect, useState } from "react";

import type { QuizItem } from "@/common/types";
import { useSettingsDispatch } from "@/SettingsContext";
import { getQuizItem, update } from "@/utils/quiz";

import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

export function QuizMode() {
  const [isFront, setIsFront] = useState<boolean>(true);
  const [quizItem, setQuizItem] = useState<QuizItem | null>(null);
  const dispatch = useSettingsDispatch();

  // set first item
  useEffect(() => {
    (async () => {
      const nextQuizItem = await getQuizItem();
      setQuizItem(nextQuizItem);

      if (nextQuizItem === null) {
        // end quiz
        dispatch({
          type: "SET_APP_STATE",
          payload: "setup",
        });
      }
    })();
  }, [dispatch, isFront]);

  async function handleFlip() {
    setIsFront((cur) => !cur);
  }

  function handleSetQuality(quality: number) {
    if (quizItem === null) {
      return;
    }
    update(quizItem.practiceItem, quality);
    handleFlip();
  }

  if (quizItem === null) {
    return <div>No items to start quiz session</div>;
  }

  if (isFront) {
    return <CardFront cueText={quizItem.courseItem.cue.text} flip={handleFlip} />;
  } else {
    return <CardBack courseItem={quizItem.courseItem} setQuality={handleSetQuality} />;
  }
}
