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
export default function Index() {
  const downloadVideo = async () => {
    const filename = "don-quixote.mp4";
    console.log("Downloading video...");
    const result = await FileSystem.downloadAsync(
      "https://rr3---sn-u0g3oxu-pnue.googlevideo.com/videoplayback?expire=1735252736&ei=oIZtZ_LEHqqNv_IP0fSh2Qg&ip=31.223.98.106&id=o-AEa199I2kInGjGlxeJist7g-DEvlUCfLAg7Y0D5hU5rF&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1735231136%2C&mh=WL&mm=31%2C29&mn=sn-u0g3oxu-pnue%2Csn-nv47lns6&ms=au%2Crdu&mv=m&mvi=3&pl=24&rms=au%2Cau&initcwndbps=2470000&bui=AfMhrI9rNjmgCzoSFoBdePWK6Cvv7Wq2Mu-H6NGca25r0sdLxOLg_eZuJn-H1crkqoS40h1O0z0Cq3SR&vprv=1&svpuc=1&mime=video%2Fmp4&ns=x6tvEXFpi1ovUg-xiDG_0QsQ&rqh=1&gir=yes&clen=78592&ratebypass=yes&dur=4.318&lmt=1729772982674362&mt=1735230805&fvip=5&fexp=51326932%2C51331020%2C51335594%2C51371294&c=MWEB&sefc=1&txp=5309224&n=nqwuPbba8E5wgQ&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRgIhAMEWTmeFPe1RKFJ684iCo_sczLBcy9FeFsZ3PBxGNt8JAiEAsN5O3qnyhguS-u4FCrOJ1-0nmMglIfn-zhrJXkTI4B0%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIhALwDn8JBVYo7OJYMOOmLiouYkMKKdwWV9pBHvRfiBWc1AiBFwLGr-UOFiRDGjKT_THHG4tUbEy12GG1hpalPt1H7Bw%3D%3D",
      FileSystem.documentDirectory + filename
    );
    console.log(result);
    saveVideo(result.uri, filename, result.headers["Content-Type"]);
  };

  const saveVideo = async (uri: string, filename: string, mimetype: string) => {
    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          mimetype
        )
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          })
          .catch((e) => console.log(e));
      } else {
        shareAsync(uri);
      }
    } else {
      shareAsync(uri);
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
        You didnt download any videos yet.
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
