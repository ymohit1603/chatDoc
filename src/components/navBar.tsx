import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { ArrowRight } from "lucide-react";
import MaxWidthWrapper from "./maxWidthWrapper";


const NavBar = () => {
    return (
        <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b text-black border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
        <MaxWidthWrapper>
            <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
                <Link
                    href='/'
                    className='flex z-40 font-bold text-xl'>
                    <span>chatDoc</span>
                </Link>

            <div className='hidden items-center space-x-4 sm:flex '>
                <Link
                    href='/pricing'
                    className={buttonVariants({
                        variant: 'ghost',
                        size: 'lg',
                    }) }>
                    Pricing
                </Link>
                        <Link
                    href='#'
                    className={buttonVariants({
                        variant: 'ghost',
                        size: 'lg',
                    })}>
                    Sign in
                </Link>
                        <Link
                            href='#'
                    className={buttonVariants({
                        size: 'sm',
                    })}>
                    Get started{' '}
                    <ArrowRight className='ml-1.5 h-5 w-5' />
                </Link>
            </div>
            </div>
        </MaxWidthWrapper>
    </nav>
    )
}

export default NavBar;