import "server-only"

import { prisma } from "@/lib/db"

export const appSettingKeys = {
  adminEmail: "admin_email",
  adminPasswordHash: "admin_password_hash",
  autoAddAcceptedBookingsToCalendar: "auto_add_accepted_bookings_to_calendar",
} as const

export interface AdminSettings {
  adminEmail: string
  autoAddAcceptedBookingsToCalendar: boolean
}

function defaultAdminEmail() {
  return process.env.ADMIN_EMAIL || "admin@example.com"
}

export async function getAppSetting(key: string, fallback = "") {
  const setting = await prisma.appSetting.findUnique({ where: { key } })

  return setting?.value ?? fallback
}

export async function setAppSetting(key: string, value: string) {
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const [adminEmail, autoAddCalendar] = await Promise.all([
    getAppSetting(appSettingKeys.adminEmail, defaultAdminEmail()),
    getAppSetting(appSettingKeys.autoAddAcceptedBookingsToCalendar, "false"),
  ])

  return {
    adminEmail,
    autoAddAcceptedBookingsToCalendar: autoAddCalendar === "true",
  }
}
