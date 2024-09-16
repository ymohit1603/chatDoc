"use client";
import { Button } from "@/components/ui/button";
import { JSX, SVGProps, useState } from "react";
import Skeleton from 'react-loading-skeleton'
import MaxWidthWrapper from "./maxWidthWrapper";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"; 
import { useRouter } from 'next/navigation';
import { UploadButton } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import { Plus, MessageSquare, Loader2, Trash } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const [showUploadButton, setShowUploadButton] = useState(false);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
   const [currentlyDeletingFile, setCurrentlyDeletingFile] =
    useState<string | null>(null)

  const router = useRouter();
  const { data: files, isLoading } = trpc.getUserFiles.useQuery()
  const utils = trpc.useContext()
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate()
    },
    onMutate: ({id})=> {
      setCurrentlyDeletingFile(id)
    },
    onSettled: () => {
      setCurrentlyDeletingFile(null)
    }
  })

  const handleFileUploadComplete = (res: any) => {
    console.log("File uploaded successfully:", res);
    setFileUploaded(true);
    router.push('/dashboard/:id');
  };

  const handleFileUploadError = (err: any) => {
    console.error("Upload error:", err);
  };

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 py-8 px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Your Files</h1>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <LinkIcon className="w-4 h-4" />
                Attach Link
              </Button>

              <Button onClick={() => setShowUploadButton(true)}>
                Upload PDF
              </Button>
             

            <Dialog open={showUploadButton} onOpenChange={setShowUploadButton}>
              <DialogContent>
                {!fileUploaded ? (
                  <UploadButton
                    endpoint="pdfUploader"
                    onClientUploadComplete={handleFileUploadComplete}
                    onUploadError={handleFileUploadError}
                  />
                ) : (
                  <p className="text-green-500">File uploaded successfully!</p>
                )}
              </DialogContent>
            </Dialog>
            </div>
          </div>


          {files && files?.length !== 0 ? (
            <ul className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
              {files
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((file) => (
                  <li
                    key={file.id}
                    className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'>
                    <Link
                      href={`/dashboard/${file.id}`}
                      className='flex flex-col gap-2'>
                      <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                        <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500' />
                        <div className='flex-1 truncate'>
                          <div className='flex items-center space-x-3'>
                            <h3 className='truncate text-lg font-medium text-zinc-900'>
                              {file.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className='px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                      <div className='flex items-center gap-2'>
                        <Plus className='h-4 w-4' />
                        {format(
                          new Date(file.createdAt),
                          'MMM yyyy'
                        )}
                      </div>

                      <div className='flex items-center gap-2'>
                        <MessageSquare className='h-4 w-4' />
                        mocked
                      </div>

                      <Button
                        onClick={() =>
                          deleteFile({ id: file.id })
                        }
                        size='sm'
                        className='w-full'
                        variant='destructive'>
                        {currentlyDeletingFile === file.id ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Trash className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>) :
            (isLoading ? (
              <Skeleton height={100} className='my-2' count={3} />) :
              (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  No files
                </div>
              )
            )}
        </main>
      </div>
    </MaxWidthWrapper>
  );
};


function LinkIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default Dashboard;