import { MILLISECONDS_IN_DAY } from "@/common/constants";

export function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number,
  unixTimeNow: number,
) {
  // ease factor
  const nextEaseFactor = getNextEaseFactor(easeFactor, quality);

  // repetitions
  const nextRepetitions = getNextRepetitions(quality, repetitions);

  // interval
  const nextInterval = getNextInterval(interval, nextRepetitions, nextEaseFactor);

  // next practice
  const nextPracticeDate = unixTimeNow + MILLISECONDS_IN_DAY * nextInterval;

  return {
    easeFactor: nextEaseFactor,
    repetitions: nextRepetitions,
    date: nextPracticeDate,
  };
}

function getNextEaseFactor(easeFactor: number, quality: number): number {
  return Math.max(1.3, easeFactor + 0.1 - (5.0 - quality) * (0.08 + (5.0 - quality) * 0.02));
}

function getNextRepetitions(quality: number, repetitions: number): number {
  if (quality < 3) {
    return 0;
  } else {
    return repetitions + 1;
  }
}

// returns number of days
function getNextInterval(interval: number, repetitions: number, easeFactor: number): number {
  if (repetitions <= 1) {
    return 1;
  } else if (repetitions === 2) {
    return 6;
  } else {
    return Math.round(interval * easeFactor);
  }
}
