import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { MOBILE_NAV_ITEMS } from "./NavItems"

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md safe-bottom">
      <ul className="flex items-stretch justify-around">
        {MOBILE_NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                      isActive ? "bg-primary/10" : "bg-transparent"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 w-4 h-4" />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
