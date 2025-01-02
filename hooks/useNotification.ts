import { Platform } from "react-native";
import { useState } from "react";
import * as Notifications from "expo-notifications";

const useNotification = () => {
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  const initNotificationHandler = () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === "android") {
      const result = await Notifications.requestPermissionsAsync();
      setHasNotificationPermission(result.status === "granted");
    } else {
      setHasNotificationPermission(true);
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

  return {
    hasNotificationPermission,
    initNotificationHandler,
    requestNotificationPermission,
    sendCompleteNotification,
  }
};

export default useNotification;