import { StorageKeys } from "@/common/constants";
import type { CourseItem, PracticeItem, QuizItem } from "@/common/types";
import { idbDB } from "./services";

export async function checkHealth(baseUrl: string): Promise<boolean> {
  const url = `${baseUrl}/fcpwa-health`;
  const res = await fetch(url);
  return (await res.text()) === "fcpwa";
}

async function fetchQuizItems(
  baseUrl: string,
  language: string,
  existing: string[]
): Promise<QuizItem[]> {
  const url = `${baseUrl}/${language}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(existing),
  });
  return (await res.json()) as QuizItem[];
}

// TODO: unused
export async function fetchAudioFiles(
  baseUrl: string,
  fileNames: string[]
): Promise<Blob[]> {
  const blobs = await Promise.all(
    fileNames.map(async (fileName) => {
      const url = `${baseUrl}/audio/${fileName}`;
      const res = await fetch(url);
      const blob = await res.blob();
      return blob;
    })
  );
  return blobs;
}

async function saveCourseItems(items: CourseItem[]) {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.CourseItems, "readwrite");
  const store = tx.objectStore(StorageKeys.CourseItems);

  for (const item of items) {
    store.put(item);
  }

  await tx.done;
}

async function savePracticeItems(items: PracticeItem[]) {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.PracticeItems, "readwrite");
  const store = tx.objectStore(StorageKeys.PracticeItems);

  for (const item of items) {
    store.put(item);
  }

  await tx.done;
}

// TODO: unused
export async function saveAudioFile(itemNames: string[], items: Blob[]) {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.Audio, "readwrite");
  const store = tx.objectStore(StorageKeys.Audio);

  for (let i = 0; i < itemNames.length; i++) {
    store.put(items[i], itemNames[i]);
  }

  await tx.done;
}

async function getExistingPracticeItems(): Promise<string[]> {
  const db = await idbDB;
  return db.getAllKeys(StorageKeys.PracticeItems);
}

export async function fetchAndSaveData(baseUrl: string) {
  const existingPracticeItemKeys = await getExistingPracticeItems();

  const quizItems = await fetchQuizItems(
    baseUrl,
    "jp",
    existingPracticeItemKeys
  ); // hardcoded to jp
  const courseItems = quizItems.map((item) => item.courseItem);
  await saveCourseItems(courseItems);
  const practiceItems = quizItems.map((item) => item.practiceItem);
  await savePracticeItems(practiceItems);

  const maybeUrls: (string | null)[] = [];
  for (const item of courseItems) {
    maybeUrls.push(item.cue.audioUrl);
    for (const sentence of item.sentences) {
      maybeUrls.push(sentence.audioUrl);
    }
  }
  const audioUrls = maybeUrls.filter((url) => url !== null);
  for (let i = 0; i < audioUrls.length; i += 100) {
    const urls = audioUrls.slice(i, i + 100);
    const audioFiles = await fetchAudioFiles(baseUrl, urls);
    await saveAudioFile(urls, audioFiles);
  }
}

// TODO: remove this hack
export async function retryFetchAudio(baseUrl: string) {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.CourseItems, "readonly");
  const store = tx.objectStore(StorageKeys.CourseItems);
  const courseItems = await store.getAll();

  const tx2 = db.transaction(StorageKeys.Audio, "readonly");
  const store2 = tx2.objectStore(StorageKeys.Audio);
  const existing = await store2.getAllKeys();
  // multiple items may share the same audio file, only want uniques
  const existingSet: Set<string> = new Set(existing);

  const maybeUrls: (string | null)[] = [];
  for (const item of courseItems) {
    maybeUrls.push(item.cue.audioUrl);
    for (const sentence of item.sentences) {
      maybeUrls.push(sentence.audioUrl);
    }
  }
  const a1: string[] = maybeUrls.filter((url) => url !== null);
  // filter out existing urls
  const audioUrls = a1.filter((url) => !existingSet.has(url));
  for (let i = 0; i < audioUrls.length; i += 100) {
    const urls = audioUrls.slice(i, i + 100);
    const audioFiles = await fetchAudioFiles(baseUrl, urls);
    await saveAudioFile(urls, audioFiles);
  }
}

export async function syncPracticeItems(baseUrl: string) {
  const toUpdate = await uploadPracticeItems(baseUrl);
  await savePracticeItems(toUpdate);
}

async function uploadPracticeItems(baseUrl: string) {
  const url = `${baseUrl}/sync`;
  const db = await idbDB;
  const practiceItems: PracticeItem[] = await db.getAll("PracticeItems");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(practiceItems),
  });
  return (await res.json()) as PracticeItem[];
}
