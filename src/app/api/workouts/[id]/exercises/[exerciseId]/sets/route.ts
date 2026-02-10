import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string; exerciseId: string }> };

// POST /api/workouts/[id]/exercises/[exerciseId]/sets - Add a set
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { exerciseId: workoutExerciseId } = await params;
    const body = await request.json();
    const { weight, reps, rpe, isWarmup, notes } = body;

    // Get the current max set number for this workout exercise
    const maxSetNumber = await prisma.set.aggregate({
      where: { workoutExerciseId },
      _max: { setNumber: true },
    });

    const set = await prisma.set.create({
      data: {
        workoutExerciseId,
        setNumber: (maxSetNumber._max.setNumber ?? 0) + 1,
        weight: weight ?? null,
        reps: reps ?? null,
        rpe: rpe ?? null,
        isWarmup: isWarmup ?? false,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(set, { status: 201 });
  } catch (error) {
    console.error("Failed to add set:", error);
    return NextResponse.json(
      { error: "Failed to add set" },
      { status: 500 }
    );
  }
}

// PUT /api/workouts/[id]/exercises/[exerciseId]/sets - Update a set
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { setId, weight, reps, rpe, isWarmup, notes } = body;

    if (!setId) {
      return NextResponse.json(
        { error: "Set ID is required" },
        { status: 400 }
      );
    }

    const set = await prisma.set.update({
      where: { id: setId },
      data: {
        weight: weight !== undefined ? weight : undefined,
        reps: reps !== undefined ? reps : undefined,
        rpe: rpe !== undefined ? rpe : undefined,
        isWarmup: isWarmup !== undefined ? isWarmup : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json(set);
  } catch (error) {
    console.error("Failed to update set:", error);
    return NextResponse.json(
      { error: "Failed to update set" },
      { status: 500 }
    );
  }
}

// DELETE /api/workouts/[id]/exercises/[exerciseId]/sets - Delete a set
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const setId = searchParams.get("setId");

    if (!setId) {
      return NextResponse.json(
        { error: "Set ID is required" },
        { status: 400 }
      );
    }

    await prisma.set.delete({
      where: { id: setId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete set:", error);
    return NextResponse.json(
      { error: "Failed to delete set" },
      { status: 500 }
    );
  }
}
