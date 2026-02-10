import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getOrCreateDemoUser() {
  // For development without OAuth configured
  const demoEmail = "demo@fittrack.dev";
  let user = await prisma.user.findUnique({
    where: { email: demoEmail },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Demo User",
      },
    });
  }
  return user;
}
