import StartNode from './StartNode';
import EndNode from './EndNode';
import LLMNode from './LLMNode';
import KnowledgeNode from './KnowledgeNode';
import CodeNode from './CodeNode';
import IfElseNode from './IfElseNode';
import TemplateNode from './TemplateNode';
import HttpNode from './HttpNode';
import VariableNode from './VariableNode';

export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  llmNode: LLMNode,
  knowledgeNode: KnowledgeNode,
  codeNode: CodeNode,
  ifElseNode: IfElseNode,
  templateNode: TemplateNode,
  httpNode: HttpNode,
  variableNode: VariableNode,
};
