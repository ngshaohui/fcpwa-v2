import { useEffect, useMemo, useState } from "react";

import { IDB_BOOL } from "@/common/constants";
import type { QuizItem } from "@/common/types";
import { getAllQuizItems, toggleActive } from "@/utils/review";

import styles from "./Review.module.css";

type SortField = "active" | "date" | "repetitions";
type SortDir = "asc" | "desc" | "neutral";
type SortState = Record<SortField, SortDir>;

type OptionalColumn = "translation" | "transliteration" | "repetitions";

const SORT_PRIORITY: SortField[] = ["active", "date", "repetitions"];

const DEFAULT_SORT: SortState = {
  active: "asc",
  date: "asc",
  repetitions: "neutral",
};

function cycleSortDir(dir: SortDir): SortDir {
  switch (dir) {
    case "neutral":
      return "asc";
    case "asc":
      return "desc";
    case "desc":
      return "neutral";
  }
}

function formatDate(unixTime: number): string {
  const d = new Date(unixTime);
  const year = String(d.getFullYear()).slice(2);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${year}-${month}-${day} ${hours}.${minutes}${ampm}`;
}

function compareBySortState(a: QuizItem, b: QuizItem, sortState: SortState): number {
  for (const field of SORT_PRIORITY) {
    const dir = sortState[field];
    if (dir === "neutral") {
      continue;
    }

    const multiplier = dir === "asc" ? 1 : -1;
    let diff = 0;

    switch (field) {
      case "active":
        diff = b.practiceItem.active - a.practiceItem.active;
        break;
      case "date":
        diff = a.practiceItem.date - b.practiceItem.date;
        break;
      case "repetitions":
        diff = a.practiceItem.repetitions - b.practiceItem.repetitions;
        break;
    }

    if (diff !== 0) {
      return diff * multiplier;
    }
  }

  return a.courseItem.cue.text.localeCompare(b.courseItem.cue.text);
}

function SortIndicator({ dir }: { dir: SortDir }) {
  if (dir === "neutral") {
    return null;
  }
  return <span className={styles.sortIndicator}>{dir === "asc" ? " \u25B2" : " \u25BC"}</span>;
}

export function Review() {
  const [items, setItems] = useState<QuizItem[]>([]);
  const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT);
  const [visibleColumns, setVisibleColumns] = useState<Set<OptionalColumn>>(new Set());

  useEffect(() => {
    getAllQuizItems().then(setItems);
  }, []);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => compareBySortState(a, b, sortState)),
    [items, sortState],
  );

  function handleSort(field: SortField) {
    setSortState((prev) => ({
      ...prev,
      [field]: cycleSortDir(prev[field]),
    }));
  }

  function toggleColumn(col: OptionalColumn) {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) {
        next.delete(col);
      } else {
        next.add(col);
      }
      return next;
    });
  }

  async function handleToggleActive(item: QuizItem) {
    await toggleActive(item.practiceItem.courseItemId, item.practiceItem.active);
    setItems((prev) =>
      prev.map((i) =>
        i.practiceItem.courseItemId === item.practiceItem.courseItemId
          ? {
              ...i,
              practiceItem: {
                ...i.practiceItem,
                active: i.practiceItem.active === IDB_BOOL.True ? IDB_BOOL.False : IDB_BOOL.True,
              },
            }
          : i,
      ),
    );
  }

  const showTranslation = visibleColumns.has("translation");
  const showTransliteration = visibleColumns.has("transliteration");
  const showRepetitions = visibleColumns.has("repetitions");

  return (
    <div className={styles.container}>
      <div className={styles.toggles}>
        <label>
          <input
            type="checkbox"
            checked={showTransliteration}
            onChange={() => toggleColumn("transliteration")}
          />
          Transliteration
        </label>
        <label>
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={() => toggleColumn("translation")}
          />
          Translation
        </label>
        <label>
          <input
            type="checkbox"
            checked={showRepetitions}
            onChange={() => toggleColumn("repetitions")}
          />
          Repetitions
        </label>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cue</th>
              {showTransliteration && <th>Transliteration</th>}
              {showTranslation && <th>Translation</th>}
              <th className={styles.sortable} onClick={() => handleSort("active")}>
                Active
                <SortIndicator dir={sortState.active} />
              </th>
              {showRepetitions && (
                <th className={styles.sortable} onClick={() => handleSort("repetitions")}>
                  Reps
                  <SortIndicator dir={sortState.repetitions} />
                </th>
              )}
              <th className={styles.sortable} onClick={() => handleSort("date")}>
                Due
                <SortIndicator dir={sortState.date} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr key={item.courseItem.id}>
                <td>{item.courseItem.cue.text}</td>
                {showTransliteration && <td>{item.courseItem.cue.transliteration ?? ""}</td>}
                {showTranslation && <td>{item.courseItem.cue.translation}</td>}
                <td className={styles.activeToggle} onClick={() => handleToggleActive(item)}>
                  {item.practiceItem.active === IDB_BOOL.True ? "\u2713" : "\u2717"}
                </td>
                {showRepetitions && <td>{item.practiceItem.repetitions}</td>}
                <td>{formatDate(item.practiceItem.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
