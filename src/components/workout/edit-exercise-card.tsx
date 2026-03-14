"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Trash2, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditSetRow, type EditSet } from "./edit-set-row";

export interface EditExercise {
  workoutExerciseId: string;
  isNew?: boolean;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  notes: string | null;
  sets: EditSet[];
}

interface EditExerciseCardProps {
  exercise: EditExercise;
  onUpdate: (exercise: EditExercise) => void;
  onRemove: () => void;
}

export function EditExerciseCard({
  exercise,
  onUpdate,
  onRemove,
}: EditExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(!!exercise.notes);

  const updateSet = (setIndex: number, data: Partial<EditSet>) => {
    const sets = [...exercise.sets];
    sets[setIndex] = { ...sets[setIndex], ...data };
    onUpdate({ ...exercise, sets });
  };

  const removeSet = (setIndex: number) => {
    const sets = exercise.sets.filter((_, i) => i !== setIndex);
    onUpdate({ ...exercise, sets });
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: EditSet = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isNew: true,
      weight: lastSet?.weight ?? null,
      reps: lastSet?.reps ?? null,
      rpe: lastSet?.rpe ?? null,
      isWarmup: false,
      setNumber: exercise.sets.length + 1,
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
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
              <DropdownMenuItem
                onClick={onRemove}
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
            value={exercise.notes || ""}
            onChange={(e) =>
              onUpdate({ ...exercise, notes: e.target.value || null })
            }
            className="min-h-[60px] text-sm resize-none"
          />
        </div>
      )}

      {/* Set header */}
      <div className="grid grid-cols-[2rem_1fr_1fr_3rem_2.75rem_2rem] gap-1 px-1 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        <span className="text-center">Set</span>
        <span className="text-center">kg</span>
        <span className="text-center">Reps</span>
        <span className="text-center">RPE</span>
        <span className="text-center"></span>
        <span></span>
      </div>

      {/* Sets */}
      <div className="px-0.5 pb-2 space-y-0.5">
        {exercise.sets.map((set, setIndex) => (
          <EditSetRow
            key={set.id}
            set={set}
            setIndex={setIndex}
            onUpdate={(data) => updateSet(setIndex, data)}
            onRemove={() => removeSet(setIndex)}
          />
        ))}
      </div>

      {/* Add set */}
      <div className="px-4 pb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={addSet}
          className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Set
        </Button>
      </div>
    </div>
  );
}
