"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarWorkout {
  id: string;
  name: string;
  date: string;
  exerciseCount: number;
  setCount: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [workouts, setWorkouts] = useState<CalendarWorkout[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/workouts/calendar?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.workouts) setWorkouts(data.workouts);
      })
      .catch(() => {});
  }, [year, month]);

  const navigate = (dir: -1 | 1) => {
    setSelectedDay(null);
    if (dir === -1) {
      if (month === 1) {
        setMonth(12);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    } else {
      if (month === 12) {
        setMonth(1);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    }
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: (number | null)[] = [];

    // Pad start
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    // Pad end to fill grid
    while (days.length % 7 !== 0) days.push(null);

    return days;
  }, [year, month]);

  // Map day → workouts
  const dayWorkouts = useMemo(() => {
    const map = new Map<number, CalendarWorkout[]>();
    for (const w of workouts) {
      const d = new Date(w.date).getDate();
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(w);
    }
    return map;
  }, [workouts]);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;

  const selectedWorkouts = selectedDay ? dayWorkouts.get(selectedDay) || [] : [];

  const monthLabel = new Date(year, month - 1).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">{monthLabel}</h1>
        <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const hasWorkouts = dayWorkouts.has(day);
          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors text-sm relative",
                isSelected && "bg-primary text-primary-foreground",
                !isSelected && isToday && "bg-primary/10 text-primary font-bold",
                !isSelected && !isToday && "hover:bg-muted",
                hasWorkouts && !isSelected && "font-semibold"
              )}
            >
              {day}
              {hasWorkouts && (
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay !== null && (
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground mb-2">
              {new Date(year, month - 1, selectedDay).toLocaleDateString(
                "en-US",
                { weekday: "long", month: "long", day: "numeric" }
              )}
            </p>

            {selectedWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No workouts on this day
              </p>
            ) : (
              <div className="space-y-2">
                {selectedWorkouts.map((w) => (
                  <Link key={w.id} href={`/workouts/${w.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Dumbbell className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {w.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {w.exerciseCount} exercises · {w.setCount} sets
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Monthly summary */}
      <div className="text-center text-xs text-muted-foreground py-2">
        {workouts.length} workout{workouts.length !== 1 ? "s" : ""} this month
      </div>
    </div>
  );
}
