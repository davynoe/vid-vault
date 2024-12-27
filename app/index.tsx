import {
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import "../global.css";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import DownloadingModal from "@/components/DownloadingModal";
import GetLinkModal from "@/components/GetLinkModal";

export default function Index() {
  const [progress, setProgress] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pressedDownload, setPressedDownload] = useState(false);
  const [videos, setVideos] = useState<any[]>([]); // State to store video assets
  const [thumbnails, setThumbnails] = useState<any[]>([]); // State to store video thumbnails

  /* Request permissions at the start */
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "android") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === "granted");
      } else {
        setHasPermission(true); /* No extra permission needed for iOS */
      }
    };
    requestPermissions();
  }, []);

  /* Fetch videos from "VidVault" album */
  useEffect(() => {
    fetchVideos();
  }, [hasPermission]);

  const fetchVideos = async () => {
    if (hasPermission) {
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
          setVideos(assets.assets); // Store the video assets
          fetchThumbnails(assets.assets); // Fetch thumbnails for each video
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    }
  };

  /* Fetch video thumbnails */
  const fetchThumbnails = async (assets: any[]) => {
    const thumbnails = await Promise.all(
      assets.map(async (asset) => {
        const { uri } = await MediaLibrary.getAssetInfoAsync(asset.id);
        return uri;
      })
    );
    setThumbnails(thumbnails); // Set the fetched thumbnails
  };

  /* Handle download */
  const downloadVideo = async (videoUrl: string) => {
    if (!hasPermission) {
      alert("Please grant storage permissions.");
      return;
    }
    setIsDownloading(true);
    const downloadInfo = await getDownloadInfo(videoUrl);
    const url = downloadInfo?.url;
    const title = downloadInfo?.title;
    const uploader = downloadInfo?.uploader;
    console.log(`Downloading video: ${title} by ${uploader}`);
    const filename = `${title}.mp4`;
    if (!url) {
      console.error("No download link found");
      setIsDownloading(false);
      return;
    }
    console.log(`Downloading video...`);

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.documentDirectory + filename,
        {},
        (downloadProgress) => {
          console.log("Download progress:", downloadProgress);
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setProgress(progress);
        }
      );
      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        const { uri } = result;
        console.log("Download finished at:", uri);
        setIsDownloading(false);
        await saveVideoToGallery(uri, filename);
        fetchVideos(); // Refetch videos after download
      } else {
        console.error("Download failed: No URI returned");
      }
    } catch (error) {
      console.error("Download failed", error);
      setIsDownloading(false);
    }
  };

  const getDownloadInfo = async (videoUrl: string) => {
    try {
      const response = await fetch(
        `http://192.168.1.105:8000/download?url=${videoUrl}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      console.error("Couldn't retrieve download link", error);
    }
  };

  const saveVideoToGallery = async (uri: string, filename: string) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("VidVault", asset, false);
      console.log("Video saved to gallery");
      await FileSystem.deleteAsync(uri); // Delete after saving
    } catch (error) {
      console.error("Failed to save video to gallery", error);
      shareAsync(uri); // Fallback to sharing
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-[#7a354b] flex-col pt-2 px-8">
      <View className="w-full flex-row items-center justify-between mb-2">
        <Text className="text-[30px] text-white font-semibold">VidVault</Text>
        <View className="flex-row gap-4">
          <Pressable>
            <AntDesign name="swap" size={28} color="white" />
          </Pressable>
          <Pressable>
            <AntDesign name="question" size={28} color="white" />
          </Pressable>
        </View>
      </View>

      <FlatList
        className="flex-1 w-full"
        data={thumbnails}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        renderItem={({ item }) => (
          <View className="w-[30%] aspect-square mb-2.5">
            <Image
              source={{ uri: item }}
              className="w-full h-full rounded-xl"
            />
          </View>
        )}
      />

      <TouchableOpacity
        className="absolute bottom-20 right-10 bg-[#a64e6a] flex items-center justify-center p-5 rounded-full"
        onPress={() => setPressedDownload(true)}
      >
        <AntDesign name="download" size={28} color="white" />
      </TouchableOpacity>

      <DownloadingModal isOpen={isDownloading} />
      <GetLinkModal
        isOpen={pressedDownload}
        onClose={() => setPressedDownload(false)}
        onConfirm={(url) => downloadVideo(url)}
      />
    </SafeAreaView>
  );
}
