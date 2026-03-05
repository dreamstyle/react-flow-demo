import { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { ExecutionLog } from '../../types/workflow';

function LogItem({ log }: { log: ExecutionLog }) {
  const [expanded, setExpanded] = useState(false);

  const statusIconMap: Record<string, React.ReactNode> = {
    success: <CheckCircle2 size={14} className="exec-success-icon" />,
    error: <XCircle size={14} className="exec-error-icon" />,
    skipped: <MinusCircle size={14} className="exec-skipped-icon" />,
  };
  const statusIcon = statusIconMap[log.status] || null;

  const statusLabelMap: Record<string, string> = {
    success: '完成',
    error: '錯誤',
    skipped: '已跳過',
  };
  const statusLabel = statusLabelMap[log.status] || log.status;

  const hasDetails = log.output || log.error;

  return (
    <div className={`execution-log-item ${log.status}`}>
      <div
        className="execution-log-header"
        onClick={() => hasDetails && setExpanded(!expanded)}
        style={{ cursor: hasDetails ? 'pointer' : 'default' }}
      >
        <div className="execution-log-left">
          {hasDetails && (
            expanded
              ? <ChevronDown size={12} className="execution-log-chevron" />
              : <ChevronRight size={12} className="execution-log-chevron" />
          )}
          {statusIcon}
          <span className="execution-log-name">{log.nodeName}</span>
        </div>
        <div className="execution-log-right">
          {log.duration != null && (
            <span className="execution-log-duration">
              <Clock size={10} />
              {(log.duration / 1000).toFixed(1)}s
            </span>
          )}
          <span className={`execution-log-status ${log.status}`}>{statusLabel}</span>
        </div>
      </div>
      {expanded && log.output && (
        <div className="execution-log-output">
          <pre>{JSON.stringify(log.output, null, 2)}</pre>
        </div>
      )}
      {expanded && log.error && (
        <div className="execution-log-error">
          {log.error}
        </div>
      )}
    </div>
  );
}

export default function ExecutionResultPanel() {
  const { execution, clearExecution } = useWorkflowStore();

  if (!execution) return null;

  const totalDuration =
    execution.startTime && execution.endTime
      ? ((execution.endTime - execution.startTime) / 1000).toFixed(1)
      : null;

  const successCount = execution.logs.filter((l) => l.status === 'success').length;
  const errorCount = execution.logs.filter((l) => l.status === 'error').length;
  const skippedCount = execution.logs.filter((l) => l.status === 'skipped').length;

  const hasError = errorCount > 0;

  return (
    <div className="execution-panel">
      <div className="execution-panel-header">
        <div className="execution-panel-title">
          <span className={`execution-panel-badge ${hasError ? 'error' : 'success'}`}>
            {hasError ? '執行失敗' : '執行完成'}
          </span>
          {totalDuration && (
            <span className="execution-panel-duration">
              <Clock size={12} />
              {totalDuration}s
            </span>
          )}
        </div>
        <button className="config-panel-close" onClick={clearExecution}>
          <X size={18} />
        </button>
      </div>

      <div className="execution-panel-summary">
        <div className="execution-summary-item success">
          <CheckCircle2 size={12} />
          <span>{successCount} 成功</span>
        </div>
        {errorCount > 0 && (
          <div className="execution-summary-item error">
            <XCircle size={12} />
            <span>{errorCount} 錯誤</span>
          </div>
        )}
        {skippedCount > 0 && (
          <div className="execution-summary-item skipped">
            <MinusCircle size={12} />
            <span>{skippedCount} 跳過</span>
          </div>
        )}
      </div>

      <div className="execution-panel-body">
        {execution.logs.map((log, index) => (
          <LogItem key={`${log.nodeId}-${index}`} log={log} />
        ))}
      </div>
    </div>
  );
}
