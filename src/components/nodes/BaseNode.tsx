import { memo, type ReactNode } from 'react';
import { Handle, Position, useConnection } from '@xyflow/react';
import {
  Play,
  Square,
  MessageSquare,
  Database,
  Code,
  GitBranch,
  FileText,
  Globe,
  Layers,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { WorkflowNodeData } from '../../types/workflow';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Play, Square, MessageSquare, Database, Code, GitBranch, FileText, Globe, Layers,
};

interface BaseNodeProps {
  id: string;
  data: WorkflowNodeData;
  selected?: boolean;
  children?: ReactNode;
  sourceHandles?: { id: string; label: string; position?: number }[];
  hideTarget?: boolean;
  hideSource?: boolean;
}

function BaseNode({
  id,
  data,
  selected,
  children,
  sourceHandles,
  hideTarget = false,
  hideSource = false,
}: BaseNodeProps) {
  const { setSelectedNodeId, deleteNode } = useWorkflowStore();
  const nodeExecState = useWorkflowStore((s) => s.execution?.nodeStates[id]);
  const connection = useConnection();
  const Icon = iconMap[data.icon] || Play;

  const isTarget = connection.inProgress && connection.fromNode.id !== id;
  const execStatus = nodeExecState?.status;

  const execClassName = execStatus && execStatus !== 'idle'
    ? `execution-${execStatus}`
    : '';

  return (
    <div
      className={`workflow-node ${selected ? 'selected' : ''} ${execClassName}`}
      onClick={() => setSelectedNodeId(id)}
      style={{ '--node-color': data.color } as React.CSSProperties}
    >
      {!hideTarget && (
        <Handle
          type="target"
          position={Position.Left}
          className={`node-handle target-handle ${isTarget ? 'connecting' : ''}`}
        />
      )}

      <div className="node-header">
        <div className="node-icon" style={{ backgroundColor: `${data.color}15`, color: data.color }}>
          <Icon size={16} />
        </div>
        <span className="node-title">{data.label}</span>

        {execStatus === 'running' && (
          <Loader2 size={14} className="node-exec-indicator exec-running-icon" />
        )}
        {execStatus === 'success' && (
          <CheckCircle2 size={14} className="node-exec-indicator exec-success-icon" />
        )}
        {execStatus === 'error' && (
          <XCircle size={14} className="node-exec-indicator exec-error-icon" />
        )}
        {execStatus === 'skipped' && (
          <MinusCircle size={14} className="node-exec-indicator exec-skipped-icon" />
        )}

        {data.type !== 'start' && !execStatus && (
          <button
            className="node-delete"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(id);
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {data.description && (
        <div className="node-description">{data.description}</div>
      )}

      {children && <div className="node-body">{children}</div>}

      {nodeExecState?.output && (
        <div className="node-output-preview">
          {JSON.stringify(nodeExecState.output).slice(0, 60)}...
        </div>
      )}

      {nodeExecState?.error && (
        <div className="node-error-preview">
          {nodeExecState.error}
        </div>
      )}

      {!hideSource && !sourceHandles && (
        <Handle
          type="source"
          position={Position.Right}
          className="node-handle source-handle"
        />
      )}

      {sourceHandles?.map((handle, index) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Right}
          id={handle.id}
          className="node-handle source-handle"
          style={{
            top: `${((index + 1) / (sourceHandles.length + 1)) * 100}%`,
          }}
        >
          <span className="handle-label">{handle.label}</span>
        </Handle>
      ))}
    </div>
  );
}

export default memo(BaseNode);
