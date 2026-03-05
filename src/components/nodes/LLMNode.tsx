import { memo } from 'react';
import BaseNode from './BaseNode';

function LLMNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  return (
    <BaseNode id={id} data={data} selected={selected}>
      <div className="node-config-preview">
        <span className="config-label">模型</span>
        <span className="config-value">{(data.config?.model as string) || 'gpt-4'}</span>
      </div>
      <div className="node-config-preview">
        <span className="config-label">溫度</span>
        <span className="config-value">{data.config?.temperature ?? 0.7}</span>
      </div>
    </BaseNode>
  );
}

export default memo(LLMNode);
