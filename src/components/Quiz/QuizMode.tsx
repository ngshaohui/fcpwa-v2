import type { QuizItem } from "@/common/types";
import { useState } from "react";
import { CardFront } from "./CardFront";
import { CardBack } from "./CardBack";
import { update } from "@/utils/quiz";
import { useSettingsDispatch } from "@/SettingsContext";

interface QuizModeProps {
  quizItems: QuizItem[];
}

export function QuizMode({ quizItems }: QuizModeProps) {
  const [isFront, setIsFront] = useState<boolean>(true);
  const [idx, setIdx] = useState(0);
  const dispatch = useSettingsDispatch();

  function handleFlip() {
    if (!isFront) {
      if (idx === quizItems.length - 1) {
        dispatch({
          type: "SET_APP_STATE",
          payload: "setup",
        });
      } else {
        setIdx((curIdx) => curIdx + 1);
      }
    }
    setIsFront((cur) => !cur);
  }

  function handleSetQuality(quality: number) {
    update(quizItems[idx].practiceItem, quality);
    handleFlip();
  }

  if (quizItems.length === 0) {
    return <div>No items to start quiz session</div>;
  }

  if (isFront) {
    return (
      <CardFront
        cueText={quizItems[idx].courseItem.cue.text}
        flip={handleFlip}
      />
    );
  } else {
    return (
      <CardBack
        courseItem={quizItems[idx].courseItem}
        setQuality={handleSetQuality}
      />
    );
  }
}
