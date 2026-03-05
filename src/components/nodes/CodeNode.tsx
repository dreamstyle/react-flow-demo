import { memo } from 'react';
import BaseNode from './BaseNode';

function CodeNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  return (
    <BaseNode id={id} data={data} selected={selected}>
      <div className="node-config-preview">
        <span className="config-label">語言</span>
        <span className="config-value">{(data.config?.language as string) || 'python'}</span>
      </div>
      <div className="node-code-preview">
        <code>{((data.config?.code as string) || '').slice(0, 60)}...</code>
      </div>
    </BaseNode>
  );
}

export default memo(CodeNode);
