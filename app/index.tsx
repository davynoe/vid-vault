import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import "../global.css";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";

export default function Index() {
  const [progress, setProgress] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

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

  /* Handle download */
  const downloadVideo = async () => {
    if (!hasPermission) {
      alert("Please grant storage permissions.");
      return;
    }

    const filename = "dobby.mp4";
    const videoUrl = await Clipboard.getStringAsync();
    console.log("Video url got from clipboard:", videoUrl);
    const downloadLink = (await getDownloadLink(videoUrl)) as string;
    console.log(`Downloading video ${videoUrl}...`);

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadLink,
        FileSystem.documentDirectory + filename,
        {},
        (downloadProgress) => {
          console.log("Download progress:", downloadProgress);
          if (downloadProgress.totalBytesExpectedToWrite > 0) {
            const progress =
              downloadProgress.totalBytesWritten /
              downloadProgress.totalBytesExpectedToWrite;
            setProgress(progress); // Update progress state
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        /* Typescript would cry otherwise */
        const { uri } = result;
        console.log("Download finished at:", uri);

        saveVideoToGallery(uri, filename);
      } else {
        console.error("Download failed: No URI returned");
      }
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const getDownloadLink = async (videoUrl: string) => {
    try {
      console.log("Getting download link...");
      const response = await fetch(
        `http://192.168.1.105:8000/download?url=${videoUrl}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.text();
      console.log("result taken:", result);
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
    } catch (error) {
      console.error("Failed to save video to gallery", error);
      shareAsync(uri); /* Share if saving fails for some reason */
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-[#7a354b] flex-col pt-2 px-8">
      <View className="w-full flex-row items-center justify-between">
        <Text className="text-[30px] text-white font-semibold">VidVault</Text>
        <View className="flex-row gap-4">
          <Pressable>
            <AntDesign name="setting" size={28} color="white" />
          </Pressable>
          <Pressable>
            <AntDesign name="question" size={28} color="white" />
          </Pressable>
        </View>
      </View>

      <Text className="absolute top-1/2 text-white self-center font-semibold text-lg">
        {Math.round(progress * 100)}%
      </Text>

      <ScrollView className="flex-1 w-full"></ScrollView>

      <TouchableOpacity
        className="absolute bottom-20 right-10 bg-[#a64e6a] flex items-center justify-center p-5 rounded-full"
        onPress={downloadVideo}
      >
        <AntDesign name="download" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
