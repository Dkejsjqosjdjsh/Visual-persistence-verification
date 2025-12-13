import { NextResponse } from "next/server"
import { verifyCaptcha } from "@/lib/captcha-store"

export async function POST(request: Request) {
  try {
    const { id, input } = await request.json()

    if (!id || !input) {
      return NextResponse.json({ verified: false, message: "缺少驗證碼 ID 或輸入" }, { status: 400 })
    }

    const isVerified = verifyCaptcha(id, input)

    if (isVerified) {
      return NextResponse.json({ verified: true, message: "驗證成功" })
    } else {
      return NextResponse.json({ verified: false, message: "驗證碼錯誤或已過期" }, { status: 401 })
    }
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ verified: false, message: "伺服器內部錯誤" }, { status: 500 })
  }
}
