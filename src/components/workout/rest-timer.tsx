"use client";

import { useState, useEffect, useCallback } from "react";
import { Timer, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/lib/hooks/use-workout-store";
import { playTimerAlert } from "@/lib/notifications";

const QUICK_TIMES = [30, 60, 90, 120, 180];

export function RestTimer() {
  const restTimerRunning = useWorkoutStore((s) => s.restTimerRunning);
  const restTimerEnd = useWorkoutStore((s) => s.restTimerEnd);
  const restTimerSeconds = useWorkoutStore((s) => s.restTimerSeconds);
  const startRestTimer = useWorkoutStore((s) => s.startRestTimer);
  const stopRestTimer = useWorkoutStore((s) => s.stopRestTimer);

  const [remaining, setRemaining] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);

  // Countdown tick
  useEffect(() => {
    if (!restTimerRunning || !restTimerEnd) {
      setRemaining(0);
      setHasAlerted(false);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((restTimerEnd - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0 && !hasAlerted) {
        setHasAlerted(true);
        playTimerAlert();
        // Auto-stop after alert
        setTimeout(() => stopRestTimer(), 2000);
      }
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [restTimerRunning, restTimerEnd, hasAlerted, stopRestTimer]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const progress = restTimerEnd
    ? 1 - remaining / restTimerSeconds
    : 0;

  if (!restTimerRunning && !expanded) {
    return null;
  }

  // Timer is done - show completion
  if (restTimerRunning && remaining === 0) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 z-40">
        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="text-sm font-semibold">Rest complete!</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={stopRestTimer}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Timer running
  if (restTimerRunning) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 z-40">
        <div className="bg-card border rounded-2xl shadow-lg overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {formatTime(remaining)}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Rest timer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const newEnd = (restTimerEnd || Date.now()) + 15000;
                  startRestTimer(Math.ceil((newEnd - Date.now()) / 1000));
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={stopRestTimer}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded (manual start)
  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 z-40">
      <div className="bg-card border rounded-2xl shadow-lg px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Rest Timer</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setExpanded(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex gap-1.5">
          {QUICK_TIMES.map((t) => (
            <button
              key={t}
              onClick={() => {
                startRestTimer(t);
                setExpanded(false);
              }}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-medium transition-colors",
                t === restTimerSeconds
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {t >= 60 ? `${t / 60}m` : `${t}s`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Small floating button to open the timer manually
export function RestTimerFAB() {
  const restTimerRunning = useWorkoutStore((s) => s.restTimerRunning);
  const [showPicker, setShowPicker] = useState(false);

  if (restTimerRunning) return null;

  if (showPicker) {
    return <RestTimerPicker onClose={() => setShowPicker(false)} />;
  }

  return (
    <button
      onClick={() => setShowPicker(true)}
      className="fixed bottom-24 md:bottom-8 right-4 h-12 w-12 rounded-full bg-card border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-30"
    >
      <Timer className="h-5 w-5" />
    </button>
  );
}

function RestTimerPicker({ onClose }: { onClose: () => void }) {
  const restTimerSeconds = useWorkoutStore((s) => s.restTimerSeconds);
  const startRestTimer = useWorkoutStore((s) => s.startRestTimer);

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-40">
      <div className="bg-card border rounded-2xl shadow-lg px-4 py-3 w-64">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Start Rest Timer</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex gap-1.5">
          {QUICK_TIMES.map((t) => (
            <button
              key={t}
              onClick={() => {
                startRestTimer(t);
                onClose();
              }}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors",
                t === restTimerSeconds
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {t >= 60 ? `${t / 60}m` : `${t}s`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
