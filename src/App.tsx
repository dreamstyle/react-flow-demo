import { ReactFlowProvider } from '@xyflow/react';
import WorkflowCanvas from './components/WorkflowCanvas';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">W</div>
          <h1 className="app-title">Workflow Builder</h1>
        </div>
        <div className="app-header-right">
          <button className="header-btn secondary">儲存草稿</button>
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
