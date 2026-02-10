"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dumbbell,
  Clock,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutSummary {
  id: string;
  name: string;
  date: string;
  duration: number | null;
  exerciseCount: number;
  setCount: number;
  exerciseNames: string[];
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workouts/recent?limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWorkouts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group workouts by month
  const grouped = workouts.reduce(
    (acc, w) => {
      const d = new Date(w.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      if (!acc[key]) acc[key] = { label, workouts: [] };
      acc[key].workouts.push(w);
      return acc;
    },
    {} as Record<string, { label: string; workouts: WorkoutSummary[] }>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>
        <span className="text-sm text-muted-foreground">
          {workouts.length} workouts
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="py-16 text-center">
          <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No workouts yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Start a workout to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([key, { label, workouts: monthWorkouts }]) => (
            <div key={key}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                {label}
              </h2>
              <div className="space-y-2">
                {monthWorkouts.map((workout) => (
                  <Link key={workout.id} href={`/workouts/${workout.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 active:bg-muted transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">
                            {workout.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(workout.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {workout.duration && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {workout.duration}m
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {workout.exerciseCount} exercises
                          </span>
                        </div>
                        {workout.exerciseNames.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {workout.exerciseNames.slice(0, 3).map((name) => (
                              <Badge
                                key={name}
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0"
                              >
                                {name}
                              </Badge>
                            ))}
                            {workout.exerciseNames.length > 3 && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0"
                              >
                                +{workout.exerciseNames.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
