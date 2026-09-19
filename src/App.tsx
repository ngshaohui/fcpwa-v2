import { useEffect, useState } from "react";

import type { UserSettings } from "@/common/types";
import { DataSource } from "@/components/Data";
import { Menubar } from "@/components/Menubar";
import { QuizMode } from "@/components/Quiz";
import { Review } from "@/components/Review";
import { QuizSetup } from "@/components/Setup";
import { useSettings } from "@/SettingsContext";
import { getUserSettings } from "@/utils/services";

import { AudioProvider } from "./AudioContext";
import { SettingsProvider } from "./SettingsContext";

import styles from "./App.module.css";

function BottomSafeArea() {
  return <div className={styles.bottomSafeArea} />;
}

function AppSettingsWrapper({ children }: { children: React.ReactNode }) {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setUserSettings(await getUserSettings());
    };

    fetchSettings();
  }, []);

  if (!userSettings) {
    return <p>Loading</p>;
  }

  return <SettingsProvider savedSettings={userSettings}>{children}</SettingsProvider>;
}

function App() {
  return (
    <AppSettingsWrapper>
      <AppContent />
    </AppSettingsWrapper>
  );
}

function AppContent() {
  const settings = useSettings();

  let content: React.JSX.Element;

  switch (settings.appState) {
    case "setup":
      content = <QuizSetup />;
      break;
    case "quiz":
      content = <QuizMode />;
      break;
    case "settings":
      content = <DataSource />;
      break;
    case "review":
      content = <Review />;
      break;
    default:
      content = <p>No such page</p>;
  }

  return (
    <AudioProvider muted={settings.config.muteAudio}>
      <div className={styles.container}>
        <Menubar />
        <div className={styles.contentWrapper}>
          <div className={styles.content}>{content}</div>
        </div>
        <BottomSafeArea />
      </div>
    </AudioProvider>
  );
}

export default App;
