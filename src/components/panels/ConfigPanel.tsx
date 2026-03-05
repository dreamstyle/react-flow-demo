import { X } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { nodeRegistry } from '../../utils/nodeRegistry';

export default function ConfigPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData } = useWorkflowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const nodeConfig = nodeRegistry.find((n) => n.type === selectedNode.type);
  const data = selectedNode.data as Record<string, unknown>;
  const config = (data.config || {}) as Record<string, unknown>;

  const updateConfig = (key: string, value: unknown) => {
    updateNodeData(selectedNode.id, {
      config: { ...config, [key]: value },
    });
  };

  const renderConfigFields = () => {
    switch (selectedNode.type) {
      case 'startNode':
        return (
          <div className="config-section">
            <label className="config-field-label">輸入變數</label>
            <p className="config-hint">定義工作流程的輸入參數</p>
            <textarea
              className="config-textarea"
              placeholder="每行一個變數名稱"
              value={((config.input_variables as string[]) || []).join('\n')}
              onChange={(e) =>
                updateConfig(
                  'input_variables',
                  e.target.value.split('\n').filter(Boolean)
                )
              }
            />
          </div>
        );

      case 'endNode':
        return (
          <div className="config-section">
            <label className="config-field-label">輸出格式</label>
            <select
              className="config-select"
              value={(config.output_type as string) || 'text'}
              onChange={(e) => updateConfig('output_type', e.target.value)}
            >
              <option value="text">純文字</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        );

      case 'llmNode':
        return (
          <>
            <div className="config-section">
              <label className="config-field-label">模型</label>
              <select
                className="config-select"
                value={(config.model as string) || 'gpt-4'}
                onChange={(e) => updateConfig('model', e.target.value)}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
              </select>
            </div>
            <div className="config-section">
              <label className="config-field-label">系統提示詞</label>
              <textarea
                className="config-textarea"
                placeholder="輸入系統提示詞..."
                rows={4}
                value={(config.system_prompt as string) || ''}
                onChange={(e) => updateConfig('system_prompt', e.target.value)}
              />
            </div>
            <div className="config-section">
              <label className="config-field-label">
                溫度: {String(config.temperature ?? 0.7)}
              </label>
              <input
                type="range"
                className="config-range"
                min="0"
                max="2"
                step="0.1"
                value={(config.temperature as number) ?? 0.7}
                onChange={(e) =>
                  updateConfig('temperature', parseFloat(e.target.value))
                }
              />
            </div>
            <div className="config-section">
              <label className="config-field-label">最大 Tokens</label>
              <input
                type="number"
                className="config-input"
                value={(config.max_tokens as number) || 2048}
                onChange={(e) =>
                  updateConfig('max_tokens', parseInt(e.target.value))
                }
              />
            </div>
          </>
        );

      case 'knowledgeNode':
        return (
          <>
            <div className="config-section">
              <label className="config-field-label">知識庫名稱</label>
              <input
                type="text"
                className="config-input"
                placeholder="輸入知識庫名稱..."
                value={(config.knowledge_base as string) || ''}
                onChange={(e) => updateConfig('knowledge_base', e.target.value)}
              />
            </div>
            <div className="config-section">
              <label className="config-field-label">Top K: {String(config.top_k ?? 3)}</label>
              <input
                type="range"
                className="config-range"
                min="1"
                max="10"
                step="1"
                value={(config.top_k as number) ?? 3}
                onChange={(e) =>
                  updateConfig('top_k', parseInt(e.target.value))
                }
              />
            </div>
            <div className="config-section">
              <label className="config-field-label">
                分數閾值: {String(config.score_threshold ?? 0.5)}
              </label>
              <input
                type="range"
                className="config-range"
                min="0"
                max="1"
                step="0.05"
                value={(config.score_threshold as number) ?? 0.5}
                onChange={(e) =>
                  updateConfig('score_threshold', parseFloat(e.target.value))
                }
              />
            </div>
          </>
        );

      case 'codeNode':
        return (
          <>
            <div className="config-section">
              <label className="config-field-label">程式語言</label>
              <select
                className="config-select"
                value={(config.language as string) || 'python'}
                onChange={(e) => updateConfig('language', e.target.value)}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <div className="config-section">
              <label className="config-field-label">程式碼</label>
              <textarea
                className="config-textarea code"
                rows={8}
                value={(config.code as string) || ''}
                onChange={(e) => updateConfig('code', e.target.value)}
              />
            </div>
          </>
        );

      case 'ifElseNode':
        return (
          <div className="config-section">
            <label className="config-field-label">條件設定</label>
            <p className="config-hint">
              當條件為 True 時走上方分支，否則走下方分支
            </p>
            {((config.conditions as Array<{ variable: string; operator: string; value: string }>) || []).map(
              (cond, idx) => (
                <div key={idx} className="condition-row">
                  <input
                    type="text"
                    className="config-input"
                    placeholder="變數"
                    value={cond.variable}
                    onChange={(e) => {
                      const conditions = [
                        ...((config.conditions as Array<{ variable: string; operator: string; value: string }>) || []),
                      ];
                      conditions[idx] = { ...conditions[idx], variable: e.target.value };
                      updateConfig('conditions', conditions);
                    }}
                  />
                  <select
                    className="config-select"
                    value={cond.operator}
                    onChange={(e) => {
                      const conditions = [
                        ...((config.conditions as Array<{ variable: string; operator: string; value: string }>) || []),
                      ];
                      conditions[idx] = { ...conditions[idx], operator: e.target.value };
                      updateConfig('conditions', conditions);
                    }}
                  >
                    <option value="equals">等於</option>
                    <option value="not_equals">不等於</option>
                    <option value="contains">包含</option>
                    <option value="greater_than">大於</option>
                    <option value="less_than">小於</option>
                    <option value="is_empty">為空</option>
                    <option value="is_not_empty">不為空</option>
                  </select>
                  <input
                    type="text"
                    className="config-input"
                    placeholder="值"
                    value={cond.value}
                    onChange={(e) => {
                      const conditions = [
                        ...((config.conditions as Array<{ variable: string; operator: string; value: string }>) || []),
                      ];
                      conditions[idx] = { ...conditions[idx], value: e.target.value };
                      updateConfig('conditions', conditions);
                    }}
                  />
                </div>
              )
            )}
            <button
              className="config-add-btn"
              onClick={() =>
                updateConfig('conditions', [
                  ...((config.conditions as unknown[]) || []),
                  { variable: '', operator: 'equals', value: '' },
                ])
              }
            >
              + 新增條件
            </button>
          </div>
        );

      case 'templateNode':
        return (
          <div className="config-section">
            <label className="config-field-label">模板內容</label>
            <p className="config-hint">使用 {'{{variable}}'} 語法引用變數</p>
            <textarea
              className="config-textarea"
              rows={6}
              placeholder="輸入模板內容..."
              value={(config.template as string) || ''}
              onChange={(e) => updateConfig('template', e.target.value)}
            />
          </div>
        );

      case 'httpNode':
        return (
          <>
            <div className="config-section">
              <label className="config-field-label">HTTP 方法</label>
              <select
                className="config-select"
                value={(config.method as string) || 'GET'}
                onChange={(e) => updateConfig('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div className="config-section">
              <label className="config-field-label">URL</label>
              <input
                type="text"
                className="config-input"
                placeholder="https://api.example.com/endpoint"
                value={(config.url as string) || ''}
                onChange={(e) => updateConfig('url', e.target.value)}
              />
            </div>
            <div className="config-section">
              <label className="config-field-label">請求內容</label>
              <textarea
                className="config-textarea code"
                rows={4}
                placeholder='{"key": "value"}'
                value={(config.body as string) || ''}
                onChange={(e) => updateConfig('body', e.target.value)}
              />
            </div>
          </>
        );

      case 'variableNode':
        return (
          <div className="config-section">
            <label className="config-field-label">變數映射</label>
            <p className="config-hint">將多個上游節點的輸出聚合為一個物件</p>
            <textarea
              className="config-textarea"
              rows={4}
              placeholder="每行一個: output_name = node_id.variable"
              value={((config.variables as string[]) || []).join('\n')}
              onChange={(e) =>
                updateConfig(
                  'variables',
                  e.target.value.split('\n').filter(Boolean)
                )
              }
            />
          </div>
        );

      default:
        return <p className="config-hint">此節點沒有可設定的屬性</p>;
    }
  };

  return (
    <div className="config-panel">
      <div className="config-panel-header">
        <div className="config-panel-title">
          <div
            className="config-panel-icon"
            style={{
              backgroundColor: `${(data.color as string) || '#666'}15`,
              color: (data.color as string) || '#666',
            }}
          >
            {nodeConfig?.label || '節點'}
          </div>
          <span>{(data.label as string) || '節點設定'}</span>
        </div>
        <button
          className="config-panel-close"
          onClick={() => setSelectedNodeId(null)}
        >
          <X size={18} />
        </button>
      </div>

      <div className="config-panel-body">
        <div className="config-section">
          <label className="config-field-label">節點名稱</label>
          <input
            type="text"
            className="config-input"
            value={(data.label as string) || ''}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { label: e.target.value })
            }
          />
        </div>

        <div className="config-section">
          <label className="config-field-label">說明</label>
          <input
            type="text"
            className="config-input"
            placeholder="為此節點添加說明..."
            value={(data.description as string) || ''}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { description: e.target.value })
            }
          />
        </div>

        <div className="config-divider" />

        {renderConfigFields()}
      </div>
    </div>
  );
}
