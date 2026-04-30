import { useEffect, useState } from "react";

import { StorageKeys } from "@/common/constants";
import { idbDB } from "@/utils/services";

async function getStats() {
  const db = await idbDB;

  const tx = db.transaction(
    [StorageKeys.CourseItems, StorageKeys.PracticeItems, StorageKeys.Audio],
    "readonly",
  );

  const courseStore = tx.objectStore(StorageKeys.CourseItems);
  const practiceStore = tx.objectStore(StorageKeys.PracticeItems);
  const audioStore = tx.objectStore(StorageKeys.Audio);

  const [courseItemsCount, practiceItemsCount, audioCount] = await Promise.all([
    courseStore.count(),
    practiceStore.count(),
    audioStore.count(),
  ]);

  await tx.done;

  return {
    courseItemsCount,
    practiceItemsCount,
    audioCount,
  };
}

export function StorageStats() {
  const [courseItemsCount, setCourseItemsCount] = useState<number | null>(null);
  const [practiceItemsCount, setPracticeItemsCount] = useState<number | null>(null);
  const [audioCount, setAudioCount] = useState<number | null>(null);

  async function update() {
    const stats = await getStats();
    setCourseItemsCount(stats.courseItemsCount);
    setPracticeItemsCount(stats.practiceItemsCount);
    setAudioCount(stats.audioCount);
  }

  useEffect(() => {
    (async () => {
      await update();
    })();
  }, []);

  return (
    <div onClick={update}>
      <p>{courseItemsCount} Course items</p>
      <p>{practiceItemsCount} Practice items</p>
      <p>{audioCount} Audio files</p>
    </div>
  );
}
