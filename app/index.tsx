import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect, useState } from "react";
import DownloadingModal from "@/components/DownloadingModal";
import GetLinkModal from "@/components/GetLinkModal";
import Entypo from "@expo/vector-icons/Entypo";
import useVault from "@/hooks/useVault";
import useMedia from "@/hooks/useMedia";
import useDownload from "@/hooks/useDownload";
import useNotification from "@/hooks/useNotification";
import "../global.css";
import { router } from "expo-router";

const Index = () => {
  const [pressedDownload, setPressedDownload] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { initVault, addVideoDataToVault, getVideoDataFromVault } = useVault();

  const {
    hasMediaPermission,
    thumbnails,
    requestMediaPermission,
    fetchVideos,
    saveVideoToGallery,
    deleteUri,
  } = useMedia();

  const { progress, downloadVideo, getDownloadInfo } = useDownload({
    hasMediaPermission,
  });

  const {
    hasNotificationPermission,
    initNotificationHandler,
    requestNotificationPermission,
    sendCompleteNotification,
  } = useNotification();

  useEffect(() => {
    initVault();
    requestPermissions();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [hasMediaPermission]);

  const requestPermissions = async () => {
    await requestMediaPermission();
    await requestNotificationPermission();
    initNotificationHandler();
  };

  const handleDownload = async (videoUrl: string) => {
    let uri: null | string = null;
    try {
      setIsDownloading(true);
      const downloadInfo = await getDownloadInfo(videoUrl);
      const { url, title, uploader, description } = downloadInfo;
      const uri = await downloadVideo(url, title, uploader, description);
      const asset = await saveVideoToGallery(uri!);

      console.log("Adding video", title, "by", uploader);
      console.log("Video id:", asset!.id);
      await addVideoDataToVault({
        id: asset!.id,
        title,
        uploader,
        description,
      });
      if (hasNotificationPermission) {
        sendCompleteNotification(title);
      }
      fetchVideos();
    } catch (error) {
      console.error("Error downloading video:", error);
    } finally {
      if (uri) {
        deleteUri(uri);
      }
      setIsDownloading(false);
    }
  };

  const handleVideoPress = async (id: string, uri: string) => {
    const videoData = await getVideoDataFromVault(id);
    console.log(videoData);
    router.push({ pathname: "/player", params: { uri, ...videoData } });
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
          <Pressable
            className="w-[30%] flex items-center justify-center aspect-square mb-2.5"
            onPress={() => handleVideoPress(item.id, item.uri)}
          >
            <Image
              source={{ uri: item.uri }}
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
        onConfirm={(url) => handleDownload(url)}
      />
    </SafeAreaView>
  );
};

export default Index;
