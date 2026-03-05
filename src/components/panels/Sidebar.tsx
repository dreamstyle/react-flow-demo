import { type DragEvent } from 'react';
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
import { nodeRegistry, categoryLabels, categoryOrder } from '../../utils/nodeRegistry';
import type { NodeCategory } from '../../types/workflow';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Play, Square, MessageSquare, Database, Code, GitBranch, FileText, Globe, Layers,
};

export default function Sidebar() {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const grouped = categoryOrder.reduce(
    (acc, category) => {
      acc[category] = nodeRegistry.filter((n) => n.category === category);
      return acc;
    },
    {} as Record<NodeCategory, typeof nodeRegistry>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>節點</h2>
        <span className="sidebar-subtitle">拖拽節點到畫布</span>
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
                    draggable
                    onDragStart={(e) => onDragStart(e, nodeConfig.type)}
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
