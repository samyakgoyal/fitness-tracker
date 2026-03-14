"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, FileText, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import { SortableExerciseCard } from "./sortable-exercise-card";
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
  const reorderExercise = useWorkoutStore((s) => s.reorderExercise);

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState("0:00");
  const saveRef = useRef(false);

  // DnD sensors
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

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
          : `${m}:${s.toString().padStart(2, "0")}`,
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
    (exercise: {
      exerciseId: string;
      exerciseName: string;
      muscleGroup: string;
    }) => {
      addExercise(exercise);
    },
    [addExercise],
  );

  const groupExercises = useWorkoutStore((s) => s.groupExercises);

  const handleTemplateSelect = useCallback(
    (template: {
      name: string;
      exercises: {
        supersetGroupId?: number | null;
        exercise: { id: string; name: string; muscleGroup: string | null };
      }[];
    }) => {
      const baseIndex = exercises.length;
      setWorkoutName(template.name);
      for (const te of template.exercises) {
        addExercise({
          exerciseId: te.exercise.id,
          exerciseName: te.exercise.name,
          muscleGroup: te.exercise.muscleGroup || "other",
        });
      }
      const groups = new Map<number, number[]>();
      template.exercises.forEach((te, i) => {
        if (te.supersetGroupId != null) {
          const arr = groups.get(te.supersetGroupId) || [];
          arr.push(baseIndex + i);
          groups.set(te.supersetGroupId, arr);
        }
      });
      Array.from(groups.values()).forEach((indices) => {
        if (indices.length >= 2) {
          groupExercises(indices);
        }
      });
      toast.success(`Loaded template: ${template.name}`);
    },
    [exercises.length, setWorkoutName, addExercise, groupExercises],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromIndex = exercises.findIndex((e) => e.id === active.id);
      const toIndex = exercises.findIndex((e) => e.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1) {
        reorderExercise(fromIndex, toIndex);
      }
    },
    [exercises, reorderExercise],
  );

  const handleFinishWorkout = useCallback(async () => {
    if (saveRef.current) return;
    saveRef.current = true;
    setSaving(true);

    try {
      const workoutRes = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workoutName || null,
          date: startTime
            ? new Date(startTime).toISOString()
            : new Date().toISOString(),
        }),
      });

      if (!workoutRes.ok) throw new Error("Failed to create workout");
      const workout = await workoutRes.json();
      const workoutId = workout.id;

      for (const exercise of exercises) {
        const completedSets = exercise.sets.filter((s) => s.completed);
        if (completedSets.length === 0) continue;

        const exRes = await fetch(`/api/workouts/${workoutId}/exercises`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: exercise.exerciseId,
            notes: exercise.notes || null,
            supersetGroupId: exercise.supersetGroupId,
          }),
        });

        if (!exRes.ok) continue;
        const workoutExercise = await exRes.json();

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
            },
          );
        }
      }

      const duration = finishWorkout();
      await fetch(`/api/workouts/${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration }),
      });

      toast.success("Workout saved!", {
        description: `${duration} min · ${exercises.filter((e) => e.sets.some((s) => s.completed)).length} exercise${exercises.filter((e) => e.sets.some((s) => s.completed)).length !== 1 ? "s" : ""}`,
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
    0,
  );

  const totalVolume = exercises.reduce(
    (acc, e) =>
      acc +
      e.sets
        .filter((s) => s.completed && !s.isWarmup)
        .reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0),
    0,
  );

  return (
    <div className="space-y-4 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b -mx-4 px-4 py-3">
        {/* Timer bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-base font-bold tabular-nums">{elapsed}</span>
          {totalVolume > 0 && (
            <span className="text-sm text-muted-foreground ml-auto tabular-nums">
              {totalVolume.toLocaleString()} kg
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Workout name (optional)"
              className="h-8 text-sm font-semibold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>
            {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
          </span>
          <span>
            {completedSetsCount} set{completedSetsCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Exercise list with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {exercises.map((ex, i) => {
                const groupId = ex.supersetGroupId;
                const isGroupStart =
                  groupId !== null &&
                  (i === 0 || exercises[i - 1].supersetGroupId !== groupId);
                const isGroupEnd =
                  groupId !== null &&
                  (i === exercises.length - 1 ||
                    exercises[i + 1].supersetGroupId !== groupId);

                return (
                  <motion.div
                    key={ex.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isGroupStart && (
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Superset
                        </span>
                        <div className="flex-1 h-px bg-primary/20" />
                      </div>
                    )}
                    <div
                      className={
                        groupId !== null
                          ? `border-l-2 border-primary/30 pl-2 ${!isGroupEnd ? "-mb-1" : ""}`
                          : ""
                      }
                    >
                      <SortableExerciseCard
                        id={ex.id}
                        exerciseIndex={i}
                        isFirst={i === 0}
                        isLast={i === exercises.length - 1}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

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
            <Button
              variant="outline"
              onClick={() => setShowTemplatePicker(true)}
            >
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
              {completedSetsCount} set{completedSetsCount !== 1 ? "s" : ""}{" "}
              completed across{" "}
              {exercises.filter((e) => e.sets.some((s) => s.completed)).length}{" "}
              exercise
              {exercises.filter((e) => e.sets.some((s) => s.completed))
                .length !== 1
                ? "s"
                : ""}{" "}
              will be saved.
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
              This will delete all progress for this workout. This cannot be
              undone.
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
