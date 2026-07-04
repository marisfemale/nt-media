"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Images,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from "lucide-react"

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/galleries", label: "Galleries", icon: Images },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Admin navigation"
      className={
        compact
          ? "flex gap-2 overflow-x-auto px-4 pb-3"
          : "flex-1 space-y-1 p-4"
      }
    >
      {navLinks.map((link) => {
        const active = isActivePath(pathname, link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              compact
                ? `inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                : `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
            }
          >
            <link.icon size={compact ? 16 : 20} />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
