import { useState } from "react";

import { useSettings, useSettingsDispatch } from "@/SettingsContext";
import {
  backupPracticeItems,
  checkHealth,
  fetchAndSaveData,
  retryFetchAudio,
  syncPracticeItems,
} from "@/utils/dataset";
import { updateUserSettings } from "@/utils/services";

import { StorageStats } from "./StorageStats";

import styles from "./DataSource.module.css";

const INPUT_DATASOURCE_NAME = "datasource";

export function DataSource() {
  const [msg, setMsg] = useState("");
  const [url, setUrl] = useState("");
  const settings = useSettings();
  const settingsDispatch = useSettingsDispatch();

  // check if url is valid, set state if it is
  // other functionality to fetch and sync data is disabled if url is invalid
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    // remove trailing slash
    const urlCandidate = (formData.get(INPUT_DATASOURCE_NAME) as string).replace(/\/+$/, "");
    if (!urlCandidate) return; // ignore empty string, it results in relative URL
    setUrl("");
    setMsg("");

    try {
      const isValidUrl = await checkHealth(urlCandidate);
      if (isValidUrl) {
        setMsg("URL provided is valid.");
        setUrl(urlCandidate);
      } else {
        setMsg("URL provided fails health check.");
      }
    } catch (e) {
      setMsg("Error while checking datasource server, check console for more info.");
      throw e; // re-throw
    }
  }

  async function fetchData() {
    // TODO: move this to a worker
    try {
      await fetchAndSaveData(url);
      setMsg("Fetch complete.");
    } catch (e) {
      setMsg("Error while fetching data, check console for more info.");
      throw e; // re-throw
    }
  }

  async function syncData() {
    // TODO: move this to a worker
    try {
      await syncPracticeItems(url);
      setMsg("Sync complete.");
    } catch (e) {
      setMsg("Error while synchronising data, check console for more info.");
      throw e; // re-throw
    }
  }

  async function backupData() {
    // TODO: move this to a worker
    try {
      await backupPracticeItems(url);
      setMsg("Backup complete.");
    } catch (e) {
      setMsg("Error while backing up data, check console for more info.");
      throw e; // re-throw
    }
  }

  async function retryAudio() {
    // TODO: move this to a worker
    try {
      await retryFetchAudio(url);
      setMsg("Retry complete.");
    } catch (e) {
      setMsg("Error while fetching audio files, check console for more info.");
      throw e; // re-throw
    }
  }

  const isValidUrl = url !== "";

  // TODO: can explore putting the updateUserSettings portion within the context itself
  // use a useEffect to watch for changes and update accordingly
  function toggleAutoplay() {
    settingsDispatch({ type: "SET_AUTOPLAY_AUDIO", payload: !settings.config.autoplayAudio });
    updateUserSettings({ ...settings.config, autoplayAudio: !settings.config.autoplayAudio });
  }

  function toggleMute() {
    settingsDispatch({ type: "SET_MUTE_AUDIO", payload: !settings.config.muteAudio });
    updateUserSettings({ ...settings.config, muteAudio: !settings.config.muteAudio });
  }

  function toggleShowTransliteration() {
    settingsDispatch({
      type: "SET_SHOW_TRANSLITERATION",
      payload: !settings.config.showTransliteration,
    });
    updateUserSettings({
      ...settings.config,
      showTransliteration: !settings.config.showTransliteration,
    });
  }

  function toggleShowTranslation() {
    settingsDispatch({ type: "SET_SHOW_ENGLISH", payload: !settings.config.showEnglish });
    updateUserSettings({ ...settings.config, showEnglish: !settings.config.showEnglish });
  }

  return (
    <div className={styles.container}>
      <h3>App settings</h3>
      <table className={styles.appSettingsTable}>
        <tbody>
          <tr>
            <td>
              <label>Autoplay Audio</label>
            </td>
            <td>
              <input
                onChange={toggleAutoplay}
                type="checkbox"
                checked={settings.config.autoplayAudio}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Mute Audio</label>
            </td>
            <td>
              <input onChange={toggleMute} type="checkbox" checked={settings.config.muteAudio} />
            </td>
          </tr>
          <tr>
            <td>
              <label>Show Transliteration</label>
            </td>
            <td>
              <input
                onChange={toggleShowTransliteration}
                type="checkbox"
                checked={settings.config.showTransliteration}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Show Translation</label>
            </td>
            <td>
              <input
                onChange={toggleShowTranslation}
                type="checkbox"
                checked={settings.config.showEnglish}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <h3>Data sources</h3>
      <form className={styles.form} method="get" onSubmit={handleSubmit}>
        <label className={styles.label}>
          Datasource URL
          <input className={styles.input} type="text" name={INPUT_DATASOURCE_NAME} />
        </label>
        <br />
        <button className={styles.submitButton} type="submit">
          Check datasource server
        </button>
      </form>
      <p>{msg}</p>

      <hr />

      <button onClick={fetchData} disabled={!isValidUrl}>
        Fetch data
      </button>
      <br />
      <button onClick={syncData} disabled={!isValidUrl}>
        Sync data
      </button>
      <br />
      <button onClick={backupData} disabled={!isValidUrl}>
        Backup data
      </button>
      <br />
      <button onClick={retryAudio} disabled={!isValidUrl}>
        Retry fetch audio
      </button>

      <hr />

      <StorageStats />
    </div>
  );
}
