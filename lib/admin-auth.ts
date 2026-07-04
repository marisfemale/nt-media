import "server-only"

import crypto from "node:crypto"
import { cookies } from "next/headers"

import { appSettingKeys, getAppSetting, setAppSetting } from "@/lib/app-settings"
import type { NextRequest } from "next/server"

export const adminSessionCookieName = "nt_admin_session"

const sessionMaxAgeSeconds = 60 * 60 * 24 * 7
const passwordKeyLength = 64

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, passwordKeyLength).toString("hex")

  return `scrypt:${salt}:${hash}`
}

function timingSafeEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first, "hex")
  const secondBuffer = Buffer.from(second, "hex")

  return (
    firstBuffer.length === secondBuffer.length &&
    crypto.timingSafeEqual(firstBuffer, secondBuffer)
  )
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":")

  if (algorithm !== "scrypt" || !salt || !hash) return false

  const candidate = crypto.scryptSync(password, salt, passwordKeyLength).toString("hex")

  return timingSafeEqual(candidate, hash)
}

async function getAdminPasswordHash() {
  const existingHash = await getAppSetting(appSettingKeys.adminPasswordHash)

  if (existingHash) return existingHash

  const initialHash = hashPassword("0000")
  await setAppSetting(appSettingKeys.adminPasswordHash, initialHash)

  return initialHash
}

function getSessionSecret(passwordHash: string) {
  return process.env.ADMIN_SESSION_SECRET || passwordHash
}

function signPayload(payload: string, passwordHash: string) {
  return crypto
    .createHmac("sha256", getSessionSecret(passwordHash))
    .update(payload)
    .digest("hex")
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url")
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

export async function verifyAdminPassword(password: string) {
  const passwordHash = await getAdminPasswordHash()

  return verifyPassword(password, passwordHash)
}

export async function setAdminPassword(password: string) {
  await setAppSetting(appSettingKeys.adminPasswordHash, hashPassword(password))
}

export async function createAdminSessionValue() {
  const passwordHash = await getAdminPasswordHash()
  const now = Math.floor(Date.now() / 1000)
  const payload = base64UrlEncode(
    JSON.stringify({
      iat: now,
      exp: now + sessionMaxAgeSeconds,
      nonce: crypto.randomBytes(12).toString("hex"),
    })
  )
  const signature = signPayload(payload, passwordHash)

  return `${payload}.${signature}`
}

export async function isAdminSessionValueValid(sessionValue?: string) {
  if (!sessionValue) return false

  const [payload, signature] = sessionValue.split(".")
  if (!payload || !signature) return false

  const passwordHash = await getAdminPasswordHash()
  const expectedSignature = signPayload(payload, passwordHash)

  if (!timingSafeEqual(signature, expectedSignature)) return false

  try {
    const session = JSON.parse(base64UrlDecode(payload)) as { exp?: number }

    return typeof session.exp === "number" && session.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()

  return isAdminSessionValueValid(cookieStore.get(adminSessionCookieName)?.value)
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.set(adminSessionCookieName, await createAdminSessionValue(), {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.delete(adminSessionCookieName)
}

export async function requireAdminRequest(request: NextRequest) {
  return isAdminSessionValueValid(request.cookies.get(adminSessionCookieName)?.value)
}
