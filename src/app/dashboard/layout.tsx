import MaxWidthWrapper from "@/components/maxWidthWrapper"


export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <MaxWidthWrapper><section>{children}</section></MaxWidthWrapper>
  }