import {
  IDB_BOOL,
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_HOUR,
  StorageKeys,
} from "@/common/constants";
import type { PracticeItem, QuizItem } from "@/common/types";

import { idbDB } from "./services";
import { sm2 } from "./sm2";

export async function getQuizItem(): Promise<QuizItem | null> {
  const db = await idbDB;

  const tx = db.transaction(StorageKeys.PracticeItems, "readonly");
  const store = tx.objectStore(StorageKeys.PracticeItems);
  const index = store.index("active_date");

  const range = IDBKeyRange.bound(
    [IDB_BOOL.True, -Infinity], // min possible date
    [IDB_BOOL.True, Infinity], // max possible date
  );

  const item = await index.get(range);
  if (item === undefined) {
    return null;
  }
  return getQuizItemFromPracticeItem(item);
}

export async function getNewQuizItem(): Promise<QuizItem | null> {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readonly");
  const store = tx.objectStore(StorageKeys.PracticeItems);
  const index = store.index("active_date");

  const range = IDBKeyRange.bound(
    [IDB_BOOL.False, -Infinity], // min possible date
    [IDB_BOOL.False, Infinity], // max possible date
  );

  const item = await index.get(range);
  if (item === undefined) {
    return null;
  }
  // mark item as active
  const activeItem = { ...item, active: IDB_BOOL.True };
  return getQuizItemFromPracticeItem(activeItem);
}

async function getQuizItemFromPracticeItem(item: PracticeItem): Promise<QuizItem> {
  const db = await idbDB;
  const courseItem = await db.get(StorageKeys.CourseItems, item.courseItemId);
  if (courseItem === undefined) {
    // TODO ideally just log the error instead of throwing it
    throw new Error(`Course Item ${item.courseItemId} not found`);
  }
  return { courseItem, practiceItem: item };
}

export async function update(practiceItem: PracticeItem, quality: number) {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readwrite");
  const store = tx.objectStore(StorageKeys.PracticeItems);

  const curDate = new Date().getTime();
  const diffTime = Math.abs(practiceItem.date - curDate);
  const diffDays = Math.ceil(diffTime / MILLISECONDS_IN_DAY);

  // reduce the occurence of items being shown in the same order when they have the same score
  const randomDelta = Math.round(Math.random() * (MILLISECONDS_IN_HOUR * 2) - MILLISECONDS_IN_HOUR);

  const { easeFactor, repetitions, date } = sm2(
    quality,
    practiceItem.repetitions,
    practiceItem.easeFactor,
    diffDays,
    curDate,
  );

  store.put({
    ...practiceItem,
    repetitions,
    easeFactor,
    date: date + randomDelta,
  });

  await tx.done;
}
