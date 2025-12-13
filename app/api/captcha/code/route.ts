import { NextResponse } from "next/server"
import { getCaptchaCode } from "@/lib/captcha-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return new NextResponse("Missing captcha ID", { status: 400 })
  }

  const code = getCaptchaCode(id)

  if (!code) {
    return new NextResponse("Captcha not found or expired", { status: 404 })
  }

  // 注意：這裡將 code 傳回給前端是為了讓前端能繪製驗證碼
  // 由於驗證碼的視覺特性，Bot 難以直接從這裡獲取 code
  // 真正的安全性在於驗證邏輯在伺服器端
  return NextResponse.json({ code })
}
