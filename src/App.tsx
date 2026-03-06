import { ReactFlowProvider } from '@xyflow/react';
import { BookOpen, Trash2 } from 'lucide-react';
import WorkflowCanvas from './components/WorkflowCanvas';
import { useWorkflowStore } from './store/workflowStore';
import './App.css';

function App() {
  const { resetToExample, clearCanvas } = useWorkflowStore();

  const handleReset = () => {
    if (confirm('確定要重設為範例流程嗎？目前的畫布內容將會被覆蓋。')) {
      resetToExample();
    }
  };

  const handleClear = () => {
    if (confirm('確定要清空畫布嗎？將只保留開始節點。')) {
      clearCanvas();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">W</div>
          <h1 className="app-title">Workflow Builder</h1>
        </div>
        <div className="app-header-right">
          <button className="header-btn secondary" onClick={handleReset} title="重設為範例流程">
            <BookOpen size={15} />
            <span>範例</span>
          </button>
          <button className="header-btn secondary" onClick={handleClear} title="清空畫布">
            <Trash2 size={15} />
            <span>清空</span>
          </button>
          <button className="header-btn primary">發布</button>
        </div>
      </header>
      <ReactFlowProvider>
        <WorkflowCanvas />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
