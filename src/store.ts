import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FamilyMember } from './types';
import { getLayoutedElements } from './utils/layout';
import {
  createFamilyEdge,
  createPartnerEdge,
  normalizeEdge,
} from './utils/edgeStyles';
import { syncAllEdgeHandles, syncEdgeHandles } from './utils/syncEdgeHandles';
import {
  createRelationEdge,
  edgeAlreadyExists,
  type RelationType,
} from './utils/relationships';
import { 
  applyEdgeChanges, 
  applyNodeChanges,
  type Connection, 
  type Edge, 
  type EdgeChange, 
  type Node, 
  type NodeChange,
} from '@xyflow/react';

interface TreeStore {
  nodes: Node[];
  edges: Edge[];
  members: FamilyMember[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  connectMembers: (connection: Connection, relationType: RelationType) => boolean;
  addMember: (member: FamilyMember, relationship?: { type: string, targetId: string }) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  importTreeData: (data: { nodes: Node[], edges: Edge[], members: FamilyMember[] }) => void;
  layoutNodes: (direction?: 'TB' | 'LR') => void;
  layoutDirection: 'TB' | 'LR';
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const initialMembers: FamilyMember[] = [
  {
    id: '1',
    fullName: 'John Doe',
    birthDate: '1950-01-01',
    biography: 'The patriarch of the family.',
  }
];

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'familyMember',
    data: { label: 'John Doe', fullName: 'John Doe', id: '1', birthDate: '1950-01-01', biography: 'The patriarch of the family.' },
    position: { x: 250, y: 50 },
  }
];

export const useTreeStore = create<TreeStore>()(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      edges: [],
      members: initialMembers,
      darkMode: false,
      layoutDirection: 'TB' as const,

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      connectMembers: (connection, relationType) => {
        const { edges, nodes } = get();
        const newEdge = createRelationEdge(
          relationType,
          connection.source,
          connection.target,
          edges,
          {
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
          },
        );

        if (!newEdge || edgeAlreadyExists(newEdge, edges)) {
          return false;
        }

        set({ edges: [...edges, syncEdgeHandles(normalizeEdge(newEdge), nodes)] });
        return true;
      },

      addMember: (member, relationship) => {
        const { nodes, edges, members } = get();
        
        let position = { x: Math.random() * 400, y: Math.random() * 400 };
        
        if (relationship) {
          const targetNode = nodes.find(n => n.id === relationship.targetId);
          if (targetNode) {
            switch (relationship.type) {
              case 'child':
                position = { x: targetNode.position.x, y: targetNode.position.y + 200 };
                break;
              case 'parent':
                position = { x: targetNode.position.x, y: targetNode.position.y - 200 };
                break;
              case 'partner':
                position = { x: targetNode.position.x + 300, y: targetNode.position.y };
                break;
              case 'sibling':
                position = { x: targetNode.position.x - 300, y: targetNode.position.y };
                break;
            }
          }
        }

        const newNode: Node = {
          id: member.id,
          type: 'familyMember',
          data: { label: member.fullName, ...member },
          position,
        };

        const newEdges = [...edges];
        if (relationship) {
          const edgeId = `e-${relationship.targetId}-${member.id}`;
          
          let source = relationship.targetId;
          let target = member.id;
          
          if (relationship.type === 'parent') {
            source = member.id;
            target = relationship.targetId;
          }

          // If it's a sibling, we try to connect to the same parent as the target
          if (relationship.type === 'sibling') {
            const targetParentEdge = edges.find(e => e.target === relationship.targetId && e.label !== 'partner');
            if (targetParentEdge) {
              source = targetParentEdge.source;
            }
          }

          const label = relationship.type === 'sibling' ? 'child' : relationship.type;
          const newEdge = relationship.type === 'partner'
            ? createPartnerEdge(edgeId, source, target)
            : createFamilyEdge(edgeId, source, target, label);
          newEdges.push(newEdge);
        }

        set({
          members: [...members, member],
          nodes: [...nodes, newNode],
          edges: syncAllEdgeHandles(newEdges.map(normalizeEdge), [...nodes, newNode]),
        });
      },

      updateMember: (id, updates) => {
        const { members, nodes } = get();
        const updatedMembers = members.map(m => m.id === id ? { ...m, ...updates } : m);
        const updatedNodes = nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n);
        
        set({
          members: updatedMembers,
          nodes: updatedNodes,
        });
      },

      importTreeData: (data) => {
        set({
          nodes: data.nodes,
          edges: syncAllEdgeHandles(data.edges.map(normalizeEdge), data.nodes),
          members: data.members,
        });
      },

      layoutNodes: () => {
        const { nodes, edges } = get();
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
        set({
          nodes: layoutedNodes,
          edges: layoutedEdges,
        });
      },

      toggleDarkMode: () => {
        set({ darkMode: !get().darkMode });
      },
    }),
    {
      name: 'family-tree-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          state.edges = syncAllEdgeHandles(
            (state.edges ?? []).map(normalizeEdge),
            state.nodes ?? [],
          );
        } catch (error) {
          console.error('Failed to restore saved family tree edges:', error);
          state.edges = [];
        }
      },
    }
  )
);
