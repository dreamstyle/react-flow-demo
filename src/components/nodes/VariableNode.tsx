import { memo } from 'react';
import BaseNode from './BaseNode';

function VariableNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  return (
    <BaseNode id={id} data={data} selected={selected}>
      <div className="node-config-preview">
        <span className="config-label">變數數</span>
        <span className="config-value">
          {(data.config?.variables as unknown[])?.length || 0} 個變數
        </span>
      </div>
    </BaseNode>
  );
}

export default memo(VariableNode);
