import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prefs = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(
      prefs || { weightUnit: "kg", defaultRestTimer: 90, theme: "system" }
    );
  } catch (error) {
    console.error("Failed to fetch preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weightUnit, defaultRestTimer, theme } = body;

    const prefs = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        weightUnit: weightUnit !== undefined ? weightUnit : undefined,
        defaultRestTimer:
          defaultRestTimer !== undefined ? defaultRestTimer : undefined,
        theme: theme !== undefined ? theme : undefined,
      },
      create: {
        userId: session.user.id,
        weightUnit: weightUnit || "kg",
        defaultRestTimer: defaultRestTimer || 90,
        theme: theme || "system",
      },
    });

    return NextResponse.json(prefs);
  } catch (error) {
    console.error("Failed to update preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
