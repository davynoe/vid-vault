import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { useState } from "react";

const useMedia = () => {
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const saveVideoToGallery = async (uri: string) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("VidVault", asset, false);
      console.log("Video saved to gallery");
    } catch (error) {
      console.error("Failed to save video to gallery", error);
    } finally {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      console.log("Original video removed from cache");
    }
  };

  const requestMediaPermission = async () => {
    if (Platform.OS === "android") {
      const result = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(result.status === "granted");
    } else {
      setHasMediaPermission(true);
    }
  };

  const fetchThumbnails = async (assets: any[]) => {
    const thumbnails = await Promise.all(
      assets.map(async (asset) => {
        const { uri } = await MediaLibrary.getAssetInfoAsync(asset.id);
        return uri;
      })
    );
    setThumbnails(thumbnails); // Set the fetched thumbnails
  };

  const fetchVideos = async () => {
    if (hasMediaPermission) {
      try {
        const albums = await MediaLibrary.getAlbumsAsync();
        const vidVaultAlbum = albums.find(
          (album) => album.title === "VidVault"
        );

        if (vidVaultAlbum) {
          const assets = await MediaLibrary.getAssetsAsync({
            album: vidVaultAlbum.id,
            mediaType: [MediaLibrary.MediaType.video],
          });
          fetchThumbnails(assets.assets); // Fetch thumbnails for each video
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    }
  };

  return {
    hasMediaPermission,
    thumbnails,
    requestMediaPermission,
    fetchVideos,
    saveVideoToGallery,
  }
}

export default useMedia;