import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { api } from "../services/api";
import { useAuthStore } from "../store";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const ensureServiceWorkerRegistration = async () => {
  if (!("serviceWorker" in navigator)) return null;

  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;

  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
};

export const registerWebPushNotifications = async ({ requestPermission = false } = {}) => {
  if (typeof window === "undefined") return { status: "unavailable" };
  if (!("Notification" in window) || !("PushManager" in window) || !("serviceWorker" in navigator)) {
    return { status: "unsupported" };
  }

  let permission = Notification.permission;
  if (permission === "default" && requestPermission) {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return { status: permission };
  }

  const registration = await ensureServiceWorkerRegistration();
  if (!registration?.pushManager) return { status: "unsupported" };

  const { publicKey } = await api.notifications.getVapidPublicKey();
  if (!publicKey) return { status: "missing_vapid_key" };

  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription = existingSubscription || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await api.notifications.subscribePush(subscription.toJSON());
  return { status: "subscribed" };
};

const registerNativePushNotifications = async () => {
  try {
    const nativeImport = new Function("specifier", "return import(specifier)");
    const { PushNotifications } = await nativeImport("@capacitor/push-notifications");
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== "granted") return;
    await PushNotifications.register();
  } catch (error) {
    console.warn("Native push initialization skipped:", error);
  }
};

export const usePushNotifications = () => {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.id || user?.settings?.push_notifications === false) return;

    if (Capacitor.isNativePlatform()) {
      void registerNativePushNotifications();
      return;
    }

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      void registerWebPushNotifications();
    }
  }, [isAuthenticated, user?.id, user?.settings?.push_notifications]);
};
