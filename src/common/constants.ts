// to get the item from the browser store

export const DBName = "fcpwav2";

export const StorageKeys = {
  PracticeItems: "PracticeItems", // PracticeItem[]
  CourseItems: "CourseItems", // CourseItem[]
  Audio: "Audio",
  UserSettings: "UserSettings", // UserSettings
} as const;

// IDB does not support boolean indexes, use number as workaround
export const IDB_BOOL = {
  False: 0,
  True: 1,
} as const;

export const STUDY_ALL = "study_all";

export const Theme = {
  indigo: "#282D4F",
  orange: "#FF6C00",
  silver: "#C4C4C4",
  maroon: "#A0204C",
};

export const AppState = {
  home: Symbol(),
  quiz: Symbol(),
  settings: Symbol(),
};
