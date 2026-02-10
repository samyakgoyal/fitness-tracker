"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Loader2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface WorkoutDetail {
  id: string;
  name: string | null;
  date: string;
  notes: string | null;
  duration: number | null;
  exercises: {
    id: string;
    order: number;
    notes: string | null;
    exercise: {
      id: string;
      name: string;
      muscleGroup: string | null;
    };
    sets: {
      id: string;
      setNumber: number;
      weight: number | null;
      reps: number | null;
      rpe: number | null;
      isWarmup: boolean;
    }[];
  }[];
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/workouts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setWorkout(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Workout deleted");
        router.push("/workouts");
      } else {
        toast.error("Failed to delete workout");
      }
    } catch {
      toast.error("Failed to delete workout");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Workout not found</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/workouts")}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to history
        </Button>
      </div>
    );
  }

  const totalVolume = workout.exercises.reduce(
    (acc, e) =>
      acc +
      e.sets
        .filter((s) => !s.isWarmup)
        .reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0),
    0
  );

  const totalSets = workout.exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => !s.isWarmup).length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => router.push("/workouts")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">
            {workout.name || "Workout"}
          </h1>
          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Calendar className="h-3 w-3" />
            {new Date(workout.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-destructive shrink-0"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-lg font-bold">
              {workout.duration ? `${workout.duration}` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Minutes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-lg font-bold">{totalSets}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Sets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-lg font-bold">
              {totalVolume > 0
                ? totalVolume >= 1000
                  ? `${(totalVolume / 1000).toFixed(1)}k`
                  : totalVolume.toString()
                : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Volume (kg)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {workout.notes && (
        <Card>
          <CardContent className="py-3">
            <p className="text-sm text-muted-foreground">{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-3">
        {workout.exercises.map((we) => (
          <Card key={we.id}>
            <CardContent className="py-3">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{we.exercise.name}</h3>
                {we.exercise.muscleGroup && (
                  <Badge variant="secondary" className="text-[10px]">
                    {we.exercise.muscleGroup}
                  </Badge>
                )}
              </div>

              {/* Set header */}
              <div className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 px-1">
                <span>Set</span>
                <span>Weight</span>
                <span>Reps</span>
                <span>RPE</span>
              </div>

              {/* Sets */}
              <div className="space-y-0.5">
                {we.sets.map((set) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-2 text-sm px-1 py-1 rounded-md"
                  >
                    <span className="text-xs text-muted-foreground">
                      {set.isWarmup ? "W" : set.setNumber}
                    </span>
                    <span className="font-medium">
                      {set.weight != null ? `${set.weight} kg` : "—"}
                    </span>
                    <span>{set.reps ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">
                      {set.rpe ?? "—"}
                    </span>
                  </div>
                ))}
              </div>

              {we.notes && (
                <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                  {we.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout?</DialogTitle>
            <DialogDescription>
              This will permanently delete this workout and all its data.
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
