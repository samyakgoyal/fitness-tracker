import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const workoutExercises = await prisma.workoutExercise.findMany({
      where: { exerciseId: id },
      orderBy: { workout: { date: "desc" } },
      take: 50,
      include: {
        workout: { select: { id: true, name: true, date: true } },
        sets: {
          orderBy: { setNumber: "asc" },
          select: {
            weight: true,
            reps: true,
            rpe: true,
            isWarmup: true,
            setNumber: true,
          },
        },
      },
    });

    const result = workoutExercises.map((we) => ({
      workoutId: we.workout.id,
      workoutName: we.workout.name || "Workout",
      date: we.workout.date.toISOString(),
      sets: we.sets.map((s) => ({
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        isWarmup: s.isWarmup,
        setNumber: s.setNumber,
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch exercise history:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercise history" },
      { status: 500 }
    );
  }
}
