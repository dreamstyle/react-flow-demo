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
}

const initialNodes: Node[] = [
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

const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowState>((set, get) => {
  const pushHistory = () => {
    const { nodes, edges, past } = get();
    const newPast = [...past, { nodes, edges }];
    if (newPast.length > MAX_HISTORY) newPast.shift();
    return { past: newPast, future: [] };
  };

  return {
  nodes: initialNodes,
  edges: initialEdges,
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
};
});
