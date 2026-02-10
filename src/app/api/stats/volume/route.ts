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
    const period = searchParams.get("period") || "weekly";

    const now = new Date();
    let startDate: Date;
    if (period === "monthly") {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    } else {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 12 * 7);
    }

    const sets = await prisma.set.findMany({
      where: {
        isWarmup: false,
        weight: { not: null },
        reps: { not: null },
        workoutExercise: {
          workout: { userId: session.user.id, date: { gte: startDate } },
        },
      },
      include: {
        workoutExercise: {
          include: { workout: { select: { date: true } } },
        },
      },
    });

    const volumeByPeriod = new Map<string, number>();

    for (const set of sets) {
      const date = new Date(set.workoutExercise.workout.date);
      let key: string;

      if (period === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        const monday = new Date(date);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        key = monday.toISOString().split("T")[0];
      }

      const volume = (set.weight ?? 0) * (set.reps ?? 0);
      volumeByPeriod.set(key, (volumeByPeriod.get(key) ?? 0) + volume);
    }

    const result = Array.from(volumeByPeriod.entries())
      .map(([date, volume]) => ({ date, volume: Math.round(volume) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch volume data:", error);
    return NextResponse.json(
      { error: "Failed to fetch volume data" },
      { status: 500 }
    );
  }
}
