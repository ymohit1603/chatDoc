import prisma from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { getPineconeClient } from '@/lib/pinecone'
import { SendMessageValidator } from '@/lib/validators/SendMessageValidator'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { NextRequest } from 'next/server'

import { generateText, OpenAIStream, StreamingTextResponse } from 'ai'
import { auth, getAuth } from '@clerk/nextjs/server'

export const POST = async (req: NextRequest) => {
    console.log('/api/message')

  const body = await req.json()

  const { userId } = getAuth(req)

  if (!userId)
    return new Response('Unauthorized', { status: 401 })

  const { fileId, message } =
    SendMessageValidator.parse(body)

  const file = await prisma.pdf.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file)
    return new Response('Not found', { status: 404 })

  await prisma.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      pdfId:fileId,
    },
  })
    
    console.log('vectorizing message')

  // 1: vectorize message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

    const pinecone = await getPineconeClient()
    const pineconeIndex = pinecone.Index('chatDoc')
    console.log('indexing...')

  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex,
      namespace: file.id,
    }
  )
    console.log('vectorStore',vectorStore)

  const results = await vectorStore.similaritySearch(
    message,
    4
  )

    console.log('result',results)
  const prevMessages = await prisma.message.findMany({
    where: {
      pdfId:fileId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  })
    
    console.log('prevMessages',prevMessages)

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage
      ? ('user' as const)
      : ('assistant' as const),
    content: msg.text,
  }))
    console.log('formattedPrevMessages', formattedPrevMessages)
    
  const { text } = await generateText({
    model: openai('gpt-3.5-turbo'),
    prompt:message,
  });

//   const response = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     temperature: 0,
//     stream: true,
//     messages: [
//       {
//         role: 'system',
//         content:
//           'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
//       },
//       {
//         role: 'user',
//         content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
//   \n----------------\n
  
//   PREVIOUS CONVERSATION:
//   ${formattedPrevMessages.map((message) => {
//     if (message.role === 'user')
//       return `User: ${message.content}\n`
//     return `Assistant: ${message.content}\n`
//   })}
  
//   \n----------------\n
  
//   CONTEXT:
//   ${results.map((r) => r.pageContent).join('\n\n')}
  
//   USER INPUT: ${message}`,
//       },
//     ],
//   })

//   const stream = OpenAIStream(response, {
//     async onCompletion(completion) {
//       await prisma.message.create({
//         data: {
//           text: completion,
//           isUserMessage: false,
//           pdfId:fileId,
//           userId,
//         },
//       })
//     },
//   })

    console.log('text', text);
  return new Response(text, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}