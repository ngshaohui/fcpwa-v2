import { useState } from "react";

import {
  backupPracticeItems,
  checkHealth,
  fetchAndSaveData,
  retryFetchAudio,
  syncPracticeItems,
} from "@/utils/dataset";

import { Stats } from "./Stats";

import styles from "./DataSource.module.css";

const INPUT_DATASOURCE_NAME = "datasource";

export function DataSource() {
  const [msg, setMsg] = useState("");
  const [url, setUrl] = useState("");

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

  return (
    <div className={styles.container}>
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

      <Stats />
    </div>
  );
}
