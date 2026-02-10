import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "3", 10);

    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: limit,
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: {
            exercise: { select: { name: true } },
            sets: { select: { id: true } },
          },
        },
      },
    });

    const result = workouts.map((w) => ({
      id: w.id,
      name: w.name || "Workout",
      date: w.date.toISOString(),
      duration: w.duration,
      exerciseCount: w.exercises.length,
      setCount: w.exercises.reduce((sum, e) => sum + e.sets.length, 0),
      exerciseNames: w.exercises.map((e) => e.exercise.name),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch recent workouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent workouts" },
      { status: 500 }
    );
  }
}
