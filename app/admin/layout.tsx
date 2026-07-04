import React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { AdminNav } from "./admin-nav"
import { clearAdminSessionCookie, isAdminAuthenticated } from "@/lib/admin-auth"

async function logoutAdmin() {
  "use server"

  await clearAdminSessionCookie()
  redirect("/admin-login")
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin-login")
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card md:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold text-foreground">NT</span>
              <span className="text-sm text-muted-foreground">Admin</span>
            </Link>
          </div>

          <AdminNav />

          <div className="space-y-3 border-t border-border p-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back to website
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-serif font-bold text-foreground">NT</span>
            <span className="text-sm text-muted-foreground">Admin</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground"
          >
            <ArrowLeft size={16} />
            Site
          </Link>
        </div>
        <AdminNav compact />
      </header>

      <main className="min-h-screen md:ml-64">{children}</main>
    </div>
  )
}
