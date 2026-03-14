"use client";

import { Check, Flame, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditSet {
  id: string;
  isNew?: boolean;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  isWarmup: boolean;
  setNumber: number;
}

interface EditSetRowProps {
  set: EditSet;
  setIndex: number;
  weightIncrement?: number;
  onUpdate: (data: Partial<EditSet>) => void;
  onRemove: () => void;
}

export function EditSetRow({
  set,
  setIndex,
  weightIncrement = 2.5,
  onUpdate,
  onRemove,
}: EditSetRowProps) {
  const handleNumberInput = (
    field: "weight" | "reps" | "rpe",
    value: string,
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

  const stepValue = (field: "weight" | "reps", direction: 1 | -1) => {
    const increment = field === "weight" ? weightIncrement : 1;
    const current = set[field] ?? 0;
    const next = Math.max(0, current + increment * direction);
    onUpdate({ [field]: next });
  };

  return (
    <div className="grid grid-cols-[2rem_1fr_1fr_3rem_2.75rem_2rem] items-center gap-1 py-1.5 px-1 rounded-lg">
      {/* Set number / warmup */}
      <button
        type="button"
        onClick={() => onUpdate({ isWarmup: !set.isWarmup })}
        className={cn(
          "text-xs font-medium h-8 w-8 rounded-md flex items-center justify-center transition-colors",
          set.isWarmup
            ? "text-orange-500 bg-orange-500/10"
            : "text-muted-foreground hover:bg-muted",
        )}
      >
        {set.isWarmup ? <Flame className="h-3.5 w-3.5" /> : setIndex + 1}
      </button>

      {/* Weight stepper */}
      <div className="flex items-center h-10">
        <button
          type="button"
          onClick={() => stepValue("weight", -1)}
          className="h-10 w-7 rounded-l-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
        >
          <Minus className="h-3 w-3" />
        </button>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          placeholder="—"
          value={set.weight ?? ""}
          onChange={(e) => handleNumberInput("weight", e.target.value)}
          onFocus={(e) => e.target.select()}
          className="h-10 w-full border-y bg-transparent px-1 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-border"
        />
        <button
          type="button"
          onClick={() => stepValue("weight", 1)}
          className="h-10 w-7 rounded-r-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Reps stepper */}
      <div className="flex items-center h-10">
        <button
          type="button"
          onClick={() => stepValue("reps", -1)}
          className="h-10 w-7 rounded-l-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
        >
          <Minus className="h-3 w-3" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          placeholder="—"
          value={set.reps ?? ""}
          onChange={(e) => handleNumberInput("reps", e.target.value)}
          onFocus={(e) => e.target.select()}
          className="h-10 w-full border-y bg-transparent px-1 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-border"
        />
        <button
          type="button"
          onClick={() => stepValue("reps", 1)}
          className="h-10 w-7 rounded-r-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* RPE */}
      <input
        type="number"
        inputMode="numeric"
        min="1"
        max="10"
        step="0.5"
        placeholder="—"
        value={set.rpe ?? ""}
        onChange={(e) => handleNumberInput("rpe", e.target.value)}
        onFocus={(e) => e.target.select()}
        className="h-10 w-full rounded-md border bg-transparent px-1 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-border"
      />

      {/* Completed indicator */}
      <div className="h-10 w-11 rounded-md flex items-center justify-center bg-primary/10 text-primary">
        <Check className="h-4 w-4" />
      </div>

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
