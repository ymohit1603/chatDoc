import { getAuth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import prisma from "@/lib/prisma";

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
        await prisma.pdf.create({
          data: {
            key: file.key, // Correctly accessing file.key
            name: file.name, // Correctly accessing file.name
            userId: metadata.userId,
            url: file.url, // Correctly accessing file.url
            uploadStatus: "PROCESSING",
          },
        });

        console.log(`File created in the database for user ${metadata.userId}`);
      } catch (error) {
        console.error("Error during file upload handling:", error);
        throw new UploadThingError("Failed to process the uploaded file.");
      }
    }),
} satisfies FileRouter;
export const runtime = "nodejs";
export type OurFileRouter = typeof ourFileRouter;