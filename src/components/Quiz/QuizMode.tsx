import { useEffect, useState } from "react";

import type { QuizItem } from "@/common/types";
import { useSettingsDispatch } from "@/SettingsContext";
import { getQuizItemPair, update } from "@/utils/quiz";

import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

export function QuizMode() {
  const [isFront, setIsFront] = useState<boolean>(true);
  const [curQuizItem, setCurQuizItem] = useState<QuizItem | null>(null);
  const [nextQuizItem, setNextQuizItem] = useState<QuizItem | null>(null);
  const dispatch = useSettingsDispatch();

  useEffect(() => {
    (async () => {
      const [cur, next] = await getQuizItemPair();
      if (cur === null) {
        // end quiz
        dispatch({
          type: "SET_APP_STATE",
          payload: "setup",
        });
      }

      // caveat note: if the current item is the same as previous (unlikely but possible)
      // the text displayed will change from the one set preemptively
      setCurQuizItem(cur);
      setNextQuizItem(next);
    })();
  }, [dispatch, isFront]);

  async function handleFlip() {
    setIsFront((cur) => !cur);
  }

  function handleSetQuality(quality: number) {
    if (curQuizItem === null) {
      return;
    }
    update(curQuizItem.practiceItem, quality);
    handleFlip();
    setCurQuizItem(nextQuizItem); // preemptively set cur item
  }

  if (curQuizItem === null) {
    return <div>No items to start quiz session</div>;
  }

  if (isFront) {
    return <CardFront cueText={curQuizItem.courseItem.cue.text} flip={handleFlip} />;
  } else {
    return <CardBack courseItem={curQuizItem.courseItem} setQuality={handleSetQuality} />;
  }
}
