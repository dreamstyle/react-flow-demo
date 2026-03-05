import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2, PlayCircle } from 'lucide-react';

export default function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

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
      <button className="toolbar-btn run-btn" title="執行工作流程">
        <PlayCircle size={18} />
        <span>執行</span>
      </button>
    </div>
  );
}
