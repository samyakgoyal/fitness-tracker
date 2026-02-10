"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Dumbbell, X, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  "lower back",
  "cardio",
];

interface DbExercise {
  id: string;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
  isCustom: boolean;
}

export default function ExercisesPage() {
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDbExercises(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Combine local database + user's custom DB exercises
  const exercises = useMemo(() => {
    let results: (ExerciseTemplate & { id?: string; isCustom?: boolean })[];

    if (query.length >= 2) {
      results = searchExercises(query).map((e) => ({ ...e }));
    } else if (selectedGroup !== "all") {
      results = exerciseDatabase
        .filter((e) => e.muscleGroup.toLowerCase() === selectedGroup)
        .map((e) => ({ ...e }));
    } else {
      results = exerciseDatabase.map((e) => ({ ...e }));
    }

    // Add user's custom exercises that aren't in the static database
    const staticNames = new Set(exerciseDatabase.map((e) => e.name.toLowerCase()));
    const customExercises = dbExercises
      .filter((e) => e.isCustom && !staticNames.has(e.name.toLowerCase()))
      .filter((e) => {
        if (query.length >= 2) {
          return e.name.toLowerCase().includes(query.toLowerCase());
        }
        if (selectedGroup !== "all") {
          return e.muscleGroup?.toLowerCase() === selectedGroup;
        }
        return true;
      })
      .map((e) => ({
        name: e.name,
        muscleGroup: e.muscleGroup || "other",
        equipment: e.equipment || "other",
        id: e.id,
        isCustom: true,
      }));

    return [...customExercises, ...results];
  }, [query, selectedGroup, dbExercises]);

  // Group exercises by muscle group for display
  const grouped = useMemo(() => {
    if (selectedGroup !== "all" || query.length >= 2) {
      return [{ group: "", exercises }];
    }
    const map = new Map<string, typeof exercises>();
    for (const e of exercises) {
      const g = e.muscleGroup;
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(e);
    }
    return Array.from(map.entries()).map(([group, exercises]) => ({
      group,
      exercises,
    }));
  }, [exercises, selectedGroup, query]);

  // Find DB exercise ID by name
  const getExerciseId = (name: string): string | null => {
    const found = dbExercises.find(
      (e) => e.name.toLowerCase() === name.toLowerCase()
    );
    return found?.id || null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <span className="text-sm text-muted-foreground">
          {exerciseDatabase.length} exercises
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-11 pl-9 pr-9 rounded-xl border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
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

      {/* Muscle group filters */}
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
        <div className="flex gap-1.5 w-max pb-1">
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
              {group === "all"
                ? "All"
                : group.charAt(0).toUpperCase() + group.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ group, exercises: groupExercises }) => (
            <div key={group}>
              {group && (
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  {group}
                </h2>
              )}
              <div className="space-y-1">
                {groupExercises.map((exercise) => {
                  const dbId =
                    "id" in exercise && exercise.id
                      ? exercise.id
                      : getExerciseId(exercise.name);

                  const content = (
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 active:bg-muted transition-colors">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Dumbbell className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {exercise.name}
                          </p>
                          {exercise.isCustom && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0"
                            >
                              Custom
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {exercise.equipment || ""}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    </div>
                  );

                  if (dbId) {
                    return (
                      <Link key={exercise.name} href={`/exercises/${dbId}`}>
                        {content}
                      </Link>
                    );
                  }

                  return <div key={exercise.name}>{content}</div>;
                })}
              </div>
            </div>
          ))}

          {exercises.length === 0 && query && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No exercises match &ldquo;{query}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
