import prisma from '@/lib/prisma';
import {
  privateProcedure,
    publicProcedure,
    router,
} from './trpc'
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';
import { absoluteUrl } from '@/lib/utils';
import { PLANS } from '@/config/stripe';
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe';

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
        userId
      },
    })

    return file
  }),
  getFileMessages: privateProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
      fileId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { userId } = ctx
    const { fileId, cursor } = input
    const pdfId = fileId;
    const limit = input.limit ?? INFINITE_QUERY_LIMIT

    const file = await prisma.pdf.findFirst({
      where: {
        id: fileId,
        userId,
      },
    })

    if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

    const messages = await prisma.message.findMany({
      take: limit + 1,
      where: {
        pdfId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        isUserMessage: true,
        createdAt: true,
        text: true,
      },
    })

    let nextCursor: typeof cursor | undefined = undefined
    if (messages.length > limit) {
      const nextItem = messages.pop()
      nextCursor = nextItem?.id
    }

    return {
      messages,
      nextCursor,
    }
  }),


  createStripeSession: privateProcedure.mutation(
    async ({ ctx }) => {
      const { userId } = ctx

      const billingUrl = absoluteUrl('/dashboard/billing')

      if (!userId)
        throw new TRPCError({ code: 'UNAUTHORIZED' })

      const dbUser = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      })

      if (!dbUser)
        throw new TRPCError({ code: 'UNAUTHORIZED' })

      const subscriptionPlan =
        await getUserSubscriptionPlan()

      if (
        subscriptionPlan.isSubscribed &&
        dbUser.stripeCustomerId
      ) {
        const stripeSession =
          await stripe.billingPortal.sessions.create({
            customer: dbUser.stripeCustomerId,
            return_url: billingUrl,
          })

        return { url: stripeSession.url }
      }

      const stripeSession =
        await stripe.checkout.sessions.create({
          success_url: billingUrl,
          cancel_url: billingUrl,
          payment_method_types: ['card', 'paypal'],
          mode: 'subscription',
          billing_address_collection: 'auto',
          line_items: [
            {
              price: PLANS.find(
                (plan) => plan.name === 'Pro'
              )?.price.priceIds.test,
              quantity: 1,
            },
          ],
          metadata: {
            userId: userId,
          },
        })

      return { url: stripeSession.url }
    }
  ),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx;
      const file = await prisma.pdf.findFirst({
        where: {
          id: input.fileId,
          userId: userId,
        },
      })
      if (!file) return { status: 'PENDING' as const }

      // return { status: file.uploadStatus as  'SUCCESS' | 'FAILED' |'PROCESSING'}
      return {status:'SUCCESS'}
    }),
  
    getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await prisma.pdf.findFirst({
        where: {
          key: input.key,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      return file
    }),


});

export type AppRouter = typeof appRouter