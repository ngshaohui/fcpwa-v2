import { useEffect, useState } from "react";

import { StorageKeys } from "@/common/constants";
import type { PracticeItem } from "@/common/types";
import { idbDB } from "@/utils/services";

async function countPracticeItems(): Promise<[number, number]> {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readonly");
  const store = tx.objectStore(StorageKeys.PracticeItems);
  const items: PracticeItem[] = await store.getAll();
  let attempted = 0;
  for (const item of items) {
    if (item.repetitions > 0) {
      attempted++;
    }
  }
  return [attempted, items.length];
}

async function countAudioItems() {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.Audio, "readonly");
  const store = tx.objectStore(StorageKeys.Audio);
  return store.count();
}

export function Stats() {
  const [attemptedCount, setAttemptedCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [audioCount, setAudioCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [attempted, total] = await countPracticeItems();
      setAttemptedCount(attempted);
      setTotalCount(total);
      const audio = await countAudioItems();
      setAudioCount(audio);
    })();
  }, []);

  return (
    <div>
      <p>
        Progress: {attemptedCount} out of {totalCount} &#40;
        {attemptedCount != null && totalCount
          ? ((attemptedCount / totalCount) * 100).toFixed(2)
          : "0.00"}
        %&#41;
      </p>
      <p>{audioCount} Audio files</p>
    </div>
  );
}
