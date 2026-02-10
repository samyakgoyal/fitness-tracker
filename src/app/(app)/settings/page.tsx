"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Preferences {
  weightUnit: string;
  defaultRestTimer: number;
  theme: string;
}

const REST_TIMER_OPTIONS = [30, 60, 90, 120, 180];
const WEIGHT_UNITS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lbs", label: "Pounds (lbs)" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((data) => setPrefs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updatePref = async (key: string, value: string | number) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);

    try {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      toast.success("Setting saved");
    } catch {
      toast.error("Failed to save setting");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <Separator />
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-xs text-muted-foreground mb-3 block">
            Theme
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-colors ${
                  theme === value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workout Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Weight Unit */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Weight Unit
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {WEIGHT_UNITS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updatePref("weightUnit", value)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    prefs?.weightUnit === value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Default Rest Timer */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Default Rest Timer
            </Label>
            <div className="flex gap-1.5">
              {REST_TIMER_OPTIONS.map((seconds) => (
                <button
                  key={seconds}
                  onClick={() => updatePref("defaultRestTimer", seconds)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                    prefs?.defaultRestTimer === seconds
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground text-center">
            FitTrack v1.0 — Built with Next.js
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
