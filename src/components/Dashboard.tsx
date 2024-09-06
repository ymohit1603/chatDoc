"use client";
import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
import { JSX, SVGProps, useState } from "react";

import { OurFileRouter } from "@/app/api/uploadthing/core";
import MaxWidthWrapper from "./maxWidthWrapper";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"; 
import { useRouter } from 'next/navigation';
import { UploadButton } from "@/lib/utils";

const Dashboard = () => {
  const [showUploadButton, setShowUploadButton] = useState(false);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const router = useRouter();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            No files
          </div>
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