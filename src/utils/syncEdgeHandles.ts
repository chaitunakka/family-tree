import type { Edge, Node } from '@xyflow/react';
import { isPartnerEdge, PARTNER_EDGE_STYLE, FAMILY_EDGE_STYLE } from './edgeStyles';

const NODE_W = 250;

export function orientPartnerEdge(edge: Edge, nodes: Node[]): Edge {
  const sourceNode = nodes.find((node) => node.id === edge.source);
  const targetNode = nodes.find((node) => node.id === edge.target);

  if (!sourceNode || !targetNode) {
    return {
      ...edge,
      sourceHandle: 'right',
      targetHandle: 'left',
      type: 'smoothstep',
      style: PARTNER_EDGE_STYLE,
    };
  }

  const sourceX = sourceNode.position?.x ?? 0;
  const targetX = targetNode.position?.x ?? 0;
  const sourceCenterX = sourceX + NODE_W / 2;
  const targetCenterX = targetX + NODE_W / 2;
  const leftId = sourceCenterX <= targetCenterX ? edge.source : edge.target;
  const rightId = sourceCenterX <= targetCenterX ? edge.target : edge.source;

  return {
    ...edge,
    source: leftId,
    target: rightId,
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'smoothstep',
    style: PARTNER_EDGE_STYLE,
  };
}

export function orientFamilyEdge(edge: Edge, nodes: Node[]): Edge {
  const sourceNode = nodes.find((node) => node.id === edge.source);
  const targetNode = nodes.find((node) => node.id === edge.target);

  let source = edge.source;
  let target = edge.target;

  if (sourceNode && targetNode) {
    const sourceY = sourceNode.position?.y ?? 0;
    const targetY = targetNode.position?.y ?? 0;
    if (sourceY > targetY) {
      source = edge.target;
      target = edge.source;
    }
  }

  return {
    ...edge,
    source,
    target,
    sourceHandle: 'bottom',
    targetHandle: 'top',
    type: 'default',
    style: FAMILY_EDGE_STYLE,
  };
}

export function syncEdgeHandles(edge: Edge, nodes: Node[]): Edge {
  if (isPartnerEdge(edge)) {
    return orientPartnerEdge(edge, nodes);
  }
  return orientFamilyEdge(edge, nodes);
}

export function syncAllEdgeHandles(edges: Edge[] = [], nodes: Node[] = []): Edge[] {
  if (!Array.isArray(edges) || !Array.isArray(nodes)) return [];
  return edges.map((edge) => syncEdgeHandles(edge, nodes));
}
