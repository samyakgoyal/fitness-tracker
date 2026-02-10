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
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const workouts = await prisma.workout.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
      include: {
        exercises: {
          include: { sets: { select: { id: true } } },
        },
      },
    });

    const result = workouts.map((w) => ({
      id: w.id,
      name: w.name || "Workout",
      date: w.date.toISOString(),
      exerciseCount: w.exercises.length,
      setCount: w.exercises.reduce((sum, e) => sum + e.sets.length, 0),
    }));

    return NextResponse.json({ workouts: result });
  } catch (error) {
    console.error("Failed to fetch calendar data:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}
