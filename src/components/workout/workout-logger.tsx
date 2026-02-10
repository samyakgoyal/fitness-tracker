"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Timer as TimerIcon,
  Save,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkoutStore } from "@/lib/hooks/use-workout-store";
import { ExerciseCard } from "./exercise-card";
import { ExercisePicker } from "./exercise-picker";
import { RestTimer, RestTimerFAB } from "./rest-timer";
import { TemplatePicker } from "./template-picker";
import { toast } from "sonner";

export function WorkoutLogger() {
  const router = useRouter();
  const isActive = useWorkoutStore((s) => s.isActive);
  const workoutName = useWorkoutStore((s) => s.workoutName);
  const startTime = useWorkoutStore((s) => s.startTime);
  const exercises = useWorkoutStore((s) => s.exercises);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const setWorkoutName = useWorkoutStore((s) => s.setWorkoutName);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const discardWorkout = useWorkoutStore((s) => s.discardWorkout);

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState("0:00");
  const saveRef = useRef(false);

  // Elapsed time ticker
  useEffect(() => {
    if (!isActive || !startTime) return;
    const tick = () => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(
        h > 0
          ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
          : `${m}:${s.toString().padStart(2, "0")}`
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Auto-start workout if not active
  useEffect(() => {
    if (!isActive) {
      startWorkout();
    }
  }, [isActive, startWorkout]);

  const handleAddExercise = useCallback(
    (exercise: { exerciseId: string; exerciseName: string; muscleGroup: string }) => {
      addExercise(exercise);
    },
    [addExercise]
  );

  const handleTemplateSelect = useCallback(
    (template: {
      name: string;
      exercises: {
        exercise: { id: string; name: string; muscleGroup: string | null };
      }[];
    }) => {
      setWorkoutName(template.name);
      for (const te of template.exercises) {
        addExercise({
          exerciseId: te.exercise.id,
          exerciseName: te.exercise.name,
          muscleGroup: te.exercise.muscleGroup || "other",
        });
      }
      toast.success(`Loaded template: ${template.name}`);
    },
    [setWorkoutName, addExercise]
  );

  const handleFinishWorkout = useCallback(async () => {
    if (saveRef.current) return;
    saveRef.current = true;
    setSaving(true);

    try {
      // 1. Create the workout record
      const workoutRes = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workoutName || null,
          date: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        }),
      });

      if (!workoutRes.ok) throw new Error("Failed to create workout");
      const workout = await workoutRes.json();
      const workoutId = workout.id;

      // 2. Add each exercise and its sets
      for (const exercise of exercises) {
        const completedSets = exercise.sets.filter((s) => s.completed);
        if (completedSets.length === 0) continue; // Skip exercises with no completed sets

        // Add exercise to workout
        const exRes = await fetch(`/api/workouts/${workoutId}/exercises`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: exercise.exerciseId,
            notes: exercise.notes || null,
          }),
        });

        if (!exRes.ok) continue;
        const workoutExercise = await exRes.json();

        // Add completed sets
        for (const set of completedSets) {
          await fetch(
            `/api/workouts/${workoutId}/exercises/${workoutExercise.id}/sets`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                weight: set.weight,
                reps: set.reps,
                rpe: set.rpe,
                isWarmup: set.isWarmup,
              }),
            }
          );
        }
      }

      // 3. Update workout with duration
      const duration = finishWorkout();
      await fetch(`/api/workouts/${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration }),
      });

      toast.success("Workout saved!", {
        description: `${duration} min · ${exercises.filter((e) => e.sets.some((s) => s.completed)).length} exercises`,
      });

      router.push(`/workouts/${workoutId}`);
    } catch (error) {
      console.error("Failed to save workout:", error);
      toast.error("Failed to save workout", {
        description: "Your workout data is still saved locally.",
      });
    } finally {
      setSaving(false);
      saveRef.current = false;
      setShowFinishDialog(false);
    }
  }, [workoutName, startTime, exercises, finishWorkout, router]);

  const handleDiscard = useCallback(() => {
    discardWorkout();
    setShowDiscardDialog(false);
    toast("Workout discarded");
    router.push("/");
  }, [discardWorkout, router]);

  const completedSetsCount = exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0
  );

  const totalVolume = exercises.reduce(
    (acc, e) =>
      acc +
      e.sets
        .filter((s) => s.completed && !s.isWarmup)
        .reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0),
    0
  );

  return (
    <div className="space-y-4 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b -mx-4 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Workout name (optional)"
              className="h-8 text-sm font-semibold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
              <TimerIcon className="h-3.5 w-3.5" />
              {elapsed}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>{exercises.length} exercises</span>
          <span>{completedSetsCount} sets</span>
          {totalVolume > 0 && (
            <span>{totalVolume.toLocaleString()} kg volume</span>
          )}
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {exercises.map((_, i) => (
          <ExerciseCard
            key={exercises[i].id}
            exerciseIndex={i}
            isFirst={i === 0}
            isLast={i === exercises.length - 1}
          />
        ))}
      </div>

      {/* Empty state */}
      {exercises.length === 0 && (
        <div className="py-12 text-center">
          <Plus className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Add your first exercise to get started
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => setShowExercisePicker(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Exercise
            </Button>
            <Button variant="outline" onClick={() => setShowTemplatePicker(true)}>
              <FileText className="h-4 w-4 mr-1.5" />
              Template
            </Button>
          </div>
        </div>
      )}

      {/* Add exercise button */}
      {exercises.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => setShowExercisePicker(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Exercise
          </Button>
        </div>
      )}

      {/* Action buttons */}
      {exercises.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            className="flex-1 h-12 text-sm font-semibold"
            onClick={() => setShowFinishDialog(true)}
            disabled={completedSetsCount === 0}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Finish Workout
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 text-destructive hover:text-destructive"
            onClick={() => setShowDiscardDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Exercise Picker Sheet */}
      <ExercisePicker
        open={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        onSelect={handleAddExercise}
      />

      {/* Template Picker Sheet */}
      <TemplatePicker
        open={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Rest Timer */}
      <RestTimer />
      <RestTimerFAB />

      {/* Finish confirmation */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Workout?</DialogTitle>
            <DialogDescription>
              {completedSetsCount} sets completed across{" "}
              {exercises.filter((e) => e.sets.some((s) => s.completed)).length}{" "}
              exercises will be saved.
              {exercises.some((e) => e.sets.some((s) => !s.completed)) &&
                " Incomplete sets will be discarded."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowFinishDialog(false)}
            >
              Keep Going
            </Button>
            <Button
              className="flex-1"
              onClick={handleFinishWorkout}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              {saving ? "Saving..." : "Finish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard confirmation */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Workout?</DialogTitle>
            <DialogDescription>
              This will delete all progress for this workout. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDiscardDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDiscard}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
