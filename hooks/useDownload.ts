import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

const useDownload = ({hasMediaPermission, pressedDownload}: {hasMediaPermission: boolean, pressedDownload: boolean}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (pressedDownload) {
      setProgress(0);
    }
  }, [pressedDownload]);

  const downloadVideo = async (url: string, title: string, uploader: string, description: string) => {
    if (!hasMediaPermission) {
      alert("Please grant storage permissions.");
      return;
    }
    const filename = `${title}.mp4`;
    if (!url) {
      console.error("No download link found");
      return;
    }
    console.log(`Downloading video: ${title} by ${uploader}`);

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.documentDirectory + filename,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${Math.floor(progress * 100)}%`);
          setProgress(progress);
        }
      );
      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        const { uri } = result;
        console.log("Download finished.");
        return uri;
      } else {
        console.error("Download failed: No URI returned");
      }
    } catch (error) {
      console.error("Download failed", error);
      FileSystem.deleteAsync(FileSystem.documentDirectory + filename);
    }
  };
  const getDownloadInfo = async (videoUrl: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/download?url=${videoUrl}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Couldn't retrieve download link", error);
    }
  };

  return {
    progress,
    downloadVideo,
    getDownloadInfo,
  }
}

export default useDownload;