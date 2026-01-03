import { IDB_BOOL, StorageKeys } from "@/common/constants";
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
    [IDB_BOOL.True, Infinity] // max possible date
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
    [IDB_BOOL.False, Infinity] // max possible date
  );

  const item = await index.get(range);
  if (item === undefined) {
    return null;
  }
  // mark item as active
  const activeItem = { ...item, active: IDB_BOOL.True };
  return getQuizItemFromPracticeItem(activeItem);
}

async function getQuizItemFromPracticeItem(
  item: PracticeItem
): Promise<QuizItem> {
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

  const dateDue = new Date(practiceItem.date);
  const curDate = new Date();
  const diffTime = Math.abs(dateDue.getTime() - curDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const { easeFactor, repetitions, date } = sm2(
    quality,
    practiceItem.repetitions,
    practiceItem.easeFactor,
    diffDays,
    curDate.getTime()
  );

  store.put({
    ...practiceItem,
    repetitions,
    easeFactor,
    date,
  });

  await tx.done;
}
