"use client";

import { useState, useCallback, useMemo } from "react";
import { Search, Dumbbell, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  exerciseDatabase,
  searchExercises,
  type ExerciseTemplate,
} from "@/lib/exerciseDatabase";

const MUSCLE_GROUPS = [
  "all",
  "chest",
  "back",
  "lats",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "cardio",
] as const;

interface ExercisePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
  }) => void;
}

export function ExercisePicker({ open, onClose, onSelect }: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [creating, setCreating] = useState(false);

  const results = useMemo(() => {
    if (query.length >= 2) {
      const searched = searchExercises(query);
      if (selectedGroup !== "all") {
        return searched.filter(
          (e) => e.muscleGroup.toLowerCase() === selectedGroup
        );
      }
      return searched;
    }

    if (selectedGroup !== "all") {
      return exerciseDatabase
        .filter((e) => e.muscleGroup.toLowerCase() === selectedGroup)
        .slice(0, 30);
    }

    // Show popular exercises when no search
    const popular = [
      "Bench Press",
      "Squat",
      "Deadlift",
      "Overhead Press",
      "Barbell Row",
      "Pull Up",
      "Dumbbell Bench Press",
      "Lat Pulldown",
      "Leg Press",
      "Romanian Deadlift",
      "Incline Dumbbell Press",
      "Cable Fly",
    ];
    return exerciseDatabase.filter((e) => popular.includes(e.name));
  }, [query, selectedGroup]);

  const handleSelect = useCallback(
    async (exercise: ExerciseTemplate) => {
      if (creating) return;
      setCreating(true);

      try {
        // Find or create exercise in the database
        const res = await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment,
          }),
        });

        if (res.ok) {
          const created = await res.json();
          onSelect({
            exerciseId: created.id,
            exerciseName: created.name,
            muscleGroup: created.muscleGroup || exercise.muscleGroup,
          });
        } else if (res.status === 409) {
          // Already exists, fetch it
          const allRes = await fetch("/api/exercises");
          const all = await allRes.json();
          const found = all.find(
            (e: { name: string }) =>
              e.name.toLowerCase() === exercise.name.toLowerCase()
          );
          if (found) {
            onSelect({
              exerciseId: found.id,
              exerciseName: found.name,
              muscleGroup: found.muscleGroup || exercise.muscleGroup,
            });
          }
        }
      } catch {
        // Silently fail, user can retry
      } finally {
        setCreating(false);
        setQuery("");
        setSelectedGroup("all");
        onClose();
      }
    },
    [creating, onSelect, onClose]
  );

  const handleCreateCustom = useCallback(async () => {
    if (!query.trim() || creating) return;
    setCreating(true);

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: query.trim(),
          muscleGroup: selectedGroup !== "all" ? selectedGroup : null,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        onSelect({
          exerciseId: created.id,
          exerciseName: created.name,
          muscleGroup: created.muscleGroup || "other",
        });
      }
    } catch {
      // Silently fail
    } finally {
      setCreating(false);
      setQuery("");
      setSelectedGroup("all");
      onClose();
    }
  }, [query, creating, selectedGroup, onSelect, onClose]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-0">
        <SheetHeader className="px-4 pb-2">
          <SheetTitle>Add Exercise</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full h-11 pl-9 pr-9 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Muscle group filters */}
        <div className="px-4 pb-3">
          <div className="overflow-x-auto scrollbar-none">
            <div className="flex gap-1.5 pb-1 w-max">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedGroup === group
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {group === "all" ? "All" : group.charAt(0).toUpperCase() + group.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 h-[calc(85vh-180px)]">
          <div className="px-4 space-y-1">
            {results.map((exercise) => (
              <button
                key={exercise.name}
                onClick={() => handleSelect(exercise)}
                disabled={creating}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors text-left disabled:opacity-50"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {exercise.muscleGroup}
                    {exercise.equipment ? ` · ${exercise.equipment}` : ""}
                  </p>
                </div>
              </button>
            ))}

            {/* Create custom exercise option */}
            {query.trim() && (
              <button
                onClick={handleCreateCustom}
                disabled={creating}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/5 active:bg-primary/10 transition-colors text-left border border-dashed border-primary/30 disabled:opacity-50"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    Create &ldquo;{query.trim()}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add as custom exercise
                  </p>
                </div>
              </button>
            )}

            {results.length === 0 && !query.trim() && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Search for an exercise to get started
              </div>
            )}

            {results.length === 0 && query.trim() && query.length >= 2 && (
              <div className="py-4 text-center text-muted-foreground text-sm">
                No matching exercises found
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
