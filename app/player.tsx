import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import Ionicons from "@expo/vector-icons/Ionicons";

const formatDuration = (durationInSeconds: number) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.round(durationInSeconds % 60);

  const formattedTime = [
    hours > 0 ? hours.toString().padStart(2, "0") : null,
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ]
    .filter(Boolean)
    .join(":");

  return formattedTime;
};

const Player = () => {
  const params = useLocalSearchParams() as unknown as PlayerParams;
  const { uri, duration, title, uploader, description } = params;
  const formattedDuration = formatDuration(duration);
  const handleBack = () => router.back();

  const videoSource = uri;
  const player = useVideoPlayer(videoSource, (player) => {
    player.play();
  });

  return (
    <SafeAreaView className="flex-1 w-full bg-[#7a354b] pt-2">
      <VideoView
        player={player}
        style={{
          width: "100%",
          aspectRatio: 16 / 9,
        }}
        allowsFullscreen
        allowsPictureInPicture
        startsPictureInPictureAutomatically
      />

      <View className="flex-1 px-4 mt-4">
        <Text className="font-bold text-[#f0e9ea] text-xl mb-1">{title}</Text>
        <Text className="text-[#f0e9ea] text-lg mb-3">{formattedDuration}</Text>
        <View className="flex-row items-center gap-2 mb-4">
          <Image
            source={require("../assets/images/player-icon.png")}
            className="h-8 w-8"
          />
          <Text className="text-[#ebc5df] text-lg">{uploader}</Text>
        </View>
        <ScrollView
          className="bg-[#94465f] rounded-2xl"
          contentContainerStyle={{ padding: 10 }}
        >
          <Text className="text-white">
            {description || "No description given."}
          </Text>
        </ScrollView>
        <View className="mt-6">
          <TouchableOpacity
            className="bg-white px-5 py-2.5 rounded-3xl flex-row items-center gap-x-2 self-start"
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#7a354b" />
            <Text className="font-semibold text-lg text-[#7a354b]">Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Player;
