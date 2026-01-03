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

export const AppState = {
  home: Symbol(),
  quiz: Symbol(),
  settings: Symbol(),
};
