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
