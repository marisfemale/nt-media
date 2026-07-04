import { revalidatePath } from "next/cache"
import { Calendar, CalendarPlus, Mail, Phone, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAdminSettings } from "@/lib/app-settings"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const statusOptions = [
  "pending",
  "pending_payment",
  "confirmed",
  "completed",
  "cancelled",
]

function formatStatus(status: string) {
  return status.replace(/_/g, " ")
}

function statusVariant(status: string) {
  if (status === "cancelled") return "destructive"
  if (status === "confirmed" || status === "completed") return "default"
  if (status === "pending_payment") return "secondary"
  return "outline"
}

async function updateBookingStatus(formData: FormData) {
  "use server"

  if (!(await isAdminAuthenticated())) return

  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "")

  if (!id || !statusOptions.includes(status)) return

  await prisma.booking.update({
    where: { id },
    data: { status },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/bookings")
}

async function deleteBooking(formData: FormData) {
  "use server"

  if (!(await isAdminAuthenticated())) return

  const id = String(formData.get("id") || "")
  if (!id) return

  await prisma.booking.delete({ where: { id } })

  revalidatePath("/admin")
  revalidatePath("/admin/bookings")
}

export default async function AdminBookingsPage() {
  const [bookings, adminSettings] = await Promise.all([
    prisma.booking.findMany({
      orderBy: [{ booking_date: "asc" }, { created_at: "desc" }],
    }),
    getAdminSettings(),
  ])

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground mt-1">
          Review booking requests, payment state, and shoot details.
        </p>
      </div>

      {bookings.length > 0 ? (
        <>
        <div className="space-y-4 lg:hidden">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-foreground">{booking.name}</h2>
                    <p className="mt-1 text-sm capitalize text-accent">
                      {booking.service_type.replace(/-/g, " ")}
                    </p>
                  </div>
                  <Badge variant={statusVariant(booking.status)}>
                    {formatStatus(booking.status)}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${booking.email}`} className="hover:text-foreground">
                      {booking.email}
                    </a>
                  </div>
                  {booking.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${booking.phone}`} className="hover:text-foreground">
                        {booking.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    {booking.booking_date.toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div>{booking.booking_time}</div>
                  <div className="font-mono text-xs">
                    {booking.booking_reference || booking.id}
                  </div>
                </div>

                {booking.project_description && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {booking.project_description}
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4">
                  <form action={updateBookingStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={booking.id} />
                    <select
                      name="status"
                      defaultValue={booking.status}
                      className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-sm text-foreground"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </form>
                  {adminSettings.autoAddAcceptedBookingsToCalendar &&
                    (booking.status === "confirmed" || booking.status === "completed") && (
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <a href={`/api/admin/bookings/${booking.id}/calendar`}>
                          <CalendarPlus className="h-4 w-4" />
                          Add to Calendar
                        </a>
                      </Button>
                    )}
                  <form action={deleteBooking}>
                    <input type="hidden" name="id" value={booking.id} />
                    <Button type="submit" size="sm" variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4" />
                      Delete Booking
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="hidden overflow-hidden lg:block">
          <CardContent className="p-0">
            <Table className="min-w-[1080px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="min-w-64 whitespace-normal">
                      <div className="font-medium text-foreground">{booking.name}</div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${booking.email}`} className="hover:text-foreground">
                            {booking.email}
                          </a>
                        </div>
                        {booking.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            <a href={`tel:${booking.phone}`} className="hover:text-foreground">
                              {booking.phone}
                            </a>
                          </div>
                        )}
                        <div className="font-mono text-[11px]">
                          {booking.booking_reference || booking.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-72 whitespace-normal">
                      <div className="font-medium capitalize">
                        {booking.service_type.replace(/-/g, " ")}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {booking.booking_time}
                      </div>
                      {booking.project_description && (
                        <p className="mt-2 max-w-md text-xs text-muted-foreground">
                          {booking.project_description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent" />
                        {booking.booking_date.toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="capitalize">
                        {booking.payment_method?.replace(/_/g, " ") || "Not selected"}
                      </div>
                      {booking.budget_range && (
                        <div className="text-xs text-muted-foreground">{booking.budget_range}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(booking.status)}>
                        {formatStatus(booking.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <form action={updateBookingStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={booking.id} />
                          <select
                            name="status"
                            defaultValue={booking.status}
                            className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" variant="outline">
                            Save
                          </Button>
                        </form>
                        <form action={deleteBooking}>
                          <input type="hidden" name="id" value={booking.id} />
                          <Button type="submit" size="icon-sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                        {adminSettings.autoAddAcceptedBookingsToCalendar &&
                          (booking.status === "confirmed" || booking.status === "completed") && (
                            <Button asChild size="sm" variant="outline">
                              <a href={`/api/admin/bookings/${booking.id}/calendar`}>
                                <CalendarPlus className="h-4 w-4" />
                                Calendar
                              </a>
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No bookings yet.</p>
        </Card>
      )}
    </div>
  )
}
