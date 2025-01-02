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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        `INSERT INTO videos (title, uploader, description) VALUES (?, ?, ?);`,
        [title, uploader, description || ""]
      );
      console.log(`Video data added: ${title}, ${uploader}`);
    } catch (error) {
      console.error("Error adding video data to vault:", error);
    }
  };

  return {
    initVault,
    addVideoDataToVault,
  };
};

export default useVault;
