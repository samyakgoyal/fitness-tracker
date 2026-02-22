import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/workouts/[id]/exercises - Add an exercise to a workout
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: workoutId } = await params;
    const body = await request.json();
    const { exerciseId, notes, supersetGroupId } = body;

    if (!exerciseId) {
      return NextResponse.json(
        { error: "Exercise ID is required" },
        { status: 400 },
      );
    }

    // Get the current max order for this workout
    const maxOrder = await prisma.workoutExercise.aggregate({
      where: { workoutId },
      _max: { order: true },
    });

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutId,
        exerciseId,
        order: (maxOrder._max.order ?? -1) + 1,
        notes: notes || null,
        supersetGroupId: supersetGroupId ?? null,
      },
      include: {
        exercise: true,
        sets: true,
      },
    });

    return NextResponse.json(workoutExercise, { status: 201 });
  } catch (error) {
    console.error("Failed to add exercise to workout:", error);
    return NextResponse.json(
      { error: "Failed to add exercise to workout" },
      { status: 500 },
    );
  }
}
