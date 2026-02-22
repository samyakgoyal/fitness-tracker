"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
  Trash2,
  MessageSquare,
  Link2,
  Unlink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SetRow } from "./set-row";
import {
  useWorkoutStore,
  type WorkoutSet,
} from "@/lib/hooks/use-workout-store";

interface ExerciseCardProps {
  exerciseIndex: number;
  isFirst: boolean;
  isLast: boolean;
}

export function ExerciseCard({
  exerciseIndex,
  isFirst,
  isLast,
}: ExerciseCardProps) {
  const exercises = useWorkoutStore((s) => s.exercises);
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleSetComplete = useWorkoutStore((s) => s.toggleSetComplete);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const reorderExercise = useWorkoutStore((s) => s.reorderExercise);
  const setExerciseNotes = useWorkoutStore((s) => s.setExerciseNotes);
  const setGhostValues = useWorkoutStore((s) => s.setGhostValues);
  const startRestTimer = useWorkoutStore((s) => s.startRestTimer);
  const restTimerSeconds = useWorkoutStore((s) => s.restTimerSeconds);
  const workoutId = useWorkoutStore((s) => s.workoutId);
  const groupExercises = useWorkoutStore((s) => s.groupExercises);
  const ungroupExercise = useWorkoutStore((s) => s.ungroupExercise);

  const exercise = exercises[exerciseIndex];
  const [showNotes, setShowNotes] = useState(false);

  // Fetch ghost values (previous workout data) for this exercise
  useEffect(() => {
    if (!exercise?.exerciseId) return;
    const excludeParam = workoutId ? `?excludeWorkoutId=${workoutId}` : "";
    fetch(`/api/exercises/${exercise.exerciseId}/previous${excludeParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.sets) {
          setGhostValues(
            exerciseIndex,
            data.sets.map(
              (s: { weight: number | null; reps: number | null }) => ({
                weight: s.weight,
                reps: s.reps,
              }),
            ),
          );
        }
      })
      .catch(() => {});
  }, [exercise?.exerciseId, exerciseIndex, workoutId, setGhostValues]);

  if (!exercise) return null;

  const completedSets = exercise.sets.filter(
    (s) => s.completed && !s.isWarmup,
  ).length;
  const totalSets = exercise.sets.filter((s) => !s.isWarmup).length;

  const isInSuperset = exercise.supersetGroupId !== null;
  const isLastInSuperset =
    isInSuperset &&
    (exerciseIndex === exercises.length - 1 ||
      exercises[exerciseIndex + 1]?.supersetGroupId !==
        exercise.supersetGroupId);
  const canSuperset =
    !isLast &&
    exercise.supersetGroupId === null &&
    exercises[exerciseIndex + 1]?.supersetGroupId === null;

  const handleToggleComplete = (setIndex: number) => {
    const set = exercise.sets[setIndex];
    if (!set.completed) {
      // In a superset, only start rest timer on the last exercise in the group
      if (!isInSuperset || isLastInSuperset) {
        startRestTimer(restTimerSeconds);
      }
    }
    toggleSetComplete(exerciseIndex, setIndex);
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {exercise.exerciseName}
          </h3>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {exercise.muscleGroup}
          </Badge>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {totalSets > 0 && (
            <span className="text-xs text-muted-foreground mr-1">
              {completedSets}/{totalSets}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowNotes(!showNotes)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {showNotes ? "Hide notes" : "Add notes"}
              </DropdownMenuItem>
              {!isFirst && (
                <DropdownMenuItem
                  onClick={() =>
                    reorderExercise(exerciseIndex, exerciseIndex - 1)
                  }
                >
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Move up
                </DropdownMenuItem>
              )}
              {!isLast && (
                <DropdownMenuItem
                  onClick={() =>
                    reorderExercise(exerciseIndex, exerciseIndex + 1)
                  }
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Move down
                </DropdownMenuItem>
              )}
              {canSuperset && (
                <DropdownMenuItem
                  onClick={() =>
                    groupExercises([exerciseIndex, exerciseIndex + 1])
                  }
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Superset with next
                </DropdownMenuItem>
              )}
              {isInSuperset && (
                <DropdownMenuItem
                  onClick={() => ungroupExercise(exerciseIndex)}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Remove from superset
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => removeExercise(exerciseIndex)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove exercise
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notes */}
      {showNotes && (
        <div className="px-4 py-2 border-b">
          <Textarea
            placeholder="Exercise notes..."
            value={exercise.notes}
            onChange={(e) => setExerciseNotes(exerciseIndex, e.target.value)}
            className="min-h-[60px] text-sm resize-none"
          />
        </div>
      )}

      {/* Set header */}
      <div className="grid grid-cols-[2rem_1fr_4.5rem_4.5rem_2.75rem_2rem] gap-1.5 px-1 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        <span className="text-center">Set</span>
        <span className="text-center">Prev</span>
        <span className="text-center">kg</span>
        <span className="text-center">Reps</span>
        <span className="text-center"></span>
        <span></span>
      </div>

      {/* Sets */}
      <div className="px-0.5 pb-2 space-y-0.5">
        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={set.id}
            set={set}
            setIndex={setIndex}
            onUpdate={(data: Partial<WorkoutSet>) =>
              updateSet(exerciseIndex, setIndex, data)
            }
            onToggleComplete={() => handleToggleComplete(setIndex)}
            onRemove={() => removeSet(exerciseIndex, setIndex)}
          />
        ))}
      </div>

      {/* Add set */}
      <div className="px-4 pb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addSet(exerciseIndex)}
          className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Set
        </Button>
      </div>
    </div>
  );
}
