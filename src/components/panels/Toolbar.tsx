import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2, PlayCircle, Loader2, RotateCcw, BookOpen, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { startExecution, clearExecution, execution, undo, redo, canUndo, canRedo, resetToExample, clearCanvas } = useWorkflowStore();
  const isRunning = execution?.isRunning ?? false;
  const hasResults = execution !== null && !execution.isRunning;

  const handleReset = () => {
    if (confirm('確定要重設為範例流程嗎？目前的畫布內容將會被覆蓋。')) {
      resetToExample();
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    }
  };

  const handleClear = () => {
    if (confirm('確定要清空畫布嗎？將只保留開始節點。')) {
      clearCanvas();
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    }
  };

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
        <button className="toolbar-btn" title="復原" onClick={undo} disabled={!canUndo()}>
          <Undo2 size={18} />
        </button>
        <button className="toolbar-btn" title="重做" onClick={redo} disabled={!canRedo()}>
          <Redo2 size={18} />
        </button>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <button className="toolbar-btn reset-example-btn" title="重設為範例流程" onClick={handleReset}>
          <BookOpen size={16} />
          <span>範例</span>
        </button>
        <button className="toolbar-btn clear-canvas-btn" title="清空畫布" onClick={handleClear}>
          <Trash2 size={16} />
          <span>清空</span>
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
