"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExerciseCard } from "./exercise-card";

interface SortableExerciseCardProps {
  id: string;
  exerciseIndex: number;
  isFirst: boolean;
  isLast: boolean;
}

export function SortableExerciseCard({
  id,
  exerciseIndex,
  isFirst,
  isLast,
}: SortableExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ExerciseCard
        exerciseIndex={exerciseIndex}
        isFirst={isFirst}
        isLast={isLast}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
