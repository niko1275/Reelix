import db from '../db/db';
import { users } from '../schemas/schema';
import { eq } from 'drizzle-orm';

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export async function createUser(user: NewUser) {
  try {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    const result = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return result[0];
  } catch (error) {
    console.error('Error getting user by clerk ID:', error);
    throw error;
  }
}

export async function updateUser(clerkId: string, data: Partial<NewUser>) {
  try {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.clerkId, clerkId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
} 