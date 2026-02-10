import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalWorkouts, workoutsThisWeek, workoutsThisMonth] =
      await Promise.all([
        prisma.workout.count({ where: { userId } }),
        prisma.workout.count({ where: { userId, date: { gte: startOfWeek } } }),
        prisma.workout.count({ where: { userId, date: { gte: startOfMonth } } }),
      ]);

    // Calculate streak
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: { date: true },
    });

    let currentStreak = 0;
    let longestStreak = 0;

    if (workouts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const uniqueDates = new Set<string>();
      for (const w of workouts) {
        const d = new Date(w.date);
        d.setHours(0, 0, 0, 0);
        uniqueDates.add(d.toISOString());
      }

      const sortedDates = Array.from(uniqueDates)
        .map((d) => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

      const todayStr = today.toISOString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString();

      if (
        sortedDates[0]?.toISOString() === todayStr ||
        sortedDates[0]?.toISOString() === yesterdayStr
      ) {
        currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const diff =
            (sortedDates[i - 1].getTime() - sortedDates[i].getTime()) /
            (1000 * 60 * 60 * 24);
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      let streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const diff =
          (sortedDates[i - 1].getTime() - sortedDates[i].getTime()) /
          (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
        } else {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, streak);
    }

    // Volume this week
    const weekSets = await prisma.set.findMany({
      where: {
        isWarmup: false,
        weight: { not: null },
        reps: { not: null },
        workoutExercise: { workout: { userId, date: { gte: startOfWeek } } },
      },
      select: { weight: true, reps: true },
    });

    const volumeThisWeek = weekSets.reduce(
      (sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0),
      0
    );

    return NextResponse.json({
      totalWorkouts,
      workoutsThisWeek,
      workoutsThisMonth,
      currentStreak,
      longestStreak,
      volumeThisWeek: Math.round(volumeThisWeek),
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
