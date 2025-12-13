// 模擬伺服器端狀態儲存 (實際應用中應使用 Redis 或資料庫)
const captchaStore = new Map<string, { code: string; timestamp: number }>()
const CAPTCHA_EXPIRY_MS = 5 * 60 * 1000 // 5 分鐘過期

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const CODE_LENGTH = 6

const generateCaptchaCode = (): string => {
  let code = ""
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return code
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 清理過期驗證碼
const cleanupExpiredCaptchas = () => {
  const now = Date.now()
  for (const [id, data] of captchaStore.entries()) {
    if (now - data.timestamp > CAPTCHA_EXPIRY_MS) {
      captchaStore.delete(id)
    }
  }
}

export const createCaptcha = (): { id: string; code: string } => {
  cleanupExpiredCaptchas()
  const id = generateId()
  const code = generateCaptchaCode()
  captchaStore.set(id, { code, timestamp: Date.now() })
  return { id, code }
}

export const getCaptchaCode = (id: string): string | undefined => {
  cleanupExpiredCaptchas()
  const data = captchaStore.get(id)
  if (data) {
    return data.code
  }
  return undefined
}

export const verifyCaptcha = (id: string, input: string): boolean => {
  cleanupExpiredCaptchas()
  const data = captchaStore.get(id)
  if (!data) {
    return false // ID 不存在或已過期
  }

  // 驗證成功後立即刪除，防止重放攻擊
  captchaStore.delete(id)

  return data.code === input.toUpperCase()
}
