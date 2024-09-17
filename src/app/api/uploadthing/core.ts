import { getAuth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import prisma from "@/lib/prisma";
import { getPineconeClient } from "@/lib/pinecone";

import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

const f = createUploadthing();

type Metadata = {
  userId: string;
};

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const user = getAuth(req);
      console.log('Inside uploadthing middleware',user)
      if (!user || !user.userId) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({
      metadata,
      file,
    }: {
      metadata: Metadata,
      file: {
        key: string;
        size: number;
        name: string;
        url: string;
      }
      }) => {
      console.log('Inside onUploadCOmplete');
      try {
        console.log('here');
        console.log(metadata, "file", file);

        // Check if the file already exists in the database
        const isFileExist = await prisma.pdf.findFirst({
          where: {
            userId: metadata.userId,
            key: file.key, // Correctly accessing file.key
          },
        });

        if (isFileExist) {
          console.log(`File with key ${file.key} already exists.`);
          return;
        }

        if (!metadata.userId) {
          return;
        }

        // Create a new record in the database
        const createdFile=await prisma.pdf.create({
          data: {
            key: file.key, // Correctly accessing file.key
            name: file.name, // Correctly accessing file.name
            userId: metadata.userId,
            url: file.url, // Correctly accessing file.url
            uploadStatus: "PROCESSING",
          },
        });

        console.log(`File created in the database for user ${metadata.userId}`);

        try {
          const response = await fetch(
            `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
          )
      
          const blob = await response.blob()
      
          const loader = new PDFLoader(blob)
      
          const pageLevelDocs = await loader.load()
      
          const pagesAmt = pageLevelDocs.length
          const pinecone = await getPineconeClient()
          const pineconeIndex = pinecone.Index('quill')
      
          const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
          })
      
          await PineconeStore.fromDocuments(
            pageLevelDocs,
            embeddings,
            {
              pineconeIndex,
              namespace: createdFile.id,
            }
          )
      
          await prisma.pdf.update({
            data: {
              uploadStatus: 'SUCCESS',
            },
            where: {
              id: createdFile.id,
            },
          })
        } catch (err) {
          await prisma.pdf.update({
            data: {
              uploadStatus: 'FAILED',
            },
            where: {
              id: createdFile.id,
            },
          })
        }
      } catch (error) {
        console.error("Error during file upload handling:", error);
        throw new UploadThingError("Failed to process the uploaded file.");
      }
    }),
} satisfies FileRouter;
export const runtime = "nodejs";
export type OurFileRouter = typeof ourFileRouter;