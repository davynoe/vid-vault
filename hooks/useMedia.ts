import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { useState } from "react";

const useMedia = () => {
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [videoAssets, setVideoAssets] = useState<VideoAssetInfo[]>([]);

  const saveVideoToGallery = async (uri: string) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("VidVault", asset, false);
      console.log("Video saved to gallery");
      return asset;
    } catch (error) {
      console.error("Failed to save video to gallery", error);
    } 
  };

  const deleteUri = async (uri: string) => {
    await FileSystem.deleteAsync(uri);
    console.log("Deleted video from cache");
  };

  const requestMediaPermission = async () => {
    if (Platform.OS === "android") {
      const result = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(result.status === "granted");
    } else {
      setHasMediaPermission(true);
    }
  };

  const fetchVideoAssets = async (assets: MediaLibrary.Asset[]) => {
    const videoAssets = await Promise.all(
      assets.map(async (asset) => {
        const { uri } = await MediaLibrary.getAssetInfoAsync(asset.id);
        return { uri, id: asset.id, duration: asset.duration };
      })
    );
    setVideoAssets(videoAssets);
  };

  const fetchGallery = async () => {
    console.log("Fetching videos from gallery...");
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
          fetchVideoAssets(assets.assets); 
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    }
  };

  return {
    hasMediaPermission,
    videoAssets,
    requestMediaPermission,
    fetchGallery,
    saveVideoToGallery,
    deleteUri,
  }
}

export default useMedia;