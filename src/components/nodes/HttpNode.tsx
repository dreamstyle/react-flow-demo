import { memo } from 'react';
import BaseNode from './BaseNode';

function HttpNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  return (
    <BaseNode id={id} data={data} selected={selected}>
      <div className="node-config-preview">
        <span className="config-label">方法</span>
        <span className="config-value">{(data.config?.method as string) || 'GET'}</span>
      </div>
      <div className="node-config-preview">
        <span className="config-label">URL</span>
        <span className="config-value url-value">{(data.config?.url as string) || '未設定'}</span>
      </div>
    </BaseNode>
  );
}

export default memo(HttpNode);
