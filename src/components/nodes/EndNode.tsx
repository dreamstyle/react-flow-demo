import { memo } from 'react';
import BaseNode from './BaseNode';

function EndNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  return (
    <BaseNode id={id} data={data} selected={selected} hideSource>
      <div className="node-config-preview">
        <span className="config-label">輸出格式</span>
        <span className="config-value">{(data.config?.output_type as string) || 'text'}</span>
      </div>
    </BaseNode>
  );
}

export default memo(EndNode);
