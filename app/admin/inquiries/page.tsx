import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Mail, Phone, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const inquiryStatuses = ["new", "contacted", "archived"]

function formatStatus(status: string) {
  return status.replace(/_/g, " ")
}

function statusVariant(status: string) {
  if (status === "new") return "default"
  if (status === "archived") return "secondary"
  return "outline"
}

async function updateInquiryStatus(formData: FormData) {
  "use server"

  if (!(await isAdminAuthenticated())) redirect("/admin-login")

  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "")

  if (!id || !inquiryStatuses.includes(status)) return

  await prisma.contactInquiry.update({
    where: { id },
    data: { status },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/inquiries")
}

async function deleteInquiry(formData: FormData) {
  "use server"

  if (!(await isAdminAuthenticated())) redirect("/admin-login")

  const id = String(formData.get("id") || "")
  if (!id) return

  await prisma.contactInquiry.delete({ where: { id } })

  revalidatePath("/admin")
  revalidatePath("/admin/inquiries")
}

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Inquiries</h1>
        <p className="text-muted-foreground mt-1">
          Review project inquiries submitted from the contact form.
        </p>
      </div>

      {inquiries.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-foreground">
                        {inquiry.name}
                      </h2>
                      <Badge variant={statusVariant(inquiry.status)}>
                        {formatStatus(inquiry.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm capitalize text-accent">
                      {inquiry.project_type.replace(/-/g, " ")}
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${inquiry.email}`} className="hover:text-foreground">
                          {inquiry.email}
                        </a>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${inquiry.phone}`} className="hover:text-foreground">
                            {inquiry.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <time className="text-sm text-muted-foreground">
                    {inquiry.created_at.toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {inquiry.message}
                </p>

                <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <form action={updateInquiryStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={inquiry.id} />
                    <select
                      name="status"
                      defaultValue={inquiry.status}
                      className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
                    >
                      {inquiryStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </form>

                  <form action={deleteInquiry}>
                    <input type="hidden" name="id" value={inquiry.id} />
                    <Button type="submit" size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No inquiries yet.</p>
        </Card>
      )}
    </div>
  )
}
