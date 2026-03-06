import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  MarkerType,
} from '@xyflow/react';
import type {
  WorkflowNodeData,
  WorkflowExecutionState,
  ExecutionLog,
} from '../types/workflow';
import { executeWorkflow } from '../utils/executionEngine';

interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  execution: WorkflowExecutionState | null;
  mobileSidebarOpen: boolean;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  deleteNode: (id: string) => void;
  startExecution: () => void;
  clearExecution: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  resetToExample: () => void;
  clearCanvas: () => void;
}

const STORAGE_KEY = 'workflow-canvas';

const defaultEdgeStyle = {
  type: 'smoothstep' as const,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
  style: { stroke: '#94a3b8', strokeWidth: 2 },
};

const startOnlyNodes: Node[] = [
  {
    id: 'start-1',
    type: 'startNode',
    position: { x: 300, y: 80 },
    data: {
      label: '開始',
      type: 'start',
      icon: 'Play',
      color: '#2563eb',
      config: { input_variables: [] },
    },
  },
];

const exampleNodes: Node[] = [
  {
    id: 'start-1',
    type: 'startNode',
    position: { x: 300, y: 50 },
    data: {
      label: '開始',
      type: 'start',
      icon: 'Play',
      color: '#2563eb',
      config: { input_variables: ['user_query'] },
    },
  },
  {
    id: 'knowledge-1',
    type: 'knowledgeNode',
    position: { x: 80, y: 200 },
    data: {
      label: '知識庫',
      type: 'knowledge',
      icon: 'Database',
      color: '#0891b2',
      description: '從知識庫中檢索資料',
      config: { knowledge_base: '產品文件庫', top_k: 3, score_threshold: 0.5 },
    },
  },
  {
    id: 'template-1',
    type: 'templateNode',
    position: { x: 480, y: 200 },
    data: {
      label: '模板轉換',
      type: 'template',
      icon: 'FileText',
      color: '#ca8a04',
      description: '使用模板轉換資料',
      config: { template: '根據以下資料回答使用者問題：\n\n{{context}}\n\n使用者問題：{{user_query}}' },
    },
  },
  {
    id: 'llm-1',
    type: 'llmNode',
    position: { x: 280, y: 380 },
    data: {
      label: 'LLM',
      type: 'llm',
      icon: 'MessageSquare',
      color: '#7c3aed',
      description: '呼叫大型語言模型',
      config: { model: 'gpt-4', temperature: 0.7, system_prompt: '你是一個專業的客服助手', max_tokens: 2048 },
    },
  },
  {
    id: 'ifelse-1',
    type: 'ifElseNode',
    position: { x: 280, y: 550 },
    data: {
      label: '條件判斷',
      type: 'ifElse',
      icon: 'GitBranch',
      color: '#16a34a',
      description: 'IF/ELSE 條件分支',
      config: { conditions: [{ variable: 'confidence', operator: 'gte', value: '0.8' }] },
    },
  },
  {
    id: 'end-1',
    type: 'endNode',
    position: { x: 120, y: 720 },
    data: {
      label: '結束（直接回覆）',
      type: 'end',
      icon: 'Square',
      color: '#dc2626',
      description: '工作流程的結束節點',
      config: { output_type: 'text' },
    },
  },
  {
    id: 'http-1',
    type: 'httpNode',
    position: { x: 440, y: 720 },
    data: {
      label: 'HTTP 請求',
      type: 'http',
      icon: 'Globe',
      color: '#0d9488',
      description: '發送 HTTP 請求到外部 API',
      config: { method: 'POST', url: 'https://api.example.com/escalate', headers: {}, body: '' },
    },
  },
];

const exampleEdges: Edge[] = [
  { id: 'e-start-knowledge', source: 'start-1', target: 'knowledge-1', ...defaultEdgeStyle },
  { id: 'e-start-template', source: 'start-1', target: 'template-1', ...defaultEdgeStyle },
  { id: 'e-knowledge-llm', source: 'knowledge-1', target: 'llm-1', ...defaultEdgeStyle },
  { id: 'e-template-llm', source: 'template-1', target: 'llm-1', ...defaultEdgeStyle },
  { id: 'e-llm-ifelse', source: 'llm-1', target: 'ifelse-1', ...defaultEdgeStyle },
  { id: 'e-ifelse-end', source: 'ifelse-1', target: 'end-1', sourceHandle: 'true', ...defaultEdgeStyle },
  { id: 'e-ifelse-http', source: 'ifelse-1', target: 'http-1', sourceHandle: 'false', ...defaultEdgeStyle },
];

function saveToStorage(nodes: Node[], edges: Edge[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  } catch {
    // ignore quota errors
  }
}

function loadFromStorage(): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
      return data;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function getInitialState(): { nodes: Node[]; edges: Edge[] } {
  const saved = loadFromStorage();
  if (saved) return saved;
  return { nodes: exampleNodes, edges: exampleEdges };
}

const initialState = getInitialState();

