"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flame,
  TrendingUp,
  Dumbbell,
  Plus,
  ChevronRight,
  Calendar,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useWorkoutStore } from "@/lib/hooks/use-workout-store";

interface Stats {
  totalWorkouts: number;
  workoutsThisWeek: number;
  currentStreak: number;
  volumeThisWeek: number;
}

interface RecentWorkout {
  id: string;
  name: string;
  date: string;
  duration: number | null;
  exerciseCount: number;
  setCount: number;
  exerciseNames: string[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
}

function formatVolume(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toString();
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [sampleLoading, setSampleLoading] = useState(false);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const addExercise = useWorkoutStore((s) => s.addExercise);

  const handleSampleWorkout = async () => {
    setSampleLoading(true);
    try {
      const res = await fetch("/api/exercises");
      const exercises = await res.json();
      if (!Array.isArray(exercises)) return;

      const sampleNames = ["Bench Press", "Overhead Press", "Cable Fly"];
      startWorkout("Sample Push Day");
      for (const name of sampleNames) {
        const match = exercises.find(
          (e: { name: string }) => e.name.toLowerCase() === name.toLowerCase(),
        );
        if (match) {
          addExercise({
            exerciseId: match.id,
            exerciseName: match.name,
            muscleGroup: match.muscleGroup || "other",
          });
        }
      }
      router.push("/workouts/new");
    } catch {
      // Fall back to empty workout
      router.push("/workouts/new");
    } finally {
      setSampleLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/workouts/recent?limit=5"),
        ]);
        if (statsRes.ok && recentRes.ok) {
          const [statsData, recentData] = await Promise.all([
            statsRes.json(),
            recentRes.json(),
          ]);
          setStats(statsData);
          setRecent(recentData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{getGreeting()}</h1>
        <p className="text-muted-foreground mt-1">Ready to crush it today?</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={stats?.currentStreak ?? 0}
          color="bg-orange-500"
        />
        <StatCard
          icon={Calendar}
          label="This Week"
          value={stats?.workoutsThisWeek ?? 0}
          color="bg-primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Volume (kg)"
          value={formatVolume(stats?.volumeThisWeek ?? 0)}
          color="bg-emerald-500"
        />
      </div>

      {/* Quick Start */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Start Workout</p>
                <p className="text-sm text-muted-foreground">
                  Log a new session
                </p>
              </div>
            </div>
            <Button asChild className="gradient-primary border-0 text-white">
              <Link href="/workouts/new">Let&apos;s Go</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Workouts */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Workouts
            </h2>
            <Link
              href="/workouts"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((w) => (
              <Link key={w.id} href={`/workouts/${w.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {w.name || "Workout"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {w.exerciseNames.slice(0, 3).join(", ")}
                          {w.exerciseNames.length > 3 &&
                            ` +${w.exerciseNames.length - 3} more`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {w.exerciseCount} exercises &middot; {w.setCount} sets
                          {w.duration ? ` \u00b7 ${w.duration} min` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4 shrink-0">
                        {timeAgo(w.date)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State / Onboarding */}
      {recent.length === 0 && !loading && (
        <Card className="border-primary/20">
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-lg font-bold mb-1">Welcome to FitTrack!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Start tracking your workouts and watch your progress grow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                className="gradient-primary border-0 text-white w-full sm:w-auto"
              >
                <Link href="/workouts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Empty Workout
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleSampleWorkout}
                disabled={sampleLoading}
              >
                {sampleLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Try Sample Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
