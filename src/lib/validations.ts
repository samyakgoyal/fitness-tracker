import { z } from "zod";

export const setSchema = z.object({
  weight: z.number().min(0).nullable(),
  reps: z.number().int().min(0).nullable(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  isWarmup: z.boolean().default(false),
});

export const exerciseFormSchema = z.object({
  name: z.string().min(1, "Exercise name is required").max(100),
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
  notes: z.string().optional(),
});

export const workoutFormSchema = z.object({
  name: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export type SetFormValues = z.infer<typeof setSchema>;
export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;
export type WorkoutFormValues = z.infer<typeof workoutFormSchema>;
