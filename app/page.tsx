"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, RefreshCw } from "lucide-react"

export default function VisualPersistenceCaptcha() {
  const [captchaId, setCaptchaId] = useState<string | null>(null)
  const [userInput, setUserInput] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const staticCharNoiseRef = useRef<ImageData | null>(null)

  const CANVAS_WIDTH = 400
  const CANVAS_HEIGHT = 150
  const CODE_LENGTH = 6

  const generateStaticCharNoise = (ctx: CanvasRenderingContext2D, code: string) => {
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = CANVAS_WIDTH
    tempCanvas.height = CANVAS_HEIGHT
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return null

    tempCtx.fillStyle = "white"
    tempCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    const charWidth = CANVAS_WIDTH / CODE_LENGTH
    tempCtx.font = "bold 60px monospace"
    tempCtx.textBaseline = "middle"
    tempCtx.textAlign = "center"
    tempCtx.fillStyle = "black"

    for (let i = 0; i < CODE_LENGTH; i++) {
      const x = charWidth * i + charWidth / 2
      const y = CANVAS_HEIGHT / 2
      tempCtx.fillText(code[i], x, y)
    }

    const charMask = tempCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    const staticNoise = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT)

    for (let i = 0; i < charMask.data.length; i += 4) {
      if (charMask.data[i] < 128) {
        const color = Math.random() > 0.5 ? 255 : 0
        staticNoise.data[i] = color
        staticNoise.data[i + 1] = color
        staticNoise.data[i + 2] = color
        staticNoise.data[i + 3] = 255
      } else {
        staticNoise.data[i] = 0
        staticNoise.data[i + 1] = 0
        staticNoise.data[i + 2] = 0
        staticNoise.data[i + 3] = 0
      }
    }

    return staticNoise
  }

  const drawFrame = (ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const color = Math.random() > 0.5 ? 255 : 0
      data[i] = color
      data[i + 1] = color
      data[i + 2] = color
      data[i + 3] = 255
    }

    ctx.putImageData(imageData, 0, 0)

    if (staticCharNoiseRef.current) {
      const staticData = staticCharNoiseRef.current.data
      const currentData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      for (let i = 0; i < staticData.length; i += 4) {
        if (staticData[i + 3] > 0) {
          currentData.data[i] = staticData[i]
          currentData.data[i + 1] = staticData[i + 1]
          currentData.data[i + 2] = staticData[i + 2]
          currentData.data[i + 3] = staticData[i + 3]
        }
      }

      ctx.putImageData(currentData, 0, 0)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const loop = () => {
      drawFrame(ctx)
      animationRef.current = requestAnimationFrame(loop)
    }

    loop()
  }

  const fetchAndDrawCaptcha = async (id: string) => {
    setIsCaptchaLoading(true)
    try {
      const response = await fetch(`/api/captcha/code?id=${id}`)
      if (!response.ok) throw new Error("Failed to fetch captcha code")
      const { code } = await response.json()

      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          staticCharNoiseRef.current = generateStaticCharNoise(ctx, code)
        }
      }
      animate()
    } catch (e) {
      console.error(e)
      setError("無法載入驗證碼，請重試。")
    } finally {
      setIsCaptchaLoading(false)
    }
  }

  const initCaptcha = async () => {
    setUserInput("")
    setError("")
    setIsVerified(false)

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsCaptchaLoading(true)
    try {
      const response = await fetch("/api/captcha/generate", { method: "POST" })
      if (!response.ok) throw new Error("Failed to generate captcha ID")
      const { id } = await response.json()
      setCaptchaId(id)
      await fetchAndDrawCaptcha(id)
    } catch (e) {
      console.error(e)
      setError("無法初始化驗證碼，請重試。")
      setIsCaptchaLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!captchaId || !userInput) {
      setError("請輸入驗證碼")
      return
    }

    setIsCaptchaLoading(true)
    try {
      const response = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: captchaId, input: userInput.toUpperCase() }),
      })

      const result = await response.json()

      if (response.ok && result.verified) {
        setIsVerified(true)
        setError("")
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      } else {
        setError(result.message || "驗證碼錯誤，請重試")
        setTimeout(() => {
          initCaptcha()
        }, 1500)
      }
    } catch (e) {
      console.error(e)
      setError("驗證失敗，請檢查網路。")
    } finally {
      setIsCaptchaLoading(false)
    }
  }

  useEffect(() => {
    initCaptcha()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />
            </div>
            <CardTitle className="text-3xl text-green-600">驗證成功！</CardTitle>
            <CardDescription className="text-lg mt-2">您已通過人機驗證</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => {
                setIsVerified(false)
                initCaptcha()
              }}
              variant="outline"
              className="mt-6"
            >
              重新驗證
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">視覺暫留驗證碼</CardTitle>
          <CardDescription className="text-center">請輸入您看到的字符</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden border-2 border-muted">
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full" />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 text-center">
              盯著閃爍的噪點看，您會看到清晰的字符（基於視覺暫留效應）
            </p>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="請輸入驗證碼"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerify()
                }
              }}
              maxLength={CODE_LENGTH}
              className="text-center text-lg font-mono tracking-widest uppercase"
            />
            {error && <p className="text-sm text-destructive text-center font-medium">{error}</p>}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleVerify} className="flex-1" disabled={isCaptchaLoading}>
              驗證
            </Button>
            <Button onClick={initCaptcha} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
