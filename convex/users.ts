import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUsersName = query({
  args: { userId: v.id("users") || v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.name;
  },
});
