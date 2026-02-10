"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Dumbbell, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
  isCustom: boolean;
  notes: string | null;
}

interface HistoryEntry {
  workoutId: string;
  workoutName: string;
  date: string;
  sets: {
    weight: number | null;
    reps: number | null;
    rpe: number | null;
    isWarmup: boolean;
    setNumber: number;
  }[];
}

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/exercises/${id}`).then((r) => r.json()),
      fetch(`/api/exercises/${id}/history`).then((r) => r.json()),
    ])
      .then(([ex, hist]) => {
        setExercise(ex);
        if (Array.isArray(hist)) setHistory(hist);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Exercise deleted");
        router.push("/exercises");
      } else {
        toast.error("Failed to delete exercise");
      }
    } catch {
      toast.error("Failed to delete exercise");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  // Compute PR (best weight for any rep count, excluding warmups)
  const pr = history.reduce(
    (best, entry) => {
      for (const set of entry.sets) {
        if (!set.isWarmup && set.weight && set.weight > (best?.weight || 0)) {
          return { weight: set.weight, reps: set.reps, date: entry.date };
        }
      }
      return best;
    },
    null as { weight: number; reps: number | null; date: string } | null
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Exercise not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/exercises")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to exercises
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => router.push("/exercises")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{exercise.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-[10px] capitalize">
              {exercise.muscleGroup || "other"}
            </Badge>
            {exercise.equipment && (
              <span className="text-xs text-muted-foreground capitalize">
                {exercise.equipment}
              </span>
            )}
            {exercise.isCustom && (
              <Badge variant="outline" className="text-[9px]">
                Custom
              </Badge>
            )}
          </div>
        </div>
        {exercise.isCustom && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* PR Card */}
      {pr && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Personal Record
            </p>
            <p className="text-2xl font-bold">
              {pr.weight} kg
              {pr.reps ? ` × ${pr.reps}` : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(pr.date).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {history.length === 0 ? (
            <div className="py-8 text-center">
              <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                No history yet. Start a workout to track this exercise.
              </p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={`${entry.workoutId}-${entry.date}`}
                className="border-b last:border-0 pb-3 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {entry.workoutName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-1">
                  {entry.sets.map((set) => (
                    <div
                      key={set.setNumber}
                      className="flex items-center gap-4 text-sm"
                    >
                      <span className="text-xs text-muted-foreground w-8">
                        {set.isWarmup ? "W" : `#${set.setNumber}`}
                      </span>
                      <span>
                        {set.weight != null ? `${set.weight} kg` : "—"}
                      </span>
                      <span className="text-muted-foreground">×</span>
                      <span>{set.reps ?? "—"} reps</span>
                      {set.rpe && (
                        <span className="text-xs text-muted-foreground">
                          RPE {set.rpe}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exercise?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{exercise.name}&rdquo; and
              remove it from your exercise library. Workout history referencing
              this exercise will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
