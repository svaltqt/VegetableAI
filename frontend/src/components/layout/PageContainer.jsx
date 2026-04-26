import { cn } from "@/lib/utils"

export function PageContainer({ children, className }) {
  return (
    <div className={cn("px-4 lg:px-8 py-6 lg:py-8 mx-auto w-full max-w-6xl space-y-6 animate-fade-in", className)}>
      {children}
    </div>
  )
}
