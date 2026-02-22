import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/exercises/[id]/previous?excludeWorkoutId=xxx
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: exerciseId } = await params;
    const { searchParams } = new URL(request.url);
    const excludeWorkoutId = searchParams.get("excludeWorkoutId");

    const workoutExercise = await prisma.workoutExercise.findFirst({
      where: {
        exerciseId,
        workout: { userId: session.user.id },
        ...(excludeWorkoutId ? { workoutId: { not: excludeWorkoutId } } : {}),
      },
      orderBy: { workout: { date: "desc" } },
      include: {
        workout: { select: { date: true } },
        sets: {
          orderBy: { setNumber: "asc" },
          select: { setNumber: true, weight: true, reps: true, rpe: true },
        },
      },
    });

    if (!workoutExercise) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      date: workoutExercise.workout.date,
      sets: workoutExercise.sets,
    });
  } catch (error) {
    console.error("Failed to fetch previous exercise data:", error);
    return NextResponse.json(
      { error: "Failed to fetch previous exercise data" },
      { status: 500 },
    );
  }
}
