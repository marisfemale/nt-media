import { redirect } from "next/navigation"
import { LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setAdminSessionCookie, verifyAdminPassword } from "@/lib/admin-auth"

async function loginAdmin(formData: FormData) {
  "use server"

  const password = String(formData.get("password") || "")

  if (!(await verifyAdminPassword(password))) {
    redirect("/admin-login?error=1")
  }

  await setAdminSessionCookie()
  redirect("/admin")
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; password?: string }>
}) {
  const params = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15">
            <LockKeyhole className="h-6 w-6 text-accent" />
          </div>
          <CardTitle className="text-2xl font-serif">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          {params.error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-foreground">
              Incorrect password.
            </div>
          )}
          {params.password === "updated" && (
            <div className="mb-4 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
              Password changed. Please log in again.
            </div>
          )}
          <form action={loginAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              Enter Admin
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            First-time password: 0000
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
