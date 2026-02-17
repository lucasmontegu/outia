import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { router } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const updatePushToken = useMutation(api.users.updatePushToken);
  const notificationListener = useRef<Notifications.EventSubscription>(undefined);
  const responseListener = useRef<Notifications.EventSubscription>(undefined);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        updatePushToken({ token });
      }
    });

    // Listen for incoming notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((_notification) => {
        // Notification received while app is in foreground
      });

    // Listen for user interacting with notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.tripId) {
          router.push(`/(app)/route/${data.tripId}`);
        } else if (data?.screen) {
          router.push(data.screen as any);
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}

async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}
