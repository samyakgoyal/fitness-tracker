import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string; exerciseId: string }> };

// DELETE /api/workouts/[id]/exercises/[exerciseId] - Remove exercise from workout
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: workoutId, exerciseId } = await params;

    const result = await prisma.workoutExercise.deleteMany({
      where: {
        id: exerciseId,
        workout: { id: workoutId, userId: session.user.id },
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove exercise from workout:", error);
    return NextResponse.json(
      { error: "Failed to remove exercise from workout" },
      { status: 500 },
    );
  }
}
