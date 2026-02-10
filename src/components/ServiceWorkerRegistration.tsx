"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[App] Service Worker registered");
        setRegistration(reg);

        // Check for updates periodically
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000); // Check every hour

        // Listen for new service worker
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New content is available
                setUpdateAvailable(true);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("[App] Service Worker registration failed:", error);
      });

    // Listen for controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage("skipWaiting");
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg z-[100] animate-in slide-in-from-top-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm">Update Available</p>
          <p className="text-xs opacity-80 mt-1">
            A new version of FitTrack is ready.
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-primary-foreground text-primary px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Update Now
        </button>
        <button
          onClick={() => setUpdateAvailable(false)}
          className="px-4 py-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          Later
        </button>
      </div>
    </div>
  );
}
