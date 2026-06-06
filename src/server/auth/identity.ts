import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { appUsers, type AppUser } from "@/server/db/schema";

export type ClerkIdentity = {
  clerkUserId: string;
  organizationId: string | null;
};

export type AuthIdentity = ClerkIdentity & {
  appUserId: string;
};

export class UnauthorizedError extends Error {
  constructor(message = "Authentication is required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireClerkIdentity(): Promise<ClerkIdentity> {
  const authState = await auth();

  if (!authState.userId) {
    throw new UnauthorizedError();
  }

  return {
    clerkUserId: authState.userId,
    organizationId: authState.orgId ?? null,
  };
}

export async function getOrCreateCurrentAppUser(
  identity?: ClerkIdentity,
): Promise<AppUser> {
  const resolvedIdentity = identity ?? (await requireClerkIdentity());
  const existingUser = await db.query.appUsers.findFirst({
    where: eq(appUsers.clerkUserId, resolvedIdentity.clerkUserId),
  });

  if (existingUser) {
    return existingUser;
  }

  const user = await currentUser();
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses.at(0)?.emailAddress ?? null;
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || null;

  const [appUser] = await db
    .insert(appUsers)
    .values({
      clerkUserId: resolvedIdentity.clerkUserId,
      email: primaryEmail,
      displayName,
      imageUrl: user?.imageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: appUsers.clerkUserId,
      set: {
        // This path is only expected during concurrent first-seen requests. Ongoing profile
        // synchronization should move to Clerk webhooks instead of writing on every read.
        email: primaryEmail,
        displayName,
        imageUrl: user?.imageUrl ?? null,
      },
    })
    .returning();

  if (!appUser) {
    throw new Error("Unable to create or load the current application user.");
  }

  return appUser;
}

export async function requireAppIdentity(): Promise<AuthIdentity> {
  const clerkIdentity = await requireClerkIdentity();
  const appUser = await getOrCreateCurrentAppUser(clerkIdentity);

  return {
    ...clerkIdentity,
    appUserId: appUser.id,
  };
}
