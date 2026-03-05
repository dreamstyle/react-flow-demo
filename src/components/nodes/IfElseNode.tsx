import { memo } from 'react';
import BaseNode from './BaseNode';

function IfElseNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      sourceHandles={[
        { id: 'true', label: 'True' },
        { id: 'false', label: 'False' },
      ]}
    >
      <div className="node-config-preview">
        <span className="config-label">條件數</span>
        <span className="config-value">
          {(data.config?.conditions as unknown[])?.length || 0} 個條件
        </span>
      </div>
    </BaseNode>
  );
}

export default memo(IfElseNode);
