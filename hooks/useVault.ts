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

  const addVideoDataToVault = async (data: VideoData) => {
    if (!data.title || !data.uploader) {
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
        [data.id, data.title, data.uploader, data.description || ""]
      );
      console.log(`Video data added: ${data.title}, ${data.uploader}`);
    } catch (error) {
      console.error("Error adding video data to vault:", error);
    }
  };

  const getVideoDataFromVault = async (id: string): Promise<VideoData | undefined> => {
    const correspondingId = Number(id) - 1;
    console.log("Fetching data from", correspondingId);
    try {
      const db = await SQLite.openDatabaseAsync("vault.db");
      if (!db) {
        console.error("Failed to open database.");
        return;
      }

      const result = (await db.getFirstAsync(
        `SELECT * FROM videos WHERE id = ?;`,
        [correspondingId]
      )) as VideoData;

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
