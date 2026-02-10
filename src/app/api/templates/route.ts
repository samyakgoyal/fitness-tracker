import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.workoutTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: {
            exercise: { select: { id: true, name: true, muscleGroup: true } },
          },
        },
      },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
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
    const { name, exerciseIds } = body as {
      name: string;
      exerciseIds: string[];
    };

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      );
    }

    const template = await prisma.workoutTemplate.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
        exercises: {
          create: exerciseIds.map((exerciseId, index) => ({
            exerciseId,
            order: index,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: {
            exercise: { select: { id: true, name: true, muscleGroup: true } },
          },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
