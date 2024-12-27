import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import * as Clipboard from "expo-clipboard";

const GetLinkModal = ({ isOpen, onClose, onConfirm }: GetLinkModalProps) => {
  const [text, setText] = useState("");

  const handleConfirm = () => {
    onClose();
    onConfirm(text);
    setText("");
  };

  const handleExit = () => {
    onClose();
    setText("");
  };

  const pasteFromClipboard = async () => {
    const content = await Clipboard.getStringAsync();
    setText(content);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-zinc-800/40">
        <View className="bg-white w-[85%] px-2 py-3 rounded-xl flex-col items-start justify-start">
          <View className="w-full flex-row items-center justify-end">
            <TouchableOpacity onPress={handleExit}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View className="w-full flex-col items-start justify-start px-3 pb-5">
            <Text className="text-xl font-bold text-black">
              Enter the video link
            </Text>
            <Text className="text-gray-500 text-base mb-2">
              You can paste from your clipboard.
            </Text>
            <View className="w-full bg-white border border-[#b1abc0] p-2.5 rounded-[10px] mb-5">
              <View className="flex-row gap-x-2">
                <TextInput
                  value={text}
                  onChangeText={setText}
                  className="flex-1 text-black text-base font-inter"
                  placeholder="https://youtube.com/"
                  placeholderTextColor="#6b7280"
                  selectionColor="#7a354b"
                  multiline={true}
                  cursorColor={"#7a354b"}
                />
                <TouchableOpacity
                  className="h-9 w-9 items-center justify-center"
                  onPress={pasteFromClipboard}
                >
                  <FontAwesome5 name="paste" size={20} color="#7a354b" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-[#7a354b] px-5 py-3 flex-row items-center gap-x-2 rounded-xl"
            >
              <Text className="text-lg text-white font-semibold">Confirm</Text>
              <AntDesign name="right" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GetLinkModal;
