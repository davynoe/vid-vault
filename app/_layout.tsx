import { Stack } from "expo-router";
import { Platform, StatusBar } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

// Transparent bottom bar
if (Platform.OS === "android") {
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync("#ffffff01");
  NavigationBar.setButtonStyleAsync("light");
}
// Transparent top bar
StatusBar.setBackgroundColor("#ffffff01");
StatusBar.setBarStyle("light-content");

const RootLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="player" />
    </Stack>
  );
};

export default RootLayout;
