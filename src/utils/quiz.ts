import { IDB_BOOL, StorageKeys } from "@/common/constants";
import type { PracticeItem, QuizItem } from "@/common/types";
import { idbDB } from "./services";
import { sm2 } from "./sm2";

export async function getQuizItems(numQuizItems: number): Promise<QuizItem[]> {
  if (numQuizItems === 0) {
    return [];
  }
  const db = await idbDB;

  const tx = db.transaction(StorageKeys.PracticeItems, "readonly");
  const store = tx.objectStore(StorageKeys.PracticeItems);
  const index = store.index("active_date");

  const range = IDBKeyRange.bound(
    [IDB_BOOL.True, -Infinity], // min possible date
    [IDB_BOOL.True, Infinity] // max possible date
  );

  const items = await index.getAll(range, numQuizItems);
  return getQuizItemsFromPracticeItems(items);
}

export async function getNewQuizItems(
  numNewQuizItems: number
): Promise<QuizItem[]> {
  if (numNewQuizItems === 0) {
    return [];
  }
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readonly");
  const store = tx.objectStore(StorageKeys.PracticeItems);
  const index = store.index("active_date");

  const range = IDBKeyRange.bound(
    [IDB_BOOL.False, -Infinity], // min possible date
    [IDB_BOOL.False, Infinity] // max possible date
  );

  const items = await index.getAll(range, numNewQuizItems);
  // mark items as active
  const activeItems = items.map((item) => ({ ...item, active: IDB_BOOL.True }));
  return getQuizItemsFromPracticeItems(activeItems);
}

async function getQuizItemsFromPracticeItems(practiceItems: PracticeItem[]) {
  const db = await idbDB;
  return Promise.all(
    practiceItems.map(async (item) => {
      const courseItem = await db.get(
        StorageKeys.CourseItems,
        item.courseItemId
      );
      if (courseItem === undefined) {
        // TODO ideally just log the error instead of throwing it
        throw new Error(`Course Item ${item.courseItemId} not found`);
      }
      return { courseItem, practiceItem: item };
    })
  );
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

  tx.done;
}

// unused
export async function createPracticeSession() {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readwrite");
  const store = tx.objectStore(StorageKeys.PracticeItems);

  return {
    update(practiceItem: PracticeItem, quality: number) {
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
    },
    done() {
      return tx.done;
    },
  };
}
