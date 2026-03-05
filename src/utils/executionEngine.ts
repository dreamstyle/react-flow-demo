import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData } from '../types/workflow';

export interface ExecutionCallbacks {
  onStart: () => void;
  onNodeStart: (nodeId: string) => void;
  onNodeComplete: (nodeId: string, output: Record<string, unknown>) => void;
  onNodeError: (nodeId: string, error: string) => void;
  onNodeSkipped: (nodeId: string) => void;
  onComplete: () => void;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): number {
  return 600 + Math.random() * 400;
}

/**
 * Kahn's algorithm for topological sort
 */
export function topologicalSort(nodes: Node[], edges: Edge[]): string[] | null {
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== nodes.length) return null; // cycle detected
  return sorted;
}

/**
 * Find nodes exclusively reachable through a specific branch of an ifElse node
 */
function findExclusiveBranchNodes(
  ifElseNodeId: string,
  unchosenHandleId: string,
  edges: Edge[],
  allNodeIds: Set<string>,
  chosenHandleId: string
): Set<string> {
  // Find direct targets of unchosen branch
  const unchosenTargets = edges
    .filter((e) => e.source === ifElseNodeId && e.sourceHandle === unchosenHandleId)
    .map((e) => e.target);

  // Find direct targets of chosen branch (these are definitely reachable)
  const chosenTargets = edges
    .filter((e) => e.source === ifElseNodeId && e.sourceHandle === chosenHandleId)
    .map((e) => e.target);

  // BFS from unchosen targets to find all downstream nodes
  const unchosenReachable = new Set<string>();
  const bfsQueue = [...unchosenTargets];
  while (bfsQueue.length > 0) {
    const nodeId = bfsQueue.shift()!;
    if (unchosenReachable.has(nodeId) || !allNodeIds.has(nodeId)) continue;
    unchosenReachable.add(nodeId);
    for (const edge of edges) {
      if (edge.source === nodeId) bfsQueue.push(edge.target);
    }
  }

  // BFS from chosen targets to find all nodes reachable from chosen branch
  const chosenReachable = new Set<string>();
  const chosenQueue = [...chosenTargets];
  while (chosenQueue.length > 0) {
    const nodeId = chosenQueue.shift()!;
    if (chosenReachable.has(nodeId) || !allNodeIds.has(nodeId)) continue;
    chosenReachable.add(nodeId);
    for (const edge of edges) {
      if (edge.source === nodeId) chosenQueue.push(edge.target);
    }
  }

  // Only skip nodes that are exclusively in the unchosen branch
  const exclusiveNodes = new Set<string>();
  for (const nodeId of unchosenReachable) {
    if (!chosenReachable.has(nodeId)) {
      exclusiveNodes.add(nodeId);
    }
  }

  return exclusiveNodes;
}

export function generateMockOutput(
  nodeType: string,
  data: WorkflowNodeData
): Record<string, unknown> {
  switch (nodeType) {
    case 'startNode':
      return {
        input: {
          query: '什麼是機器學習？',
          user_id: 'u_12345',
          timestamp: new Date().toISOString(),
        },
      };

    case 'llmNode':
      return {
        response:
          '機器學習是人工智慧的一個分支，它使計算機能夠從數據中學習並做出預測或決策，而無需明確編程。主要方法包括監督式學習、非監督式學習和強化學習。',
        tokens_used: 156,
        model: (data.config?.model as string) || 'gpt-4',
        finish_reason: 'stop',
      };

    case 'knowledgeNode':
      return {
        results: [
          {
            content: '機器學習（Machine Learning）是一種人工智慧技術，透過演算法讓電腦從資料中自動學習模式...',
            score: 0.92,
            source: 'ai_handbook.pdf',
          },
          {
            content: '深度學習是機器學習的子集，使用多層神經網路來模擬人腦的運作方式...',
            score: 0.87,
            source: 'dl_guide.pdf',
          },
        ],
        total_found: 2,
      };

    case 'codeNode':
      return {
        result: {
          processed: true,
          item_count: 42,
          status: 'completed',
        },
        execution_time: '0.23s',
        language: (data.config?.language as string) || 'python',
      };

    case 'ifElseNode':
      return {
        condition_result: Math.random() > 0.5,
        evaluated: 'score > 0.8',
      };

    case 'templateNode':
      return {
        rendered:
          '親愛的用戶，根據您的查詢「什麼是機器學習？」，以下是我們為您整理的回覆內容，希望對您有所幫助。',
      };

    case 'httpNode':
      return {
        status: 200,
        data: {
          success: true,
          message: 'OK',
          data: {
            id: 'resp_' + Math.random().toString(36).slice(2, 8),
            timestamp: new Date().toISOString(),
          },
        },
        headers: { 'content-type': 'application/json' },
      };

    case 'variableNode':
      return {
        aggregated: {
          llm_output: '機器學習是人工智慧的一個分支...',
          knowledge_score: 0.92,
          processed: true,
        },
      };

    case 'endNode':
      return {
        final_output:
          '根據分析結果，機器學習是人工智慧的重要分支，相關知識庫中找到 2 筆高度相關的資料，綜合評分為 0.92。',
        format: (data.config?.output_type as string) || 'text',
      };

    default:
      return { result: 'ok' };
  }
}

export async function executeWorkflow(
  nodes: Node[],
  edges: Edge[],
  callbacks: ExecutionCallbacks
): Promise<void> {
  // Validate: must have a start node
  const startNode = nodes.find(
    (n) => (n.data as unknown as WorkflowNodeData).type === 'start'
  );
  if (!startNode) {
    throw new Error('找不到開始節點');
  }

  // Topological sort
  const sorted = topologicalSort(nodes, edges);
  if (!sorted) {
    throw new Error('工作流程中存在循環，無法執行');
  }

  const allNodeIds = new Set(nodes.map((n) => n.id));
  const skippedNodes = new Set<string>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  callbacks.onStart();

  for (const nodeId of sorted) {
    if (skippedNodes.has(nodeId)) {
      callbacks.onNodeSkipped(nodeId);
      continue;
    }

    const node = nodeMap.get(nodeId)!;
    const data = node.data as unknown as WorkflowNodeData;

    callbacks.onNodeStart(nodeId);
    await delay(randomDelay());

    // 5% random error for non-start/end nodes
    if (data.type !== 'start' && data.type !== 'end' && Math.random() < 0.05) {
      callbacks.onNodeError(nodeId, '模擬錯誤：連接逾時');
      // Mark remaining nodes as skipped
      const nodeIndex = sorted.indexOf(nodeId);
      for (let i = nodeIndex + 1; i < sorted.length; i++) {
        if (!skippedNodes.has(sorted[i])) {
          callbacks.onNodeSkipped(sorted[i]);
        }
      }
      break;
    }

    const output = generateMockOutput(node.type!, data);
    callbacks.onNodeComplete(nodeId, output);

    // Handle ifElse branching
    if (data.type === 'ifElse') {
      const conditionResult = output.condition_result as boolean;
      const chosenHandle = conditionResult ? 'true' : 'false';
      const unchosenHandle = conditionResult ? 'false' : 'true';

      const toSkip = findExclusiveBranchNodes(
        nodeId,
        unchosenHandle,
        edges,
        allNodeIds,
        chosenHandle
      );
      for (const skipId of toSkip) {
        skippedNodes.add(skipId);
      }
    }
  }

  callbacks.onComplete();
}
