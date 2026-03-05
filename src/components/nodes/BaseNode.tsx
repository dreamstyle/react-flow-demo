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
  const connection = useConnection();
  const Icon = iconMap[data.icon] || Play;

  const isTarget = connection.inProgress && connection.fromNode.id !== id;

  return (
    <div
      className={`workflow-node ${selected ? 'selected' : ''}`}
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
        {data.type !== 'start' && (
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
