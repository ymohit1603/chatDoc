import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { getAuth } from "@clerk/nextjs/server";
import { createTRPCContext } from "../../trpc";
import { appRouter } from "@/trpc";

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
    auth: getAuth(req),
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({ error }) => {
      console.error('TRPC Error:', error)
    }
  })

export { handler as GET, handler as POST };