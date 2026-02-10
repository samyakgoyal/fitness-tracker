"use client";

import { useRef } from "react";
import { Check, Flame, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkoutSet } from "@/lib/hooks/use-workout-store";

interface SetRowProps {
  set: WorkoutSet;
  setIndex: number;
  isWarmup?: boolean;
  onUpdate: (data: Partial<WorkoutSet>) => void;
  onToggleComplete: () => void;
  onRemove: () => void;
}

export function SetRow({
  set,
  setIndex,
  onUpdate,
  onToggleComplete,
  onRemove,
}: SetRowProps) {
  const weightRef = useRef<HTMLInputElement>(null);
  const repsRef = useRef<HTMLInputElement>(null);

  const handleNumberInput = (
    field: "weight" | "reps",
    value: string
  ) => {
    if (value === "") {
      onUpdate({ [field]: null });
      return;
    }
    const num = field === "weight" ? parseFloat(value) : parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      onUpdate({ [field]: num });
    }
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[2rem_1fr_4.5rem_4.5rem_2.75rem_2rem] items-center gap-1.5 py-1.5 px-1 rounded-lg transition-colors",
        set.completed && "bg-primary/5",
        set.isWarmup && "opacity-75"
      )}
    >
      {/* Set number / warmup */}
      <button
        type="button"
        onClick={() => onUpdate({ isWarmup: !set.isWarmup })}
        className={cn(
          "text-xs font-medium h-8 w-8 rounded-md flex items-center justify-center transition-colors",
          set.isWarmup
            ? "text-orange-500 bg-orange-500/10"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        {set.isWarmup ? <Flame className="h-3.5 w-3.5" /> : setIndex + 1}
      </button>

      {/* Previous values (ghost) */}
      <div className="text-xs text-muted-foreground truncate text-center">
        {set.prevWeight != null && set.prevReps != null
          ? `${set.prevWeight} × ${set.prevReps}`
          : "—"}
      </div>

      {/* Weight input */}
      <input
        ref={weightRef}
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        placeholder="—"
        value={set.weight ?? ""}
        onChange={(e) => handleNumberInput("weight", e.target.value)}
        onFocus={(e) => e.target.select()}
        className={cn(
          "h-10 w-full rounded-md border bg-transparent px-2 text-center text-sm font-medium",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          "transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          set.completed ? "border-primary/30" : "border-border"
        )}
      />

      {/* Reps input */}
      <input
        ref={repsRef}
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        placeholder="—"
        value={set.reps ?? ""}
        onChange={(e) => handleNumberInput("reps", e.target.value)}
        onFocus={(e) => e.target.select()}
        className={cn(
          "h-10 w-full rounded-md border bg-transparent px-2 text-center text-sm font-medium",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          "transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          set.completed ? "border-primary/30" : "border-border"
        )}
      />

      {/* Complete toggle */}
      <button
        type="button"
        onClick={onToggleComplete}
        className={cn(
          "h-10 w-11 rounded-md flex items-center justify-center transition-all",
          set.completed
            ? "bg-primary text-primary-foreground"
            : "border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
        )}
      >
        <Check className="h-4 w-4" />
      </button>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
