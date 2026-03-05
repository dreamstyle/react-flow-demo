export type NodeCategory = 'trigger' | 'llm' | 'knowledge' | 'logic' | 'transform' | 'output';

export interface NodeTypeConfig {
  type: string;
  label: string;
  category: NodeCategory;
  icon: string;
  color: string;
  description: string;
  defaultData: Record<string, unknown>;
}

export interface WorkflowNodeData {
  label: string;
  type: string;
  icon: string;
  color: string;
  description?: string;
  config: Record<string, unknown>;
}

export type ExecutionStatus = 'idle' | 'pending' | 'running' | 'success' | 'error' | 'skipped';

export interface NodeExecutionState {
  status: ExecutionStatus;
  output?: Record<string, unknown>;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface ExecutionLog {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: ExecutionStatus;
  output?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

export interface WorkflowExecutionState {
  isRunning: boolean;
  nodeStates: Record<string, NodeExecutionState>;
  logs: ExecutionLog[];
  startTime?: number;
  endTime?: number;
}
