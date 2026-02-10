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
    const { exerciseId } = await params;

    await prisma.workoutExercise.delete({
      where: { id: exerciseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove exercise from workout:", error);
    return NextResponse.json(
      { error: "Failed to remove exercise from workout" },
      { status: 500 }
    );
  }
}
