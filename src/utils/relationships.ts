import type { Connection, Edge } from '@xyflow/react';
import { createFamilyEdge, createPartnerEdge, isPartnerEdge, isPartnerConnection } from './edgeStyles';

export type RelationType = 'child' | 'parent' | 'partner' | 'sibling';

type ConnectionHandles = Pick<Connection, 'sourceHandle' | 'targetHandle'>;

export function inferDefaultRelationType(connection: Connection): RelationType {
  if (isPartnerConnection(connection)) return 'partner';
  return 'child';
}

export function createRelationEdge(
  relationType: RelationType,
  fromId: string,
  toId: string,
  existingEdges: Edge[],
  handles?: ConnectionHandles,
): Edge | null {
  switch (relationType) {
    case 'partner':
      return createPartnerEdge(
        `e-${fromId}-${toId}-partner`,
        fromId,
        toId,
        handles?.sourceHandle ?? 'right',
        handles?.targetHandle ?? 'left',
      );
    case 'child':
      return createFamilyEdge(`e-${fromId}-${toId}-child`, fromId, toId, 'child');
    case 'parent':
      return createFamilyEdge(`e-${toId}-${fromId}-parent`, toId, fromId, 'parent');
    case 'sibling': {
      const fromParent = existingEdges.find(
        (edge) => edge.target === fromId && !isPartnerEdge(edge),
      );
      const toParent = existingEdges.find(
        (edge) => edge.target === toId && !isPartnerEdge(edge),
      );
      const parentId = fromParent?.source ?? toParent?.source;
      if (!parentId) return null;

      const siblingId = fromParent ? toId : fromId;
      return createFamilyEdge(`e-${parentId}-${siblingId}-child`, parentId, siblingId, 'child');
    }
  }
}

export function edgeAlreadyExists(edge: Edge, existingEdges: Edge[]): boolean {
  return existingEdges.some(
    (existing) =>
      existing.id === edge.id ||
      (existing.source === edge.source &&
        existing.target === edge.target &&
        existing.label === edge.label),
  );
}
