import { useEffect, useState } from "react";

import { IDB_BOOL, StorageKeys } from "@/common/constants";
import { idbDB } from "@/utils/services";

interface ActiveStatsData {
  active: number;
  due: number;
  deactivated: number;
  attempted: number;
  total: number;
}

async function countActiveStats(): Promise<ActiveStatsData> {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readonly");
  const store = tx.objectStore(StorageKeys.PracticeItems);

  const now = Date.now();
  const [total, due, active, deactivated] = await Promise.all([
    store.count(),
    store
      .index("active_date")
      .count(IDBKeyRange.bound([IDB_BOOL.True, -Infinity], [IDB_BOOL.True, now])),
    store.index("active").count(IDBKeyRange.only(IDB_BOOL.True)),
    store
      .index("active_repetitions")
      .count(IDBKeyRange.bound([IDB_BOOL.False, 1], [IDB_BOOL.False, Infinity])),
  ]);

  await tx.done;

  return { active, due, deactivated, attempted: active + deactivated, total };
}

function formatPercent(numerator: number, denominator: number): string {
  if (denominator === 0) {
    return "0.00";
  }
  return ((numerator / denominator) * 100).toFixed(2);
}

export function ActiveStats() {
  const [stats, setStats] = useState<ActiveStatsData>({
    active: 0,
    due: 0,
    deactivated: 0,
    attempted: 0,
    total: 0,
  });

  useEffect(() => {
    countActiveStats().then(setStats);
  }, []);

  return (
    <div>
      <p>Active: {stats.active}</p>
      <p>Due: {stats.due}</p>
      <p>Deactivated: {stats.deactivated}</p>
      <p>
        Progress: {stats.attempted} out of {stats.total} &#40;
        {formatPercent(stats.attempted, stats.total)}%&#41;
      </p>
    </div>
  );
}
