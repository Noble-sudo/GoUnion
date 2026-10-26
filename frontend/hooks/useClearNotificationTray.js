import { useEffect } from "react";

// When the app is opened or comes back to the front, remove its alerts from the phone's notification tray.
const clearTray = async () => {
  try {
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration("/");
    if (!reg || !reg.getNotifications) return;
    const list = await reg.getNotifications();
    list.forEach((n) => n.close());
  } catch (e) { /* ignore */ }
};

export const useClearNotificationTray = () => {
  useEffect(() => {
    clearTray();
    const onVisible = () => { if (document.visibilityState === "visible") clearTray(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);
};
