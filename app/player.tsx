import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const Player = () => {
  const params = useLocalSearchParams() as unknown as PlayerParams;
  return (
    <SafeAreaView className="w-full h-full bg-[#7a354b] flex-col pt-2 px-8">
      <Text>{params.uri}</Text>
      <Text>{params.id}</Text>
      <Text>{params.title}</Text>
      <Text>{params.uploader}</Text>
      <Text>{params.description}</Text>
    </SafeAreaView>
  );
};

export default Player;
