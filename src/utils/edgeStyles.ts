import { MarkerType, type Connection, type Edge } from '@xyflow/react';

export const PARTNER_EDGE_COLOR = '#ec4899';
export const FAMILY_EDGE_COLOR = '#3b82f6';

export const PARTNER_EDGE_STYLE = {
  strokeWidth: 2,
  stroke: PARTNER_EDGE_COLOR,
  strokeDasharray: '6 4',
};

export const FAMILY_EDGE_STYLE = {
  strokeWidth: 2,
  stroke: FAMILY_EDGE_COLOR,
};

export function isPartnerEdge(edge: Pick<Edge, 'label'>): boolean {
  return edge.label === 'partner';
}

export function isPartnerConnection(connection: Connection): boolean {
  const handles = new Set([connection.sourceHandle, connection.targetHandle]);
  return handles.has('right') && handles.has('left');
}

export function normalizeEdge(edge: Edge): Edge {
  if (isPartnerEdge(edge)) {
    return {
      ...edge,
      type: 'smoothstep',
      animated: edge.animated ?? true,
      sourceHandle: edge.sourceHandle ?? 'right',
      targetHandle: edge.targetHandle ?? 'left',
      markerEnd: edge.markerEnd ?? { type: MarkerType.ArrowClosed },
      style: {
        ...PARTNER_EDGE_STYLE,
        ...edge.style,
        stroke: PARTNER_EDGE_COLOR,
        strokeDasharray: '6 4',
      },
    };
  }

  return {
    ...edge,
    type: edge.type ?? 'default',
    sourceHandle: edge.sourceHandle ?? 'bottom',
    targetHandle: edge.targetHandle ?? 'top',
    markerEnd: edge.markerEnd ?? { type: MarkerType.ArrowClosed },
    style: {
      ...FAMILY_EDGE_STYLE,
      ...edge.style,
      stroke: FAMILY_EDGE_COLOR,
    },
  };
}

export function createPartnerEdge(
  id: string,
  source: string,
  target: string,
  sourceHandle = 'right',
  targetHandle = 'left',
): Edge {
  return normalizeEdge({
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    label: 'partner',
    animated: true,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: PARTNER_EDGE_STYLE,
  });
}

export function createFamilyEdge(
  id: string,
  source: string,
  target: string,
  label: string,
): Edge {
  return normalizeEdge({
    id,
    source,
    target,
    sourceHandle: 'bottom',
    targetHandle: 'top',
    label,
    animated: true,
    type: 'default',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: FAMILY_EDGE_STYLE,
  });
}
