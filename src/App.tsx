import "./App.css";

import { useSettings } from "@/SettingsContext";
import { Menubar } from "@/components/Menubar";
import { DataSource } from "@/components/Data";
import { QuizSetup } from "@/components/Setup";
import { QuizMode } from "@/components/Quiz";
import { Review } from "@/components/Review";

import styles from "./App.module.css";
import { AudioProvider } from "./AudioContext";

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
