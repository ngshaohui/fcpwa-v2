export interface QuizItem {
  courseItem: CourseItem;
  practiceItem: PracticeItem;
}

export interface CourseItem {
  id: string; // UUID
  cue: Cue;
  sentences: Sentence[];
}

export interface Cue {
  text: string;
  transliteration: string | null;
  translation: string;
  category: string | null;
  audioUrl: string | null;
}

export interface Sentence {
  text: string;
  textCue: string;
  transliteration: string | null;
  transliterationCue: string | null;
  translation: string;
  audioUrl: string | null;
}

export interface PracticeItem {
  courseItemId: string; // UUID
  active: number; // IDB_BOOL constant
  repetitions: number;
  easeFactor: number;
  date: number; // unix time
}

type UnixTime = number;

export interface UserProgressResponse {
  lastUpdate: UnixTime;
  practiceItems: PracticeItem[];
}

export interface UserSettings {
  muteAudio: boolean;
  autoplayAudio: boolean;
  showTransliteration: boolean;
  showEnglish: boolean;
  includeNewItems: boolean;
}

export type AppState = "setup" | "quiz" | "settings" | "review";
