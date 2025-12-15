import { IDB_BOOL, StorageKeys } from "@/common/constants";
import { idbDB } from "@/utils/services";
import { useEffect, useState } from "react";

async function countPracticeItems(): Promise<[number, number]> {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readonly");
  const store = tx.objectStore(StorageKeys.PracticeItems);
  const totalCount = await store.count();
  const index = store.index("active");
  const activeCount = await index.count(IDB_BOOL.True);
  return [activeCount, totalCount];
}

async function countAudioItems() {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.Audio, "readonly");
  const store = tx.objectStore(StorageKeys.Audio);
  return store.count();
}

export function Stats() {
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [audioCount, setAudioCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [active, total] = await countPracticeItems();
      setActiveCount(active);
      setTotalCount(total);
      const audio = await countAudioItems();
      setAudioCount(audio);
    })();
  }, []);

  return (
    <div>
      <p>
        {activeCount} Active &#40;out of {totalCount} total items&#41;
      </p>
      <p>{audioCount} Audio files</p>
    </div>
  );
}
