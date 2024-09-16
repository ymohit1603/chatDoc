import prisma from '@/lib/prisma';
import {
  privateProcedure,
    publicProcedure,
    router,
} from './trpc'
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const appRouter = router({
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx
    console.log('In the fucking trpc file')
    return await prisma.pdf.findMany({
      where: {
        userId,
      },
    })
  }),
  deleteFile: privateProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx

    const file = await prisma.pdf.findFirst({
      where: {
        id: input.id,
        userId,
      },
    })

    if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

    await prisma.pdf.delete({
      where: {
        id: input.id,
      },
    })

    return file
  }),
});

export type AppRouter = typeof appRouter