import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { IDB_BOOL } from "@/common/constants";
import type { CourseItem, QuizItem } from "@/common/types";
import { getQuizItems, modifyEaseFactor, toggleActive } from "@/utils/review";

import ReviewCard from "./ReviewCard";

import styles from "./Review.module.css";

type SortField = "active" | "date" | "repetitions" | "ease";
type SortDir = "asc" | "desc" | "neutral";
type SortState = Record<SortField, SortDir>;

type OptionalColumn = "translation" | "transliteration" | "repetitions" | "easeToggle";

const SORT_PRIORITY: SortField[] = ["active", "date", "repetitions", "ease"];

const DEFAULT_SORT: SortState = {
  active: "neutral",
  date: "asc",
  repetitions: "neutral",
  ease: "neutral",
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
      case "ease":
        diff = a.practiceItem.easeFactor - b.practiceItem.easeFactor;
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
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT);
  const [visibleColumns, setVisibleColumns] = useState<Set<OptionalColumn>>(new Set());
  const [canActivate, setCanActivate] = useState(false);
  const [selectedItem, setSelectedItem] = useState<null | CourseItem>(null);
  const hasPopulated = useRef(false);

  async function populate() {
    const ls = await getQuizItems(100);
    setQuizItems(ls);
    const lastItem: [number, number] = [
      ls[ls.length - 1].practiceItem.active,
      ls[ls.length - 1].practiceItem.date,
    ];
    const items = await getQuizItems(null, lastItem);
    setQuizItems((curItems) => [...curItems, ...items]);
  }

  useEffect(() => {
    if (hasPopulated.current) {
      return;
    }
    hasPopulated.current = true;
    populate();
  }, []);

  const sortedItems = useMemo(
    () => [...quizItems].sort((a, b) => compareBySortState(a, b, sortState)),
    [quizItems, sortState],
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
    if (!canActivate) {
      return;
    }
    await toggleActive(item.practiceItem.courseItemId, item.practiceItem.active);
    setQuizItems((prev) =>
      prev.map((i) =>
        i.practiceItem.courseItemId === item.practiceItem.courseItemId
          ? {
              ...i,
              practiceItem: {
                ...i.practiceItem,
                active: i.practiceItem.active === IDB_BOOL.True ? IDB_BOOL.False : IDB_BOOL.True,
                date: i.practiceItem.date + 1,
              },
            }
          : i,
      ),
    );
  }

  async function changeEaseFactor(item: QuizItem, dir: "inc" | "dec") {
    const newEaseFactor =
      dir === "inc" ? item.practiceItem.easeFactor + 1 : item.practiceItem.easeFactor - 1;
    await modifyEaseFactor(item.practiceItem.courseItemId, newEaseFactor);
    setQuizItems((prev) =>
      prev.map((i) =>
        i.practiceItem.courseItemId === item.practiceItem.courseItemId
          ? {
              ...i,
              practiceItem: {
                ...i.practiceItem,
                easeFactor: newEaseFactor,
                date: i.practiceItem.date + 1,
              },
            }
          : i,
      ),
    );
  }

  const showTranslation = visibleColumns.has("translation");
  const showTransliteration = visibleColumns.has("transliteration");
  const showRepetitions = visibleColumns.has("repetitions");
  const showEaseToggle = visibleColumns.has("easeToggle");

  return (
    <div className={styles.container}>
      {createPortal(
        <ReviewCard onClose={() => setSelectedItem(null)} courseItem={selectedItem} />,
        document.body,
      )}
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
        <label>
          <input
            type="checkbox"
            checked={canActivate}
            onChange={() => setCanActivate((state) => !state)}
          />
          Toggle Active
        </label>
        <label>
          <input
            type="checkbox"
            checked={showEaseToggle}
            onChange={() => toggleColumn("easeToggle")}
          />
          Modify Ease Factor
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
              <th className={styles.sortable} onClick={() => handleSort("ease")}>
                Ease
                <SortIndicator dir={sortState.ease} />
              </th>
              {showEaseToggle && (
                <>
                  <th>+</th>
                  <th>-</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr key={item.courseItem.id}>
                <td onClick={() => setSelectedItem(item.courseItem)}>{item.courseItem.cue.text}</td>
                {showTransliteration && <td>{item.courseItem.cue.transliteration ?? ""}</td>}
                {showTranslation && <td>{item.courseItem.cue.translation}</td>}
                <td className={styles.activeToggle} onClick={() => handleToggleActive(item)}>
                  {item.practiceItem.active === IDB_BOOL.True ? "\u2713" : "\u2717"}
                </td>
                {showRepetitions && <td>{item.practiceItem.repetitions}</td>}
                <td>{formatDate(item.practiceItem.date)}</td>
                <td>{item.practiceItem.easeFactor.toFixed(2)}</td>
                {showEaseToggle && (
                  <>
                    <td onClick={() => changeEaseFactor(item, "inc")}>+</td>
                    <td onClick={() => changeEaseFactor(item, "dec")}>-</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
