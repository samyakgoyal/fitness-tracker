"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EditExerciseCard,
  type EditExercise,
} from "@/components/workout/edit-exercise-card";
import { ExercisePicker } from "@/components/workout/exercise-picker";
import { toast } from "sonner";

interface WorkoutData {
  id: string;
  name: string | null;
  date: string;
  notes: string | null;
  duration: number | null;
  exercises: {
    id: string;
    order: number;
    notes: string | null;
    supersetGroupId: number | null;
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

function workoutToEditState(workout: WorkoutData): {
  name: string;
  notes: string;
  exercises: EditExercise[];
} {
  return {
    name: workout.name || "",
    notes: workout.notes || "",
    exercises: workout.exercises.map((we) => ({
      workoutExerciseId: we.id,
      exerciseId: we.exercise.id,
      exerciseName: we.exercise.name,
      muscleGroup: we.exercise.muscleGroup || "other",
      notes: we.notes,
      sets: we.sets.map((s) => ({
        id: s.id,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        isWarmup: s.isWarmup,
        setNumber: s.setNumber,
      })),
    })),
  };
}

export default function EditWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState<WorkoutData | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<EditExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    fetch(`/api/workouts/${id}`)
      .then((r) => r.json())
      .then((data: WorkoutData) => {
        if (data && !("error" in data)) {
          setOriginal(data);
          const state = workoutToEditState(data);
          setName(state.name);
          setNotes(state.notes);
          setExercises(state.exercises);
          setShowNotes(!!data.notes);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateExercise = useCallback((index: number, updated: EditExercise) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const removeExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddExercise = useCallback(
    (exercise: {
      exerciseId: string;
      exerciseName: string;
      muscleGroup: string;
    }) => {
      const newExercise: EditExercise = {
        workoutExerciseId: `new-${Date.now()}`,
        isNew: true,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        muscleGroup: exercise.muscleGroup,
        notes: null,
        sets: [
          {
            id: `new-${Date.now()}-1`,
            isNew: true,
            weight: null,
            reps: null,
            rpe: null,
            isWarmup: false,
            setNumber: 1,
          },
        ],
      };
      setExercises((prev) => [...prev, newExercise]);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!original || saving) return;
    setSaving(true);

    try {
      // Update workout metadata
      await fetch(`/api/workouts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          notes: notes || null,
        }),
      });

      // Build sets of original exercise/set IDs for diff
      const originalExIds = new Set(original.exercises.map((e) => e.id));
      const currentExIds = new Set(
        exercises.filter((e) => !e.isNew).map((e) => e.workoutExerciseId),
      );

      // Delete removed exercises
      for (const origEx of original.exercises) {
        if (!currentExIds.has(origEx.id)) {
          await fetch(`/api/workouts/${id}/exercises/${origEx.id}`, {
            method: "DELETE",
          });
        }
      }

      // Process each current exercise
      for (const ex of exercises) {
        let workoutExerciseId = ex.workoutExerciseId;

        if (ex.isNew) {
          // Create new exercise
          const res = await fetch(`/api/workouts/${id}/exercises`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exerciseId: ex.exerciseId,
              notes: ex.notes,
            }),
          });
          if (!res.ok) continue;
          const created = await res.json();
          workoutExerciseId = created.id;
        }

        // Get original sets for this exercise
        const origExercise = original.exercises.find(
          (e) => e.id === ex.workoutExerciseId,
        );
        const originalSetIds = new Set(
          origExercise?.sets.map((s) => s.id) || [],
        );
        const currentSetIds = new Set(
          ex.sets.filter((s) => !s.isNew).map((s) => s.id),
        );

        // Delete removed sets
        if (origExercise && originalExIds.has(origExercise.id)) {
          for (const origSet of origExercise.sets) {
            if (!currentSetIds.has(origSet.id)) {
              await fetch(
                `/api/workouts/${id}/exercises/${workoutExerciseId}/sets?setId=${origSet.id}`,
                { method: "DELETE" },
              );
            }
          }
        }

        // Update existing sets or create new ones
        for (const set of ex.sets) {
          if (set.isNew) {
            await fetch(
              `/api/workouts/${id}/exercises/${workoutExerciseId}/sets`,
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
          } else if (originalSetIds.has(set.id)) {
            // Check if changed
            const origSet = origExercise?.sets.find((s) => s.id === set.id);
            if (
              origSet &&
              (origSet.weight !== set.weight ||
                origSet.reps !== set.reps ||
                origSet.rpe !== set.rpe ||
                origSet.isWarmup !== set.isWarmup)
            ) {
              await fetch(
                `/api/workouts/${id}/exercises/${workoutExerciseId}/sets`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    setId: set.id,
                    weight: set.weight,
                    reps: set.reps,
                    rpe: set.rpe,
                    isWarmup: set.isWarmup,
                  }),
                },
              );
            }
          }
        }
      }

      toast.success("Workout updated");
      router.push(`/workouts/${id}`);
    } catch (error) {
      console.error("Failed to save workout:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }, [original, id, name, notes, exercises, saving, router]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!original) {
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

  return (
    <div className="space-y-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => router.push(`/workouts/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Edit Workout</h1>
      </div>

      {/* Workout name */}
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Workout name (optional)"
        className="h-11 text-sm font-semibold"
      />

      {/* Date display */}
      <p className="text-xs text-muted-foreground">
        {new Date(original.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {/* Notes */}
      {showNotes ? (
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Workout notes..."
          className="min-h-[60px] text-sm resize-none"
        />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => setShowNotes(true)}
        >
          + Add notes
        </Button>
      )}

      {/* Exercise cards */}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <EditExerciseCard
            key={ex.workoutExerciseId}
            exercise={ex}
            onUpdate={(updated) => updateExercise(i, updated)}
            onRemove={() => removeExercise(i)}
          />
        ))}
      </div>

      {/* Add exercise */}
      <Button
        variant="outline"
        className="w-full h-11"
        onClick={() => setShowExercisePicker(true)}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Exercise
      </Button>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-lg border-t px-4 py-3 pb-safe md:static md:bg-transparent md:border-0 md:p-0 md:backdrop-blur-none">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => router.push(`/workouts/${id}`)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-12 font-semibold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Exercise Picker */}
      <ExercisePicker
        open={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        onSelect={handleAddExercise}
      />
    </div>
  );
}
