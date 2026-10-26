import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { useAuthStore } from "../../store";
import { registerWebPushNotifications } from "../../hooks/usePushNotifications";

const KEY = "push_prompt_dismissed_at";
const WEEK = 7 * 24 * 60 * 60 * 1000;

const recentlyDismissed = () => {
  try {
    const at = Number(localStorage.getItem(KEY) || 0);
    return at && Date.now() - at < WEEK;
  } catch (e) {
    return false;
  }
};

export const NotificationPrompt = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || !user.id) return undefined;
    if (user.settings && user.settings.push_notifications === false) return undefined;
    if (Capacitor.isNativePlatform()) return undefined;
    if (typeof window === "undefined" || !("Notification" in window) || !("PushManager" in window)) return undefined;
    if (Notification.permission !== "default" || recentlyDismissed()) return undefined;
    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user && user.id]);

  if (!show) return null;

  const dismiss = () => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* ignore */ }
    setShow(false);
  };
  const enable = async () => {
    setShow(false);
    try { await registerWebPushNotifications({ requestPermission: true }); } catch (e) { /* ignore */ }
  };

  return (
    <div className="fixed bottom-24 left-3 right-3 z-[150] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#111113] p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Bell size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">Never miss a message</p>
          <p className="mt-0.5 text-xs leading-5 text-white/55">Get alerts for chats, likes and new followers, even when Konnect is closed.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={enable} className="h-9 flex-1 rounded-xl bg-primary text-sm font-bold text-black">Turn on</button>
            <button onClick={dismiss} className="h-9 rounded-xl px-4 text-sm font-bold text-white/55">Not now</button>
          </div>
        </div>
      </div>
    </div>
  );
};
