import db from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserByClerkId(clerkId: string) {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, clerkId),
        });
        return user;
    } catch (error) {
        console.error("Error getting user by clerk ID:", error);
        throw error;
    }
}

export async function updateUser(clerkId: string, data: {
    name?: string;
    email?: string;
    imageUrl?: string;
}) {
    try {
        const updatedUser = await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.clerkId, clerkId))
            .returning();

        return updatedUser[0];
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

export async function createUser(data: {
    clerkId: string;
    name: string;
    email: string;
    imageUrl: string;
}) {
    try {
        const newUser = await db
            .insert(users)
            .values({
                clerkId: data.clerkId,
                name: data.name,
                email: data.email,
                imageUrl: data.imageUrl,
                bannerUrl: "",
                bannerKey: "",
            })
            .returning();

        return newUser[0];
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
} 