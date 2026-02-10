import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: "asc" } },
          },
        },
      },
    });
    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Failed to fetch workouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, date, notes } = body;

    const workout = await prisma.workout.create({
      data: {
        name: name || null,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
        userId: session.user.id,
      },
      include: {
        exercises: {
          include: { exercise: true, sets: true },
        },
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Failed to create workout:", error);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
