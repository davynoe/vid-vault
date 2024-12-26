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
import * as MediaLibrary from "expo-media-library"; // For saving directly to gallery
import { useEffect, useState } from "react";

export default function Index() {
  const [progress, setProgress] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  // Request permissions at the start
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "android") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === "granted");
      } else {
        setHasPermission(true); // No extra permission needed for iOS
      }
    };
    requestPermissions();
  }, []);

  // Handle download progress
  const downloadVideo = async () => {
    if (!hasPermission) {
      alert("Please grant storage permissions.");
      return;
    }

    const filename = "don-quixote.mp4";
    const videoUri =
      "https://rr3---sn-u0g3oxu-pnue.googlevideo.com/videoplayback?expire=1735255150&ei=DpBtZ6Ew7YLS7w_M5cbgCQ&ip=31.223.98.106&id=o-AAik5SyPd2LBtmPtCTluO8Udx_XPBvnKuPl787_LyyWx&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1735233550%2C&mh=WL&mm=31%2C29&mn=sn-u0g3oxu-pnue%2Csn-nv47zn7y&ms=au%2Crdu&mv=m&mvi=3&pl=24&rms=au%2Cau&initcwndbps=2387500&bui=AfMhrI9JkVeVfjdZWY9ReXHSzWE_5VKKpYW5hJsSCJAHzsVkjZo30-lNftnn-PsW0PIYOjobPW6wJsQK&vprv=1&svpuc=1&mime=video%2Fmp4&ns=Gw7-HJHGOcf4d4RREJOW7OMQ&rqh=1&gir=yes&clen=78592&ratebypass=yes&dur=4.318&lmt=1729772982674362&mt=1735233198&fvip=1&fexp=51326932%2C51331020%2C51335594%2C51371294&c=MWEB&sefc=1&txp=5309224&n=5DlSDEtr7geUhw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRgIhAIl8ymGez5L3hQTyAKdvDTK3ZjOA3PfSCqy99xXuX2MmAiEAoLxeSH_zfSi5YmzmrYGQ9WDQBuP8_BX2hjVgl0gwOmM%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRAIgY49CaxDvhUIt32ojstzm8Z4UduXh3D67ADNNtfgncZICIEsaPQgL84LhXPuDPuWK8WpfjwgUKkAzcejHV8JP5LaL"; // shortened URL

    console.log("Downloading video...");

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        videoUri,
        FileSystem.documentDirectory + filename,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setProgress(progress); // Update the progress
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        const { uri } = result; // Now TypeScript knows `uri` exists
        console.log("Download finished at:", uri);

        saveVideoToGallery(uri, filename);
      } else {
        console.error("Download failed: No URI returned");
      }
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const saveVideoToGallery = async (uri: string, filename: string) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("VidVault", asset, false);
      console.log("Video saved to gallery");
    } catch (error) {
      console.error("Failed to save video to gallery", error);
      shareAsync(uri); // Fallback to sharing if saving fails
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-[#7a354b] flex-col pt-2 px-5">
      <View className="w-full flex-row items-center justify-between">
        <Text className="text-[30px] text-white font-semibold">VidVault</Text>
        <View className="flex-row gap-2">
          <Pressable>
            <AntDesign name="setting" size={28} color="white" />
          </Pressable>
          <Pressable>
            <AntDesign name="question" size={28} color="white" />
          </Pressable>
        </View>
      </View>

      <Text className="absolute top-1/2 text-white self-center font-semibold text-lg">
        You didn't download any videos yet.
      </Text>

      {progress > 0 && progress < 1 && (
        <Text className="text-white text-center">{`Downloading... ${Math.round(
          progress * 100
        )}%`}</Text>
      )}

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
