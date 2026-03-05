# 🚀 React Flow Workflow Builder 

✨ **一個用 React Flow 打造的視覺化工作流程編輯器！** ✨

拖拉、連接、打造你的自動化工作流程 — 就是這麼簡單！🎉

---

## 🌟 功能特色

- 🎨 **直覺式拖放操作** — 從側邊欄拖曳節點到畫布，輕鬆建立工作流程
- 🔗 **智慧連線** — 節點之間自動連接，支援多種連線方式
- 🧩 **豐富的節點類型**：
  - 🟢 **Start / End** — 流程起點與終點
  - 🤖 **LLM** — 大語言模型呼叫
  - 💻 **Code** — 自訂程式碼執行
  - 🔀 **If/Else** — 條件分支判斷
  - 📝 **Template** — 文字模板處理
  - 🌐 **HTTP Request** — API 呼叫
  - 📚 **Knowledge** — 知識庫檢索
  - 📦 **Variable** — 變數管理
- ⚙️ **即時設定面板** — 點選節點即可編輯參數
- 💾 **狀態管理** — 使用 Zustand 進行高效狀態管理
- 🎯 **TypeScript** — 完整型別安全，開發更安心

---

## 🛠️ 技術棧

| 技術 | 說明 |
|------|------|
| ⚛️ **React 19** | 最新版 React，效能更強 |
| 🔷 **TypeScript** | 型別安全的開發體驗 |
| 🌊 **React Flow** | 強大的流程圖框架 |
| 🐻 **Zustand** | 輕量級狀態管理 |
| ⚡ **Vite** | 極速開發伺服器與打包工具 |
| 🎨 **Lucide Icons** | 精美的圖示庫 |

---

## 🚀 快速開始

### 📋 前置需求

- 📌 Node.js 18+
- 📌 npm 或 yarn

### 📦 安裝

```bash
# 克隆專案 📥
git clone <repo-url>
cd react-flow-demo

# 安裝依賴 📚
npm install
```

### 🏃 啟動開發伺服器

```bash
npm run dev
```

瀏覽器開啟 `http://localhost:5173` 即可看到成果！🎊

### 🏗️ 建置生產版本

```bash
npm run build
```

### 🔍 程式碼檢查

```bash
npm run lint
```

---

## 📁 專案結構

```
src/
├── 🎯 App.tsx                    # 應用程式入口
├── 🚪 main.tsx                   # React 掛載點
├── 📐 types/
│   └── workflow.ts               # 工作流程型別定義
├── 🏪 store/
│   └── workflowStore.ts          # Zustand 狀態管理
├── 🧰 utils/
│   └── nodeRegistry.ts           # 節點註冊表
└── 🧩 components/
    ├── WorkflowCanvas.tsx        # 主畫布元件
    ├── nodes/                    # 各種節點元件
    │   ├── BaseNode.tsx          # 基礎節點
    │   ├── StartNode.tsx         # 開始節點
    │   ├── EndNode.tsx           # 結束節點
    │   ├── LLMNode.tsx           # LLM 節點
    │   ├── CodeNode.tsx          # 程式碼節點
    │   ├── IfElseNode.tsx        # 條件節點
    │   ├── TemplateNode.tsx      # 模板節點
    │   ├── HttpNode.tsx          # HTTP 節點
    │   ├── KnowledgeNode.tsx     # 知識庫節點
    │   └── VariableNode.tsx      # 變數節點
    └── panels/
        ├── Sidebar.tsx           # 側邊欄（節點選擇）
        ├── Toolbar.tsx           # 工具列
        └── ConfigPanel.tsx       # 設定面板
```

---

## 🤝 貢獻

歡迎任何形式的貢獻！🙌

1. 🍴 Fork 這個專案
2. 🌿 建立你的 Feature Branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit 你的修改 (`git commit -m 'Add some amazing feature'`)
4. 📤 Push 到 Branch (`git push origin feature/amazing-feature`)
5. 🎉 開啟一個 Pull Request

---

## 📄 授權

本專案採用 MIT 授權條款 📜

---

<p align="center">
  用 ❤️ 和 ☕ 打造 | Made with React Flow 🌊
</p>
