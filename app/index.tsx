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
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import DownloadingModal from "@/components/DownloadingModal";
import GetLinkModal from "@/components/GetLinkModal";
import Entypo from "@expo/vector-icons/Entypo";
import * as Notifications from "expo-notifications";

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

/* make notifications visible when theyre called */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  const [progress, setProgress] = useState(0);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pressedDownload, setPressedDownload] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]); // State to store video thumbnails

  /* Request permissions at the start */
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "android") {
        /* request Media perms */
        const mediaStatus = await MediaLibrary.requestPermissionsAsync();
        setHasMediaPermission(mediaStatus.status === "granted");

        /* request notification perms */
        const notificationStatus =
          await Notifications.requestPermissionsAsync();
        setHasNotificationPermission(notificationStatus.status === "granted");
      } else {
        setHasMediaPermission(true);
        setHasNotificationPermission(true); // Set as granted by default for iOS
      }
    };

    requestPermissions();
  }, []);

  /* Fetch videos from "VidVault" album */
  useEffect(() => {
    fetchVideos();
  }, [hasMediaPermission]);

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
    if (!hasMediaPermission) {
      alert("Please grant storage permissions.");
      return;
    }
    setIsDownloading(true);
    const downloadInfo = await getDownloadInfo(videoUrl);
    const { url, title, uploader, description } = downloadInfo;
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

        await saveVideoToGallery(uri);
        sendCompleteNotification(title, uploader);

        fetchVideos(); // Refetch videos after download
      } else {
        console.error("Download failed: No URI returned");
      }
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  const sendCompleteNotification = async (title: string, uploader: string) => {
    if (!hasNotificationPermission) {
      console.error("Notification permissions not granted");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Download completed",
        body: `Video "${title} - ${uploader}" is saved to gallery.`,
      },
      trigger: null,
    });
  };

  const getDownloadInfo = async (videoUrl: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/download?url=${videoUrl}`);
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
          columnGap: 15,
        }}
        renderItem={({ item }) => (
          <Pressable className="w-[30%] flex items-center justify-center aspect-square mb-2.5">
            <Image
              source={{ uri: item }}
              className="w-full h-full rounded-xl"
            />
            <Entypo
              name="controller-play"
              size={50}
              color="white"
              className="absolute"
            />
          </Pressable>
        )}
      />

      <TouchableOpacity
        className="absolute bottom-20 right-10 bg-[#a64e6a] flex items-center justify-center p-5 rounded-full"
        onPress={() => setPressedDownload(true)}
      >
        <AntDesign name="download" size={28} color="white" />
      </TouchableOpacity>

      <DownloadingModal isOpen={isDownloading} progress={progress} />
      <GetLinkModal
        isOpen={pressedDownload}
        onClose={() => setPressedDownload(false)}
        onConfirm={(url) => downloadVideo(url)}
      />
    </SafeAreaView>
  );
}
