import { memo } from 'react';
import BaseNode from './BaseNode';

function StartNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  return (
    <BaseNode id={id} data={data} selected={selected} hideTarget>
      <div className="node-config-preview">
        <span className="config-label">輸入變數</span>
        <span className="config-value">
          {(data.config?.input_variables as string[])?.length || 0} 個變數
        </span>
      </div>
    </BaseNode>
  );
}

export default memo(StartNode);
