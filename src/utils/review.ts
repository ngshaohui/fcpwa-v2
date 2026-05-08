import { IDB_BOOL, StorageKeys } from "@/common/constants";
import type { PracticeItem, QuizItem } from "@/common/types";

import { idbDB } from "./services";

export async function getQuizItems(
  count: number | null = null,
  lastItemActiveDate: [number, number] | null = null,
): Promise<QuizItem[]> {
  const db = await idbDB;
  const tx = db.transaction([StorageKeys.PracticeItems, StorageKeys.CourseItems], "readonly");
  const practiceStore = tx.objectStore(StorageKeys.PracticeItems);
  const courseStore = tx.objectStore(StorageKeys.CourseItems);

  const index = practiceStore.index("active_date");
  let practiceItems: PracticeItem[] = [];
  let practiceStoreCursor = await index.openCursor(
    lastItemActiveDate ? IDBKeyRange.lowerBound(lastItemActiveDate, true) : undefined,
  );
  const maxItems = count ?? Infinity;
  while (practiceStoreCursor && practiceItems.length < maxItems) {
    practiceItems.push(practiceStoreCursor.value);
    practiceStoreCursor = await practiceStoreCursor.continue();
  }

  const ids = practiceItems.map((item) => item.courseItemId);
  const courseItems = (await Promise.all(ids.map((id) => courseStore.get(id)))).filter(
    (item) => !!item,
  ); // filter done for type coercion by removing undefined

  const courseMap = new Map(courseItems.map((c) => [c.id, c]));
  const quizItems: QuizItem[] = [];

  for (const practiceItem of practiceItems) {
    const courseItem = courseMap.get(practiceItem.courseItemId);
    if (courseItem) {
      quizItems.push({ courseItem, practiceItem });
    }
  }

  await tx.done;
  return quizItems;
}

export async function toggleActive(courseItemId: string, currentActive: number): Promise<void> {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readwrite");
  const store = tx.objectStore(StorageKeys.PracticeItems);

  const item = await store.get(courseItemId);
  if (item) {
    item.active = currentActive === IDB_BOOL.True ? IDB_BOOL.False : IDB_BOOL.True;
    await store.put(item);
  }

  await tx.done;
}

export async function modifyEaseFactor(courseItemId: string, easeFactor: number): Promise<void> {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readwrite");
  const store = tx.objectStore(StorageKeys.PracticeItems);

  const item = await store.get(courseItemId);
  if (item) {
    item.easeFactor = easeFactor;
    await store.put(item);
  }

  await tx.done;
}
