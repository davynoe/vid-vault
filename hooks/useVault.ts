import * as SQLite from "expo-sqlite";

const useVault = () => {
  const initVault = async () => {
    try {
      const db = await SQLite.openDatabaseAsync("vault.db");
      if (!db) {
        console.error("Failed to open database.");
        return;
      }
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS videos (
          id INTEGER PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          uploader TEXT NOT NULL,
          description TEXT
        );`
      );
      console.log("Vault has been initialized.");
    } catch (error) {
      console.error("Error initializing the vault:", error);
    }
  };

  const addVideoDataToVault = async (
    id: string,
    title: string,
    uploader: string,
    description: string
  ) => {
    if (!title || !uploader) {
      console.error("Title and uploader are required to add video data.");
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync("vault.db");
      if (!db) {
        console.error("Failed to open database.");
        return;
      }

      await db.runAsync(
        `INSERT INTO videos (id, title, uploader, description) VALUES (?, ?, ?, ?);`,
        [id, title, uploader, description || ""]
      );
      console.log(`Video data added: ${title}, ${uploader}`);
    } catch (error) {
      console.error("Error adding video data to vault:", error);
    }
  };

  const getVideoDataFromVault = async (id: string) => {
    const correspondingId = Number(id) - 1;
    console.log(correspondingId);
    try {
      const db = await SQLite.openDatabaseAsync("vault.db");
      if (!db) {
        console.error("Failed to open database.");
        return;
      }

      const result = await db.getAllAsync(
        `SELECT * FROM videos WHERE id = ?;`,
        [correspondingId]
      );
      return result;
    } catch (error) {
      console.error("Error getting video data from vault:", error);
    }
  };

  return {
    initVault,
    addVideoDataToVault,
    getVideoDataFromVault,
  };
};

export default useVault;
