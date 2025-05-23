import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const categoryRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const allCategories = await ctx.db.select().from(categories);
    return allCategories;
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db
        .select()
        .from(categories)
        .where(eq(categories.name, input.slug))
        .limit(1);
      return category[0];
    }),
}); 