export const useWorkflowStore = create<WorkflowState>((set, get) => {
  const pushHistory = () => {
    const { nodes, edges, past } = get();
    const newPast = [...past, { nodes, edges }];
    if (newPast.length > MAX_HISTORY) newPast.shift();
    return { past: newPast, future: [] };
  };

  return {
  nodes: initialState.nodes,
  edges: initialState.edges,
  selectedNodeId: null,
  execution: null,
  mobileSidebarOpen: false,
  past: [],
  future: [],

  onNodesChange: (changes) => {
    const hasStructuralChange = changes.some(
      (c) => c.type === 'remove' || c.type === 'add' || c.type === 'replace'
    );
    if (hasStructuralChange) {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
        ...pushHistory(),
      });
    } else {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    }
  },

  onEdgesChange: (changes) => {
    const hasStructuralChange = changes.some(
      (c) => c.type === 'remove' || c.type === 'add' || c.type === 'replace'
    );
    if (hasStructuralChange) {
      set({
        edges: applyEdgeChanges(changes, get().edges),
        ...pushHistory(),
      });
    } else {
      set({ edges: applyEdgeChanges(changes, get().edges) });
    }
  },

  onConnect: (connection: Connection) => {
    const edge = {
      ...connection,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    };
    set({ edges: addEdge(edge, get().edges), ...pushHistory() });
  },

  addNode: (node: Node) => {
    set({ nodes: [...get().nodes, node], ...pushHistory() });
  },

  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  updateNodeData: (id: string, data: Record<string, unknown>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
      ...pushHistory(),
    });
  },

  deleteNode: (id: string) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      ...pushHistory(),
    });
  },

  undo: () => {
    const { past, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...get().future],
      nodes: previous.nodes,
      edges: previous.edges,
    });
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      future: future.slice(1),
      past: [...get().past, { nodes, edges }],
      nodes: next.nodes,
      edges: next.edges,
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  startExecution: () => {
    const { nodes, edges, execution } = get();

    // Don't start if already running
    if (execution?.isRunning) return;

    // Initialize all nodes as pending
    const nodeStates: WorkflowExecutionState['nodeStates'] = {};
    for (const node of nodes) {
      nodeStates[node.id] = { status: 'pending' };
    }

    set({
      execution: {
        isRunning: true,
        nodeStates,
        logs: [],
        startTime: Date.now(),
      },
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    executeWorkflow(nodes, edges, {
      onStart: () => {},

      onNodeStart: (nodeId: string) => {
        set((state) => ({
          execution: state.execution
            ? {
                ...state.execution,
                nodeStates: {
                  ...state.execution.nodeStates,
                  [nodeId]: {
                    status: 'running' as const,
                    startTime: Date.now(),
                  },
                },
              }
            : null,
        }));
      },

      onNodeComplete: (nodeId: string, output: Record<string, unknown>) => {
        const node = nodeMap.get(nodeId);
        const data = node?.data as WorkflowNodeData | undefined;
        const startTime =
          get().execution?.nodeStates[nodeId]?.startTime || Date.now();
        const endTime = Date.now();

        const logEntry: ExecutionLog = {
          nodeId,
          nodeName: data?.label || nodeId,
          nodeType: data?.type || 'unknown',
          status: 'success',
          output,
          duration: endTime - startTime,
        };

        set((state) => ({
          execution: state.execution
            ? {
                ...state.execution,
                nodeStates: {
                  ...state.execution.nodeStates,
                  [nodeId]: {
                    status: 'success' as const,
                    output,
                    startTime,
                    endTime,
                  },
                },
                logs: [...state.execution.logs, logEntry],
              }
            : null,
        }));
      },

      onNodeError: (nodeId: string, error: string) => {
        const node = nodeMap.get(nodeId);
        const data = node?.data as WorkflowNodeData | undefined;
        const startTime =
          get().execution?.nodeStates[nodeId]?.startTime || Date.now();
        const endTime = Date.now();

        const logEntry: ExecutionLog = {
          nodeId,
          nodeName: data?.label || nodeId,
          nodeType: data?.type || 'unknown',
          status: 'error',
          error,
          duration: endTime - startTime,
        };

        set((state) => ({
          execution: state.execution
            ? {
                ...state.execution,
                nodeStates: {
                  ...state.execution.nodeStates,
                  [nodeId]: {
                    status: 'error' as const,
                    error,
                    startTime,
                    endTime,
                  },
                },
                logs: [...state.execution.logs, logEntry],
              }
            : null,
        }));
      },

      onNodeSkipped: (nodeId: string) => {
        const node = nodeMap.get(nodeId);
        const data = node?.data as WorkflowNodeData | undefined;

        const logEntry: ExecutionLog = {
          nodeId,
          nodeName: data?.label || nodeId,
          nodeType: data?.type || 'unknown',
          status: 'skipped',
        };

        set((state) => ({
          execution: state.execution
            ? {
                ...state.execution,
                nodeStates: {
                  ...state.execution.nodeStates,
                  [nodeId]: { status: 'skipped' as const },
                },
                logs: [...state.execution.logs, logEntry],
              }
            : null,
        }));
      },

      onComplete: () => {
        set((state) => ({
          execution: state.execution
            ? {
                ...state.execution,
                isRunning: false,
                endTime: Date.now(),
              }
            : null,
        }));
      },
    }).catch((error: Error) => {
      alert(error.message);
      set({ execution: null });
    });
  },

  clearExecution: () => {
    set({ execution: null });
  },

  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  resetToExample: () => {
    set({
      nodes: exampleNodes,
      edges: exampleEdges,
      selectedNodeId: null,
      execution: null,
      past: [],
      future: [],
    });
    saveToStorage(exampleNodes, exampleEdges);
  },

  clearCanvas: () => {
    set({
      nodes: startOnlyNodes,
      edges: [],
      selectedNodeId: null,
      execution: null,
      past: [],
      future: [],
    });
    saveToStorage(startOnlyNodes, []);
  },
};
});

// Auto-save to localStorage on nodes/edges changes
useWorkflowStore.subscribe((state, prevState) => {
  if (state.nodes !== prevState.nodes || state.edges !== prevState.edges) {
    saveToStorage(state.nodes, state.edges);
  }
});
