# 視覺暫留驗證碼 (Visual Persistence Captcha)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 專案簡介

**視覺暫留驗證碼**（Visual Persistence Captcha）是一個基於 **Next.js** 框架實現的現代人機驗證系統。它利用人類視覺的**視覺暫留效應**（Persistence of Vision）來呈現驗證碼字符，旨在提供一種新穎且難以被傳統 Bot 識別的驗證方式。

與傳統的圖片扭曲驗證碼不同，本專案的驗證碼字符是透過快速閃爍的黑白噪點（Noise）來「隱藏」的。只有當使用者專注於閃爍區域時，由於視覺暫留現象，才能在腦海中「看見」靜態的字符。

## 核心功能與特色

1.  **視覺暫留機制**：利用 `<canvas>` 元素實現高速的噪點動畫，創造視覺暫留效果。
2.  **安全性重構**：**驗證邏輯完全在伺服器端（Server-side）執行**，有效防止惡意 Bot 透過客戶端程式碼繞過驗證。
3.  **現代技術棧**：採用 Next.js 14+ App Router、React 18+、TypeScript 和 Tailwind CSS 構建。
4.  **開源友好**：專案已移除所有硬編碼的追蹤代碼，並採用 MIT 許可證。

## 技術棧

| 類別 | 技術 | 說明 |
| :--- | :--- | :--- |
| **框架** | Next.js (App Router) | 現代 React 框架，用於伺服器端渲染和 API 路由。 |
| **語言** | TypeScript | 增強程式碼品質和可維護性。 |
| **前端** | React | 用於構建使用者介面。 |
| **樣式** | Tailwind CSS | 實用至上的 CSS 框架，快速構建響應式設計。 |
| **元件** | Shadcn/ui (Radix UI) | 高品質、可自訂的 UI 元件。 |
| **狀態管理** | 記憶體 Map (API 路由) | 模擬伺服器端狀態儲存，用於驗證碼 ID 和字符的臨時儲存。**（注意：生產環境應替換為 Redis 或資料庫）** |

## 安全性說明（重要）

本專案已將驗證碼的生成和驗證邏輯從客戶端移至伺服器端（`/app/api/captcha`）。

*   **客戶端**：只負責繪製動畫和傳送使用者輸入。
*   **伺服器端**：負責生成驗證碼字符、將其與唯一的 ID 綁定、儲存（模擬記憶體儲存），並最終驗證使用者輸入。

**⚠️ 生產環境警告：**

目前專案使用一個簡單的**記憶體 Map** (`/lib/captcha-store.ts`) 來儲存驗證碼狀態。這在單一伺服器環境下可以工作，但**不適用於多伺服器或無伺服器（Serverless）的生產環境**。在部署到生產環境時，您**必須**將 `/lib/captcha-store.ts` 中的儲存機制替換為一個持久化且可跨多個實例共享的儲存系統，例如 **Redis** 或 **Memcached**。

## 本地部署與運行

### 1. 克隆倉庫

```bash
git clone https://github.com/Dkejsjqosjdjsh/Visual-persistence-verification.git
cd Visual-persistence-verification
```

### 2. 安裝依賴

本專案使用 `pnpm` 作為包管理器。

```bash
pnpm install
```

### 3. 運行開發伺服器

```bash
pnpm dev
```

專案將在 `http://localhost:3000` 啟動。

### 4. 建置生產版本

```bash
pnpm build
pnpm start
```

## 備註與背景

1.  **原始作者與所有權**：本專案的原始程式碼由 **發燈條** 開發，所有權和版權歸屬於 **發燈條**。
2.  **v0 開發階段**：本專案最初是作為一個快速概念驗證（Proof of Concept, PoC）的 **v0 版本**進行開發。它旨在展示「視覺暫留驗證碼」的技術可行性，因此在最初的程式碼中，驗證邏輯是完全在客戶端實現的。
3.  **潛在應用：燈條溝通**：視覺暫留效應的原理與 **LED 燈條**或**光柵顯示**等技術有異曲同工之妙。本專案的繪圖邏輯（快速閃爍的噪點）可以作為一個基礎參考，用於探索將資料或圖像透過高速閃爍的硬體（例如 LED 燈條）進行傳輸或顯示的**燈條溝通**（LED Strip Communication）應用。
4.  **GitHub 倉庫創建**：本 GitHub 倉庫是 **發燈條** 與 **Manus AI** 互動的結果，由 Manus AI 代理創建和初始提交。

## 許可證

本專案根據 **MIT 許可證**發佈。詳情請參閱 [LICENSE.md](LICENSE.md) 文件。
