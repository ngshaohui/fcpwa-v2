import { IDB_BOOL, StorageKeys } from "@/common/constants";
import type { PracticeItem } from "@/common/types";
import { idbDB } from "@/utils/services";
import { useEffect, useState } from "react";

interface ActiveStatsData {
  active: number;
  deactivated: number;
  attempted: number;
  total: number;
}

async function countActiveStats(): Promise<ActiveStatsData> {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readonly");
  const store = tx.objectStore(StorageKeys.PracticeItems);
  const items: PracticeItem[] = await store.getAll();

  let active = 0;
  let deactivated = 0;
  let attempted = 0;

  for (const item of items) {
    if (item.active === IDB_BOOL.True) {
      active++;
    }
    if (item.repetitions > 0) {
      attempted++;
      if (item.active === IDB_BOOL.False) {
        deactivated++;
      }
    }
  }

  return { active, deactivated, attempted, total: items.length };
}

function formatPercent(numerator: number, denominator: number): string {
  if (denominator === 0) {
    return "0.00";
  }
  return ((numerator / denominator) * 100).toFixed(2);
}

export function ActiveStats() {
  const [stats, setStats] = useState<ActiveStatsData | null>(null);

  useEffect(() => {
    countActiveStats().then(setStats);
  }, []);

  if (!stats) {
    return null;
  }

  return (
    <div>
      <p>Active: {stats.active}</p>
      <p>Deactivated: {stats.deactivated}</p>
      <p>
        Completion: {stats.attempted} out of {stats.total} &#40;
        {formatPercent(stats.attempted, stats.total)}%&#41;
      </p>
    </div>
  );
}
