import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2, PlayCircle, Loader2, RotateCcw } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { startExecution, clearExecution, execution } = useWorkflowStore();
  const isRunning = execution?.isRunning ?? false;
  const hasResults = execution !== null && !execution.isRunning;

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => zoomIn()} title="放大">
          <ZoomIn size={18} />
        </button>
        <button className="toolbar-btn" onClick={() => zoomOut()} title="縮小">
          <ZoomOut size={18} />
        </button>
        <button className="toolbar-btn" onClick={() => fitView({ padding: 0.2 })} title="適應畫面">
          <Maximize size={18} />
        </button>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <button className="toolbar-btn" title="復原">
          <Undo2 size={18} />
        </button>
        <button className="toolbar-btn" title="重做">
          <Redo2 size={18} />
        </button>
      </div>
      <div className="toolbar-divider" />
      <button
        className={`toolbar-btn run-btn ${isRunning ? 'running' : ''}`}
        title="執行工作流程"
        onClick={startExecution}
        disabled={isRunning}
      >
        {isRunning ? <Loader2 size={18} className="spinner" /> : <PlayCircle size={18} />}
        <span>{isRunning ? '執行中...' : '執行'}</span>
      </button>
      {hasResults && (
        <button
          className="toolbar-btn clear-btn"
          title="清除執行結果"
          onClick={clearExecution}
        >
          <RotateCcw size={16} />
          <span>清除結果</span>
        </button>
      )}
    </div>
  );
}
