import MaxWidthWrapper from "@/components/maxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen">
      <MaxWidthWrapper className="mb-16 mt-24 sm:mt-32 flex flex-col items-center justify-center text-center">
        <div className="space-y-4">

          <h1 className="max-w-5xl text-3xl font-extrabold md:text-4xl lg:text-5xl leading-tight text-gray-900">
          Ask Questions, Get Answers : <span className="text-blue-600">AI-Powered Document</span> Interaction
          </h1>
          <div className="w-6xl flex justify-center">
          <p className="mt-4 max-w-prose text-gray-600 sm:text-lg">
            ChatDoc allows you to chat with your PDFs. Upload any document and start asking questions instantly—simplifying document analysis with AI.
            </p>
            </div>

          <Link
            className={buttonVariants({
              size: 'lg',
              className: 'mt-6 bg-black-700 text-white hover:bg-black-600 transition-colors',
            })}
            href="/dashboard"
            target="_blank"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </MaxWidthWrapper>

      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="rounded-xl bg-gray-50 shadow-md p-6 lg:p-12">
            <Image
              src="/dashboard.png"
              alt="Product preview"
              width={1364}
              height={866}
              quality={100}
              className="rounded-md shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}