import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { type getAuth } from "@clerk/nextjs/server";

const db = prisma;
type AuthObject = ReturnType<typeof getAuth>;

/**
 * Creates the TRPC context, including database access and user information.
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: AuthObject;
}) => {
  return {
    db,
    userId: opts.auth.userId,
    ...opts,
  };
};

/**
 * Initializes tRPC with context, transformer, and error formatting.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Router and procedure setup.
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware to ensure user is authenticated.
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { userId: ctx.userId } });
});

/**
 * Protected procedure accessible only to authenticated users.
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
