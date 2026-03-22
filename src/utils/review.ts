import { IDB_BOOL, StorageKeys } from "@/common/constants";
import type { QuizItem } from "@/common/types";
import { idbDB } from "./services";

export async function getAllQuizItems(): Promise<QuizItem[]> {
  const db = await idbDB;
  const tx = db.transaction(
    [StorageKeys.PracticeItems, StorageKeys.CourseItems],
    "readonly",
  );
  const practiceStore = tx.objectStore(StorageKeys.PracticeItems);
  const courseStore = tx.objectStore(StorageKeys.CourseItems);

  const practiceItems = await practiceStore.getAll();
  const quizItems: QuizItem[] = [];

  for (const practiceItem of practiceItems) {
    const courseItem = await courseStore.get(practiceItem.courseItemId);
    if (courseItem) {
      quizItems.push({ courseItem, practiceItem });
    }
  }

  await tx.done;
  return quizItems;
}

export async function toggleActive(
  courseItemId: string,
  currentActive: number,
): Promise<void> {
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
