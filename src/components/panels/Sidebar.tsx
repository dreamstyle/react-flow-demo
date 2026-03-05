import { useCallback, useSyncExternalStore, type DragEvent } from 'react';
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
} from 'lucide-react';
import { useReactFlow, type Node } from '@xyflow/react';
import { nodeRegistry, categoryLabels, categoryOrder } from '../../utils/nodeRegistry';
import { useWorkflowStore } from '../../store/workflowStore';
import type { NodeCategory } from '../../types/workflow';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Play, Square, MessageSquare, Database, Code, GitBranch, FileText, Globe, Layers,
};

const mobileQuery = '(max-width: 767px)';
const subscribe = (cb: () => void) => {
  const mql = window.matchMedia(mobileQuery);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const getSnapshot = () => window.matchMedia(mobileQuery).matches;

let nodeId = 100;
const getId = () => `node_${++nodeId}`;

export default function Sidebar() {
  const { addNode, mobileSidebarOpen, setMobileSidebarOpen } = useWorkflowStore();
  const { screenToFlowPosition } = useReactFlow();
  const isMobile = useSyncExternalStore(subscribe, getSnapshot);

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleNodeTap = useCallback(
    (nodeType: string) => {
      if (!isMobile) return;
      const nodeConfig = nodeRegistry.find((n) => n.type === nodeType);
      if (!nodeConfig) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const position = screenToFlowPosition({ x: centerX, y: centerY });

      const newNode: Node = {
        id: getId(),
        type: nodeType,
        position,
        data: {
          label: nodeConfig.label,
          type: nodeConfig.type,
          icon: nodeConfig.icon,
          color: nodeConfig.color,
          description: nodeConfig.description,
          config: { ...nodeConfig.defaultData },
        },
      };
      addNode(newNode);
      setMobileSidebarOpen(false);
    },
    [isMobile, screenToFlowPosition, addNode, setMobileSidebarOpen]
  );

  const grouped = categoryOrder.reduce(
    (acc, category) => {
      acc[category] = nodeRegistry.filter((n) => n.category === category);
      return acc;
    },
    {} as Record<NodeCategory, typeof nodeRegistry>
  );

  return (
    <div className={`sidebar${mobileSidebarOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-header">
        <h2>節點</h2>
        <span className="sidebar-subtitle">
          {isMobile ? '點擊節點以新增' : '拖拽節點到畫布'}
        </span>
      </div>

      <div className="sidebar-content">
        {categoryOrder.map((category) => (
          <div key={category} className="node-category">
            <h3 className="category-title">{categoryLabels[category]}</h3>
            <div className="category-nodes">
              {grouped[category].map((nodeConfig) => {
                const Icon = iconMap[nodeConfig.icon] || Play;
                return (
                  <div
                    key={nodeConfig.type}
                    className="sidebar-node"
                    draggable={!isMobile}
                    onDragStart={(e) => onDragStart(e, nodeConfig.type)}
                    onClick={() => handleNodeTap(nodeConfig.type)}
                  >
                    <div
                      className="sidebar-node-icon"
                      style={{
                        backgroundColor: `${nodeConfig.color}15`,
                        color: nodeConfig.color,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="sidebar-node-info">
                      <span className="sidebar-node-label">{nodeConfig.label}</span>
                      <span className="sidebar-node-desc">{nodeConfig.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
