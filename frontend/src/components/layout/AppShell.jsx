import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { MobileNav } from "./MobileNav"
import { Footer } from "./Footer"

export function AppShell() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 pb-24 lg:pb-0">
          <Outlet />
        </main>
        <Footer className="hidden lg:block" />
        <MobileNav />
      </div>
    </div>
  )
}
