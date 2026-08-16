import dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';
import { syncAllEdgeHandles } from './syncEdgeHandles';

const nodeWidth = 250;
const nodeHeight = 150;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 150,
    nodesep: 250,
    ranker: 'network-simplex',
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    if (edge.label === 'partner') {
      dagreGraph.setEdge(edge.source, edge.target, { weight: 1, minlen: 0 });
    } else {
      dagreGraph.setEdge(edge.source, edge.target, { weight: 10, minlen: 1 });
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    return {
      ...node,
      targetPosition,
      sourcePosition,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  edges.forEach((edge) => {
    if (edge.label === 'partner') {
      const sourceNode = layoutedNodes.find((n) => n.id === edge.source);
      const targetNode = layoutedNodes.find((n) => n.id === edge.target);
      if (sourceNode && targetNode) {
        if (isHorizontal) {
          const avgX = (sourceNode.position.x + targetNode.position.x) / 2;
          sourceNode.position.x = avgX;
          targetNode.position.x = avgX;

          if (Math.abs(sourceNode.position.y - targetNode.position.y) < 200) {
            if (sourceNode.position.y < targetNode.position.y) {
              targetNode.position.y = sourceNode.position.y + 200;
            } else {
              sourceNode.position.y = targetNode.position.y + 200;
            }
          }
        } else {
          const avgY = (sourceNode.position.y + targetNode.position.y) / 2;
          sourceNode.position.y = avgY;
          targetNode.position.y = avgY;

          if (Math.abs(sourceNode.position.x - targetNode.position.x) < 300) {
            if (sourceNode.position.x < targetNode.position.x) {
              targetNode.position.x = sourceNode.position.x + 300;
            } else {
              sourceNode.position.x = targetNode.position.x + 300;
            }
          }
        }
      }
    }
  });

  const layoutedEdges = syncAllEdgeHandles(edges, layoutedNodes);

  return { nodes: layoutedNodes, edges: layoutedEdges };
};
