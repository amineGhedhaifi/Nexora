import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

const POLL_INTERVAL = 10_000;
const SOUND_VOLUME = 0.35;
const SOUND_STORAGE_KEY = "nexora-notification-sound-enabled";
const BASELINE_STORAGE_KEY = "nexora-notification-baseline-ids";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];
const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"];

function getStoredSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  return stored !== "false";
}

function setStoredSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
}

function setStoredBaselineIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(ids));
}

function playNotificationSound(): void {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio("/notification.wav");
    audio.volume = SOUND_VOLUME;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err.name !== "AbortError") {
          console.debug("Notification sound playback blocked:", err.message);
        }
      });
    }
  } catch (err) {
    console.debug("Notification sound error:", err);
  }
}

export function useNotificationPolling(
  isAuthenticated: boolean,
  onNewNotifications?: (count: number) => void,
) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);
  const baselineIdsRef = useRef<string[]>([]);
  const initialFetchDoneRef = useRef(false);
  const soundEnabledRef = useRef(getStoredSoundEnabled());
  const visibilityHandlerRef = useRef<(() => void) | null>(null);

  const fetchAndCompare = useCallback(async () => {
    if (isPollingRef.current || !isAuthenticated) return;

    isPollingRef.current = true;
    try {
      const notifications = await notificationService.getNotifications();
      const currentIds = notifications.map((n) => n.id);

      if (!initialFetchDoneRef.current) {
        baselineIdsRef.current = currentIds;
        setStoredBaselineIds(currentIds);
        initialFetchDoneRef.current = true;

        const unreadCount = notifications.filter((n) => !n.isRead).length;
        if (unreadCount > 0 && soundEnabledRef.current) {
          playNotificationSound();
        }
      } else {
        const newIds = currentIds.filter((id) => !baselineIdsRef.current.includes(id));
        if (newIds.length > 0) {
          baselineIdsRef.current = currentIds;
          setStoredBaselineIds(currentIds);
          if (soundEnabledRef.current) {
            playNotificationSound();
          }
          onNewNotifications?.(newIds.length);
          
          // Invalidate both queries to update badge and list
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
        }
      }
    } catch (err) {
      console.debug("Notification polling error:", err);
    } finally {
      isPollingRef.current = false;
    }
  }, [isAuthenticated, onNewNotifications, queryClient]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    fetchAndCompare();
    intervalRef.current = setInterval(fetchAndCompare, POLL_INTERVAL);
  }, [fetchAndCompare]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabledRef.current = enabled;
    setStoredSoundEnabled(enabled);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startPolling();

      visibilityHandlerRef.current = () => {
        if (document.visibilityState === "visible") {
          fetchAndCompare();
        }
      };
      document.addEventListener("visibilitychange", visibilityHandlerRef.current);
    } else {
      stopPolling();
      initialFetchDoneRef.current = false;
      baselineIdsRef.current = [];
    }

    return () => {
      stopPolling();
      if (visibilityHandlerRef.current) {
        document.removeEventListener("visibilitychange", visibilityHandlerRef.current);
        visibilityHandlerRef.current = null;
      }
    };
  }, [isAuthenticated, startPolling, stopPolling, fetchAndCompare]);

  useEffect(() => {
    soundEnabledRef.current = getStoredSoundEnabled();
  }, []);

  return {
    startPolling,
    stopPolling,
    setSoundEnabled,
    fetchAndCompare,
  };
}

export function useNotificationSound() {
  const [soundEnabled, setSoundEnabledState] = useState(getStoredSoundEnabled());

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    setStoredSoundEnabled(enabled);
  }, []);

  return { soundEnabled, setSoundEnabled };
}