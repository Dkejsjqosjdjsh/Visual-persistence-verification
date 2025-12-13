import { NextResponse } from "next/server"
import { createCaptcha } from "@/lib/captcha-store"

export async function POST() {
  const { id } = createCaptcha()
  return NextResponse.json({ id })
}
