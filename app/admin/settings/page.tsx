import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { CalendarDays, CalendarOff, KeyRound, Mail, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { isAdminAuthenticated, setAdminPassword, verifyAdminPassword } from "@/lib/admin-auth"
import { appSettingKeys, getAdminSettings, setAppSetting } from "@/lib/app-settings"
import { prisma } from "@/lib/db"
import { formatPrice } from "@/lib/products"
import { listSessionPackages } from "@/lib/session-packages"

export const dynamic = "force-dynamic"

async function addBlockedDate(formData: FormData) {
  "use server"

  if (!(await isAdminAuthenticated())) redirect("/admin-login")

  const date = String(formData.get("blocked_date") || "")
  const reason = String(formData.get("reason") || "").trim()

  if (!date) return

  await prisma.blockedDate.upsert({
    where: { blocked_date: new Date(`${date}T00:00:00.000Z`) },
    update: { reason: reason || null },
    create: {
      blocked_date: new Date(`${date}T00:00:00.000Z`),
      reason: reason || null,
    },
  })

  revalidatePath("/admin/settings")
}

async function deleteBlockedDate(formData: FormData) {
  "use server"

  if (!(await isAdminAuthenticated())) redirect("/admin-login")

  const id = String(formData.get("id") || "")
  if (!id) return

  await prisma.blockedDate.delete({ where: { id } })

  revalidatePath("/admin/settings")
}

function dollarsToCents(value: string) {
  const amount = Number.parseFloat(value.replace(/[^0-9.]/g, ""))
  if (!Number.isFinite(amount) || amount < 0) return null

  return Math.round(amount * 100)
}

async function updateSessionPackage(formData: FormData) {
  "use server"

  if (!(await isAdminAuthenticated())) redirect("/admin-login")

  const id = String(formData.get("id") || "")
  const label = String(formData.get("label") || "").trim()
  const duration = String(formData.get("duration") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const fullPriceInCents = dollarsToCents(String(formData.get("price") || ""))
  const isActive = formData.get("isActive") === "on"

  if (!id || !label || !duration || !description || fullPriceInCents === null) {
    return
  }

  await prisma.sessionPackage.update({
    where: { id },
    data: {
      label,
      duration,
      description,
      fullPriceInCents,
      depositPriceInCents: Math.round(fullPriceInCents / 2),
      isActive,
    },
  })

  revalidatePath("/")
  revalidatePath("/admin/settings")
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function updateAdminSettings(formData: FormData) {
  "use server"

  if (!(await isAdminAuthenticated())) redirect("/admin-login")

  const adminEmail = String(formData.get("adminEmail") || "").trim()
  const autoAddCalendar = formData.get("autoAddCalendar") === "on"

  if (!isValidEmail(adminEmail)) {
    redirect("/admin/settings?settings=invalid-email")
  }

  await Promise.all([
    setAppSetting(appSettingKeys.adminEmail, adminEmail),
    setAppSetting(
      appSettingKeys.autoAddAcceptedBookingsToCalendar,
      autoAddCalendar ? "true" : "false"
    ),
  ])

  revalidatePath("/admin/settings")
  redirect("/admin/settings?settings=updated")
}

async function updateAdminPassword(formData: FormData) {
  "use server"

  if (!(await isAdminAuthenticated())) redirect("/admin-login")

  const currentPassword = String(formData.get("currentPassword") || "")
  const newPassword = String(formData.get("newPassword") || "")
  const confirmPassword = String(formData.get("confirmPassword") || "")

  if (newPassword.length < 4 || newPassword !== confirmPassword) {
    redirect("/admin/settings?password=invalid")
  }

  if (!(await verifyAdminPassword(currentPassword))) {
    redirect("/admin/settings?password=current")
  }

  await setAdminPassword(newPassword)
  redirect("/admin-login?password=updated")
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ settings?: string; password?: string }>
}) {
  const params = await searchParams
  const [blockedDates, sessionPackages, adminSettings] = await Promise.all([
    prisma.blockedDate.findMany({
      orderBy: { blocked_date: "asc" },
    }),
    listSessionPackages({ includeInactive: true }),
    getAdminSettings(),
  ])

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage availability, session options, prices, and booking descriptions.
        </p>
      </div>

      {(params.settings || params.password) && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            params.settings === "updated"
              ? "border-accent/30 bg-accent/10 text-foreground"
              : "border-destructive/30 bg-destructive/10 text-foreground"
          }`}
        >
          {params.settings === "updated" && "Admin settings saved."}
          {params.settings === "invalid-email" && "Enter a valid admin email address."}
          {params.password === "invalid" && "New password must be at least 4 characters and match the confirmation."}
          {params.password === "current" && "Current password is incorrect."}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-accent" />
              Admin Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateAdminSettings} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin email</Label>
                <Input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  defaultValue={adminSettings.adminEmail}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  New booking requests are sent to this address when email delivery is configured.
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-sm">
                <input
                  type="checkbox"
                  name="autoAddCalendar"
                  defaultChecked={adminSettings.autoAddAcceptedBookingsToCalendar}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                <span>
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <CalendarDays className="h-4 w-4 text-accent" />
                    Show calendar export after accepting bookings
                  </span>
                  <span className="mt-1 block text-muted-foreground">
                    Accepted bookings will show an Add to Calendar button in the bookings table.
                  </span>
                </span>
              </label>

              <Button type="submit" className="w-full">
                <Save className="h-4 w-4" />
                Save Admin Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-accent" />
              Admin Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateAdminPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={4}
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" className="w-full">
                <KeyRound className="h-4 w-4" />
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Block a Date</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addBlockedDate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="blocked_date">Date</Label>
                <Input id="blocked_date" name="blocked_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" name="reason" placeholder="Booked, travel, unavailable..." />
              </div>
              <Button type="submit" className="w-full">
                <CalendarOff className="h-4 w-4" />
                Block Date
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blocked Dates</CardTitle>
          </CardHeader>
          <CardContent>
            {blockedDates.length > 0 ? (
              <div className="divide-y divide-border">
                {blockedDates.map((date) => (
                  <div key={date.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <div className="font-medium text-foreground">
                        {date.blocked_date.toLocaleDateString("en-AU", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      {date.reason && (
                        <div className="text-sm text-muted-foreground">{date.reason}</div>
                      )}
                    </div>
                    <form action={deleteBlockedDate}>
                      <input type="hidden" name="id" value={date.id} />
                      <Button type="submit" size="icon-sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No blocked dates yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Session Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {sessionPackages.map((session) => (
              <form
                key={session.id}
                action={updateSessionPackage}
                className="rounded-lg border border-border bg-background p-5"
              >
                <input type="hidden" name="id" value={session.id} />
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-foreground">{session.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      Current deposit: {formatPrice(session.depositPriceInCents)}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={session.isActive}
                      className="h-4 w-4 rounded border-border"
                    />
                    Active
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${session.id}-label`}>Session</Label>
                    <Input
                      id={`${session.id}-label`}
                      name="label"
                      defaultValue={session.label}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${session.id}-duration`}>Duration</Label>
                    <Input
                      id={`${session.id}-duration`}
                      name="duration"
                      defaultValue={session.duration}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor={`${session.id}-price`}>Price</Label>
                  <Input
                    id={`${session.id}-price`}
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={(session.fullPriceInCents / 100).toFixed(2)}
                    required
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor={`${session.id}-description`}>Description</Label>
                  <Textarea
                    id={`${session.id}-description`}
                    name="description"
                    defaultValue={session.description}
                    className="min-h-[96px]"
                    required
                  />
                </div>

                <Button type="submit" className="mt-5 w-full">
                  <Save className="h-4 w-4" />
                  Save Session
                </Button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
