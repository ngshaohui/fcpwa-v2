import { useSettingsDispatch } from "@/SettingsContext";
import styles from "./Menubar.module.css";

import settingsIcon from "@/assets/tool.svg";

export function Menubar() {
  const dispatch = useSettingsDispatch();

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div
          className={styles.logo}
          onClick={() => {
            dispatch({ type: "SET_APP_STATE", payload: "setup" });
          }}
        >
          <span>fcpwa-v2</span>
        </div>
      </div>
      <div className={styles.right}>
        <button
          onClick={() => {
            dispatch({ type: "SET_APP_STATE", payload: "settings" });
          }}
        >
          <img src={settingsIcon} className={styles.icon} />
        </button>
      </div>
    </div>
  );
}
