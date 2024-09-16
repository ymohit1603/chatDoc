import { getAuth } from '@clerk/nextjs/server';
import { TRPCError, initTRPC } from '@trpc/server';
const t = initTRPC.create();
const middleware = t.middleware;


const isAuth = middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error('Unauthorized');
  }

  return next({
    ctx: {
      ...ctx, 
    },
  });
});


export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);  // Use isAuth for private routes
