import { createContext, useContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import type { AppState } from "@/common/types";

type AppSettings = {
  appState: AppState;
  muteAudio: boolean;
  showTransliteration: boolean;
  showEnglish: boolean;
  numNewItems: number;
};

const DEFAULT_SETTINGS: AppSettings = {
  appState: "setup",
  muteAudio: false,
  showTransliteration: false,
  showEnglish: false,
  numNewItems: 5,
};

type Action =
  | { type: "SET_APP_STATE"; payload: AppState }
  | { type: "SET_MUTE_AUDIO"; payload: boolean }
  | { type: "SET_SHOW_TRANSLITERATION"; payload: boolean }
  | { type: "SET_SHOW_ENGLISH"; payload: boolean }
  | { type: "SET_NEW_QUIZ"; payload: number };

const SettingsContext = createContext<AppSettings>(DEFAULT_SETTINGS);
const SettingsDispatchContext = createContext<Dispatch<Action> | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, dispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS);

  return (
    <SettingsContext.Provider value={settings}>
      <SettingsDispatchContext.Provider value={dispatch}>
        {children}
      </SettingsDispatchContext.Provider>
    </SettingsContext.Provider>
  );
}

function settingsReducer(settings: AppSettings, action: Action) {
  switch (action.type) {
    case "SET_APP_STATE": {
      return {
        ...settings,
        appState: action.payload,
      };
    }
    case "SET_MUTE_AUDIO": {
      return {
        ...settings,
        muteAudio: action.payload,
      };
    }
    case "SET_SHOW_TRANSLITERATION": {
      return {
        ...settings,
        showTransliteration: action.payload,
      };
    }
    case "SET_SHOW_ENGLISH": {
      return {
        ...settings,
        showEnglish: action.payload,
      };
    }
    case "SET_NEW_QUIZ": {
      return {
        ...settings,
        appState: "quiz" as AppState,
        numNewItems: action.payload,
      };
    }
  }
}

export function useSettings() {
  return useContext(SettingsContext);
}

export function useSettingsDispatch() {
  const dispatch = useContext(SettingsDispatchContext);
  if (dispatch === null) {
    // should never be null
    throw Error("Problem initializing SettingsDispatchContext");
  }
  return dispatch;
}
