# CLAUDE.md

## Project Overview

Dify 風格的視覺化 Workflow Builder，使用 React Flow 實現拖拉式工作流程編輯器。
UI 語言為繁體中文。

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9
- **Build**: Vite 7
- **Flow Engine**: @xyflow/react 12 (React Flow)
- **State Management**: Zustand 5
- **Icons**: lucide-react
- **Linting**: ESLint 9 (flat config)
- **Deployment**: GitHub Pages via GitHub Actions

## Commands

- `npm run dev` — 啟動開發伺服器
- `npm run build` — TypeScript 檢查 + Vite 建置 (`tsc -b && vite build`)
- `npm run lint` — ESLint 檢查
- `npm run preview` — 預覽建置結果

## Project Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root layout (header + ReactFlowProvider)
├── index.css                   # Global styles
├── App.css                     # App layout + component styles
├── types/workflow.ts           # NodeCategory, NodeTypeConfig, WorkflowNodeData types
├── store/workflowStore.ts      # Zustand store (nodes, edges, CRUD operations)
├── utils/nodeRegistry.ts       # Node type definitions and category config
├── components/
│   ├── WorkflowCanvas.tsx      # Main canvas with ReactFlow, drag-and-drop handling
│   ├── nodes/                  # Custom node components
│   │   ├── index.ts            # nodeTypes registry for ReactFlow
│   │   ├── BaseNode.tsx        # Shared node wrapper (handles, styling)
│   │   ├── StartNode.tsx
│   │   ├── EndNode.tsx
│   │   ├── LLMNode.tsx
│   │   ├── KnowledgeNode.tsx
│   │   ├── CodeNode.tsx
│   │   ├── IfElseNode.tsx
│   │   ├── TemplateNode.tsx
│   │   ├── HttpNode.tsx
│   │   └── VariableNode.tsx
│   └── panels/
│       ├── Sidebar.tsx         # Left panel — node palette (drag source)
│       ├── ConfigPanel.tsx     # Right panel — selected node config editor
│       └── Toolbar.tsx         # Canvas overlay toolbar (zoom, undo)
```

## Architecture

- **Node Registry** (`nodeRegistry.ts`): 定義所有可用節點類型，包含 type、label、category、icon、color、defaultData。新增節點類型時從這裡開始。
- **Zustand Store** (`workflowStore.ts`): 管理 nodes/edges 狀態、selection、CRUD。使用 `applyNodeChanges`/`applyEdgeChanges` 處理 React Flow 事件。
- **Node Components** (`components/nodes/`): 每個節點繼承 `BaseNode` 共用外觀，各自只定義內容區塊。
- **Drag & Drop**: Sidebar 拖曳節點到 Canvas，透過 `dataTransfer` 傳遞 node type。

## Adding a New Node Type

1. 在 `nodeRegistry.ts` 新增 `NodeTypeConfig`
2. 在 `components/nodes/` 建立新元件（使用 `BaseNode` 包裝）
3. 在 `components/nodes/index.ts` 註冊到 `nodeTypes`

## Deployment

- GitHub Pages，Source 必須設為 **GitHub Actions**（非 "Deploy from a branch"）
- Vite `base` 設為 `/react-flow-demo/`
- Push 到 `main` 自動觸發 `.github/workflows/deploy.yml`
