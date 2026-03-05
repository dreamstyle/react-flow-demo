import { useCallback, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  ConnectionMode,
} from '@xyflow/react';
import { Plus, X } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { useWorkflowStore } from '../store/workflowStore';
import { nodeRegistry } from '../utils/nodeRegistry';
import Sidebar from './panels/Sidebar';
import ConfigPanel from './panels/ConfigPanel';
import ExecutionResultPanel from './panels/ExecutionResultPanel';
import Toolbar from './panels/Toolbar';

let nodeId = 1;
const getId = () => `node_${++nodeId}`;

export default function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectedNodeId,
    setSelectedNodeId,
    execution,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useWorkflowStore();

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowWrapper.current) return;

      const nodeConfig = nodeRegistry.find((n) => n.type === type);
      if (!nodeConfig) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();

      const newNode: Node = {
        id: getId(),
        type,
        position: {
          x: event.clientX - bounds.left - 100,
          y: event.clientY - bounds.top - 30,
        },
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
    },
    [addNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="workflow-layout">
      <Sidebar />
      {mobileSidebarOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      )}
      <button
        className="mobile-add-fab"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        {mobileSidebarOpen ? <X size={28} /> : <Plus size={28} />}
      </button>
      <div className="workflow-canvas-container" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
          <Controls
            showInteractive={false}
            className="flow-controls"
          />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as Record<string, unknown>;
              return (data.color as string) || '#94a3b8';
            }}
            maskColor="rgba(240, 242, 245, 0.7)"
            className="flow-minimap"
          />
          <Toolbar />
        </ReactFlow>
      </div>
      {execution && !execution.isRunning ? (
        <ExecutionResultPanel />
      ) : (
        selectedNodeId && <ConfigPanel />
      )}
    </div>
  );
}
