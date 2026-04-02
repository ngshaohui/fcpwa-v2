import { useEffect, useState } from "react";

import type { QuizItem } from "@/common/types";
import { useSettings, useSettingsDispatch } from "@/SettingsContext";
import { getNewQuizItem, getQuizItem, update } from "@/utils/quiz";

import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

export function QuizMode() {
  const settings = useSettings();
  const [isFront, setIsFront] = useState<boolean>(true);
  const [quizItem, setQuizItem] = useState<QuizItem | null>(null);
  const [idx, setIdx] = useState(0);
  const dispatch = useSettingsDispatch();

  // set first item
  useEffect(() => {
    (async () => {
      const nextQuizItem =
        idx < settings.numNewItems ? await getNewQuizItem() : await getQuizItem();
      setQuizItem(nextQuizItem);

      if (nextQuizItem === null) {
        // end quiz
        dispatch({
          type: "SET_APP_STATE",
          payload: "setup",
        });
      }
    })();
  }, [idx, settings.numNewItems]);

  async function handleFlip() {
    if (!isFront) {
      setIdx((curIdx) => curIdx + 1);
    }
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
