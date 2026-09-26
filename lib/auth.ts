import { NextRequest } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase";

const adminCookie = "kids_coloring_admin";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

export async function requireAdmin(request: NextRequest) {
  const cookieSession = request.cookies.get(adminCookie)?.value;
  if (cookieSession && verifyAdminSession(cookieSession)) {
    return { ok: true as const, email: getAdminEmail() };
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { ok: false as const, status: 401, message: "Missing auth token." };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  const adminEmail = getAdminEmail();

  if (error || !email || email !== adminEmail) {
    return { ok: false as const, status: 403, message: "Admin access denied." };
  }

  return { ok: true as const, email };
}

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || "olugabriel80@gmail.com").toLowerCase();
}

export function hasAdminPassword() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function verifyAdminPassword(email: string, password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || email.toLowerCase() !== getAdminEmail()) return false;
  return safeEqual(password, adminPassword);
}

export function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds;
  const payload = `${getAdminEmail()}.${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyAdminSession(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [email, expiresValue, signature] = parts;
  const expires = Number.parseInt(expiresValue, 10);
  if (email !== getAdminEmail() || !Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) {
    return false;
  }

  return safeEqual(signature, sign(`${email}.${expires}`));
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds
  };
}

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dev-only-secret";
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
