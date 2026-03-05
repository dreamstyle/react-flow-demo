import { memo } from 'react';
import BaseNode from './BaseNode';

function KnowledgeNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  return (
    <BaseNode id={id} data={data} selected={selected}>
      <div className="node-config-preview">
        <span className="config-label">知識庫</span>
        <span className="config-value">{(data.config?.knowledge_base as string) || '未設定'}</span>
      </div>
      <div className="node-config-preview">
        <span className="config-label">Top K</span>
        <span className="config-value">{data.config?.top_k ?? 3}</span>
      </div>
    </BaseNode>
  );
}

export default memo(KnowledgeNode);
