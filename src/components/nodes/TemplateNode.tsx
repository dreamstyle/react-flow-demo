import { memo } from 'react';
import BaseNode from './BaseNode';

function TemplateNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  return (
    <BaseNode id={id} data={data} selected={selected}>
      <div className="node-config-preview">
        <span className="config-label">模板</span>
        <span className="config-value">
          {(data.config?.template as string) ? '已設定' : '未設定'}
        </span>
      </div>
    </BaseNode>
  );
}

export default memo(TemplateNode);
