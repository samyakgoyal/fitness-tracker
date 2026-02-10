import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sets = await prisma.set.findMany({
      where: {
        isWarmup: false,
        weight: { not: null },
        reps: { not: null, gt: 0 },
        workoutExercise: { workout: { userId: session.user.id } },
      },
      include: {
        workoutExercise: {
          include: {
            exercise: { select: { id: true, name: true } },
            workout: { select: { date: true } },
          },
        },
      },
    });

    const exerciseMap = new Map<
      string,
      {
        exerciseId: string;
        exerciseName: string;
        maxWeight: number;
        maxWeightReps: number;
        maxWeightDate: string;
        estimated1RM: number;
      }
    >();

    for (const set of sets) {
      const exerciseId = set.workoutExercise.exercise.id;
      const exerciseName = set.workoutExercise.exercise.name;
      const weight = set.weight!;
      const reps = set.reps!;
      const date = set.workoutExercise.workout.date.toISOString();

      const estimated1RM = weight * (1 + reps / 30);

      const existing = exerciseMap.get(exerciseId);
      if (!existing || estimated1RM > existing.estimated1RM) {
        exerciseMap.set(exerciseId, {
          exerciseId,
          exerciseName,
          maxWeight: weight,
          maxWeightReps: reps,
          maxWeightDate: date,
          estimated1RM: Math.round(estimated1RM * 10) / 10,
        });
      }
    }

    const prs = Array.from(exerciseMap.values()).sort(
      (a, b) => b.estimated1RM - a.estimated1RM
    );

    return NextResponse.json(prs);
  } catch (error) {
    console.error("Failed to fetch PRs:", error);
    return NextResponse.json(
      { error: "Failed to fetch PRs" },
      { status: 500 }
    );
  }
}
