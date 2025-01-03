import React from "react";
import { Modal, View, Text, ActivityIndicator } from "react-native";
import * as Progress from "react-native-progress";
const DownloadingModal = ({ isOpen, progress }: DownloadingModalProps) => {
  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-zinc-800/40">
        <View className="bg-white px-5 pt-4 pb-6 rounded-xl flex-col justify-center items-center">
          <ActivityIndicator size={65} color={"#7a354b"} className="mb-4" />
          <Text className="text-black text-lg font-semibold text-center">
            Downloading...
          </Text>
          <Text className="text-gray-500 text-base text-center mb-5">
            Please wait while we get the video for you.
          </Text>
          <Progress.Bar
            progress={progress}
            width={200}
            height={8}
            color={"#7a354b"}
            style={{ borderColor: "#e3e1e1" }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default DownloadingModal;
