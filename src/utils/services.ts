import type { DBSchema } from "idb";
import { openDB } from "idb";

import { DBName, StorageKeys } from "@/common/constants";
import type { CourseItem, PracticeItem, UserSettings } from "@/common/types";

const DEFAULT_USER_SETTINGS: UserSettings = {
  muteAudio: false,
  autoplayAudio: false,
  showTransliteration: false,
  showEnglish: false,
  includeNewItems: true,
};

export interface IDBDB extends DBSchema {
  [StorageKeys.CourseItems]: {
    key: string;
    value: CourseItem;
  };
  [StorageKeys.PracticeItems]: {
    key: string;
    value: PracticeItem;
    indexes: {
      date: number;
      active: number;
      active_date: [number, number];
    };
  };
  [StorageKeys.Audio]: {
    key: string; // will use the url/filename as the key
    value: Blob;
  };
  [StorageKeys.UserSettings]: {
    key: string;
    value: UserSettings;
  };
}

export const idbDB = openDB<IDBDB>(DBName, 1, {
  upgrade(db) {
    db.createObjectStore(StorageKeys.CourseItems, {
      keyPath: "id",
    });
    const practiceItemsStore = db.createObjectStore(StorageKeys.PracticeItems, {
      keyPath: "courseItemId",
    });
    practiceItemsStore.createIndex("date", "date");
    practiceItemsStore.createIndex("active", "active");
    practiceItemsStore.createIndex("active_date", ["active", "date"]);
    db.createObjectStore(StorageKeys.Audio);
    const userSettingsStore = db.createObjectStore(StorageKeys.UserSettings);
    userSettingsStore.add(DEFAULT_USER_SETTINGS, StorageKeys.UserSettings);
  },
});

// move this out to its own user settings file
export async function getUserSettings(): Promise<UserSettings> {
  const userSettings = await (await idbDB).get(StorageKeys.UserSettings, StorageKeys.UserSettings);
  if (!userSettings) {
    throw new Error("Error retrieving user settings from store");
  }
  return userSettings;
}

export async function updateUserSettings(userSettings: UserSettings) {
  const db = await idbDB;
  const tx = db.transaction(StorageKeys.UserSettings, "readwrite");
  const store = tx.objectStore(StorageKeys.UserSettings);
  await store.put(userSettings, StorageKeys.UserSettings);
  await tx.done;
}
