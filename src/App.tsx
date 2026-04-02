import "./App.css";
import { DataSource } from "@/components/Data";
import { Menubar } from "@/components/Menubar";
import { QuizMode } from "@/components/Quiz";
import { Review } from "@/components/Review";
import { QuizSetup } from "@/components/Setup";
import { useSettings } from "@/SettingsContext";

import { AudioProvider } from "./AudioContext";

import styles from "./App.module.css";

function BottomSafeArea() {
  return <div className={styles.bottomSafeArea} />;
}

function App() {
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
    <AudioProvider muted={settings.muteAudio}>
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
