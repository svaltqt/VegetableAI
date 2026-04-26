import { Logo } from "@/components/brand/Logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Footer } from "./Footer"

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/30">
      <header className="flex items-center justify-between px-5 lg:px-10 py-5">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Footer variant="minimal" />
    </div>
  )
}
