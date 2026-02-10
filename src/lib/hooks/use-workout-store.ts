import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkoutSet {
  id: string;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  isWarmup: boolean;
  completed: boolean;
  // Ghost values from previous workout
  prevWeight?: number | null;
  prevReps?: number | null;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: WorkoutSet[];
  notes: string;
}

interface WorkoutState {
  // Workout data
  isActive: boolean;
  workoutId: string | null;
  workoutName: string;
  startTime: number | null;
  exercises: WorkoutExercise[];
  notes: string;

  // Rest timer
  restTimerSeconds: number;
  restTimerRunning: boolean;
  restTimerEnd: number | null;

  // Actions
  startWorkout: (name?: string) => void;
  setWorkoutId: (id: string) => void;
  setWorkoutName: (name: string) => void;
  setNotes: (notes: string) => void;
  addExercise: (exercise: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
  }) => void;
  removeExercise: (exerciseIndex: number) => void;
  reorderExercise: (fromIndex: number, toIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    data: Partial<WorkoutSet>
  ) => void;
  toggleSetComplete: (exerciseIndex: number, setIndex: number) => void;
  setExerciseNotes: (exerciseIndex: number, notes: string) => void;
  setGhostValues: (
    exerciseIndex: number,
    sets: { weight: number | null; reps: number | null }[]
  ) => void;

  // Rest timer actions
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;

  // Session actions
  finishWorkout: () => number; // returns duration in minutes
  discardWorkout: () => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function createEmptySet(): WorkoutSet {
  return {
    id: generateId(),
    weight: null,
    reps: null,
    rpe: null,
    isWarmup: false,
    completed: false,
  };
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      isActive: false,
      workoutId: null,
      workoutName: "",
      startTime: null,
      exercises: [],
      notes: "",
      restTimerSeconds: 90,
      restTimerRunning: false,
      restTimerEnd: null,

      startWorkout: (name) =>
        set({
          isActive: true,
          workoutId: null,
          workoutName: name || "",
          startTime: Date.now(),
          exercises: [],
          notes: "",
          restTimerRunning: false,
          restTimerEnd: null,
        }),

      setWorkoutId: (id) => set({ workoutId: id }),
      setWorkoutName: (name) => set({ workoutName: name }),
      setNotes: (notes) => set({ notes }),

      addExercise: ({ exerciseId, exerciseName, muscleGroup }) =>
        set((state) => ({
          exercises: [
            ...state.exercises,
            {
              id: generateId(),
              exerciseId,
              exerciseName,
              muscleGroup,
              sets: [createEmptySet()],
              notes: "",
            },
          ],
        })),

      removeExercise: (exerciseIndex) =>
        set((state) => ({
          exercises: state.exercises.filter((_, i) => i !== exerciseIndex),
        })),

      reorderExercise: (fromIndex, toIndex) =>
        set((state) => {
          const exercises = [...state.exercises];
          const [moved] = exercises.splice(fromIndex, 1);
          exercises.splice(toIndex, 0, moved);
          return { exercises };
        }),

      addSet: (exerciseIndex) =>
        set((state) => {
          const exercises = [...state.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          const lastSet = exercise.sets[exercise.sets.length - 1];
          exercise.sets = [
            ...exercise.sets,
            {
              ...createEmptySet(),
              weight: lastSet?.weight ?? null,
              reps: lastSet?.reps ?? null,
            },
          ];
          exercises[exerciseIndex] = exercise;
          return { exercises };
        }),

      removeSet: (exerciseIndex, setIndex) =>
        set((state) => {
          const exercises = [...state.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          exercise.sets = exercise.sets.filter((_, i) => i !== setIndex);
          exercises[exerciseIndex] = exercise;
          return { exercises };
        }),

      updateSet: (exerciseIndex, setIndex, data) =>
        set((state) => {
          const exercises = [...state.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          exercise.sets = [...exercise.sets];
          exercise.sets[setIndex] = { ...exercise.sets[setIndex], ...data };
          exercises[exerciseIndex] = exercise;
          return { exercises };
        }),

      toggleSetComplete: (exerciseIndex, setIndex) =>
        set((state) => {
          const exercises = [...state.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          exercise.sets = [...exercise.sets];
          exercise.sets[setIndex] = {
            ...exercise.sets[setIndex],
            completed: !exercise.sets[setIndex].completed,
          };
          exercises[exerciseIndex] = exercise;
          return { exercises };
        }),

      setExerciseNotes: (exerciseIndex, notes) =>
        set((state) => {
          const exercises = [...state.exercises];
          exercises[exerciseIndex] = { ...exercises[exerciseIndex], notes };
          return { exercises };
        }),

      setGhostValues: (exerciseIndex, ghostSets) =>
        set((state) => {
          const exercises = [...state.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          exercise.sets = exercise.sets.map((s, i) => ({
            ...s,
            prevWeight: ghostSets[i]?.weight ?? null,
            prevReps: ghostSets[i]?.reps ?? null,
          }));
          exercises[exerciseIndex] = exercise;
          return { exercises };
        }),

      startRestTimer: (seconds) =>
        set({
          restTimerSeconds: seconds,
          restTimerRunning: true,
          restTimerEnd: Date.now() + seconds * 1000,
        }),

      stopRestTimer: () =>
        set({
          restTimerRunning: false,
          restTimerEnd: null,
        }),

      finishWorkout: () => {
        const { startTime } = get();
        const duration = startTime
          ? Math.round((Date.now() - startTime) / 60000)
          : 0;
        set({
          isActive: false,
          workoutId: null,
          workoutName: "",
          startTime: null,
          exercises: [],
          notes: "",
          restTimerRunning: false,
          restTimerEnd: null,
        });
        return duration;
      },

      discardWorkout: () =>
        set({
          isActive: false,
          workoutId: null,
          workoutName: "",
          startTime: null,
          exercises: [],
          notes: "",
          restTimerRunning: false,
          restTimerEnd: null,
        }),
    }),
    {
      name: "fittrack-workout",
      partialize: (state) => ({
        isActive: state.isActive,
        workoutId: state.workoutId,
        workoutName: state.workoutName,
        startTime: state.startTime,
        exercises: state.exercises,
        notes: state.notes,
        restTimerSeconds: state.restTimerSeconds,
      }),
    }
  )
);
