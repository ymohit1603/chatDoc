import PdfRenderer from "@/components/pdfRenderer"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth, currentUser } from '@clerk/nextjs/server'
import ChatWrapper from "@/components/chat/chatWrapper"

interface PageProps {
  params: {
    fileid: string
  }
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params
  const { userId } = auth()
  
  if (!userId) {
    redirect('/sign-in');
    return null;
  }

  // Fetch file from the database
  const file = await prisma.pdf.findFirst({
    where: {
      id: fileid,
      userId: userId,
    },
  });

  if (!file) {
    notFound();
    return null;
  }
  console.log("fileUrl", file.url);

  return (
    <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
        <div className='flex-1 xl:flex'>
          <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
            <PdfRenderer url={file.url} />
          </div>
        </div>

        <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
          <ChatWrapper isSubscribed={false} fileId={file.id} />
        </div>
      </div>
    </div>
  )
}

export default Page;