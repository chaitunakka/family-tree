import React, { useCallback, useState, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  Panel,
  type Connection,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTreeStore } from './store';
import FamilyMemberNode from './components/FamilyMemberNode';
import RelationModal from './components/RelationModal';
import ConnectRelationModal from './components/ConnectRelationModal';
import EditMemberModal from './components/EditMemberModal';
import { inferDefaultRelationType, type RelationType } from './utils/relationships';
import { Moon, Sun, Download, Upload, Layout } from 'lucide-react';

const nodeTypes = {
  familyMember: FamilyMemberNode,
};

function App() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    connectMembers,
    addMember,
    updateMember,
    importTreeData,
    layoutNodes,
    darkMode,
    toggleDarkMode,
    members
  } = useTreeStore();

  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

  const selectedMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberId) || null;
  }, [selectedMemberId, members]);

  const connectionSourceMember = useMemo(() => {
    if (!pendingConnection) return null;
    return members.find(m => m.id === pendingConnection.source) || null;
  }, [pendingConnection, members]);

  const connectionTargetMember = useMemo(() => {
    if (!pendingConnection) return null;
    return members.find(m => m.id === pendingConnection.target) || null;
  }, [pendingConnection, members]);

  const defaultConnectionRelation = useMemo(() => {
    if (!pendingConnection) return 'child' as RelationType;
    return inferDefaultRelationType(pendingConnection);
  }, [pendingConnection]);

  const handleAddRelation = useCallback((id: string) => {
    setSelectedMemberId(id);
    setIsRelationModalOpen(true);
  }, []);

  const handleEdit = useCallback((id: string) => {
    setSelectedMemberId(id);
    setIsEditModalOpen(true);
  }, []);

  const handleConnect = useCallback((connection: Connection) => {
    if (connection.source === connection.target) return;
    setPendingConnection(connection);
    setIsConnectModalOpen(true);
  }, []);

  const handleCancelConnect = useCallback(() => {
    setPendingConnection(null);
    setIsConnectModalOpen(false);
  }, []);

  const handleConfirmConnect = useCallback((relationType: RelationType) => {
    if (!pendingConnection) return;

    const success = connectMembers(pendingConnection, relationType);
    if (!success) {
      alert('Could not create this relationship. It may already exist, or a shared parent is required for siblings.');
    }

    setPendingConnection(null);
    setIsConnectModalOpen(false);
  }, [pendingConnection, connectMembers]);

  const isValidConnection = useCallback((connection: Edge | Connection) => {
    return connection.source !== connection.target;
  }, []);

  // Pass handleAddRelation and handleEdit to nodes
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onAddRelation: handleAddRelation,
        onEdit: handleEdit,
      },
    }));
  }, [nodes, handleAddRelation, handleEdit]);

  const exportToJson = () => {
    const data = {
      nodes,
      edges,
      members,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'family-tree.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.nodes && data.edges && data.members) {
          importTreeData(data);
        } else {
          alert('Invalid file format. Please upload a valid family-tree.json file.');
        }
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        alert('Failed to read the file. Make sure it is a valid JSON.');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className={`w-full h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        fitView
        colorMode={darkMode ? 'dark' : 'light'}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(n) => {
            const deceased = Boolean(n.data?.deathDate);
            if (deceased) return darkMode ? '#334155' : '#cbd5e1';
            return darkMode ? '#1e293b' : '#e2e8f0';
          }}
          maskColor={darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'}
        />
        
        <Panel position="top-right" className="flex flex-col gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-3 bg-white dark:bg-slate-900 shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => layoutNodes()}
            className="p-3 bg-white dark:bg-slate-900 shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Auto Arrange"
          >
            <Layout className="w-5 h-5" />
          </button>
          
          <button
            onClick={exportToJson}
            className="p-3 bg-white dark:bg-slate-900 shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Export to JSON"
          >
            <Download className="w-5 h-5" />
          </button>

          <label className="p-3 bg-white dark:bg-slate-900 shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer" title="Import from JSON">
            <Upload className="w-5 h-5" />
            <input type="file" accept=".json" onChange={importFromJson} className="hidden" />
          </label>
        </Panel>

        <Panel position="top-left">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Family Tree
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase mt-1">
              Visualize your roots
            </p>
          </div>
        </Panel>
      </ReactFlow>

      <ConnectRelationModal
        isOpen={isConnectModalOpen}
        onClose={handleCancelConnect}
        onConnect={handleConfirmConnect}
        sourceMember={connectionSourceMember}
        targetMember={connectionTargetMember}
        defaultRelationType={defaultConnectionRelation}
      />

      <RelationModal
        isOpen={isRelationModalOpen}
        onClose={() => setIsRelationModalOpen(false)}
        onAdd={addMember}
        targetMemberId={selectedMemberId}
        targetMemberName={selectedMember?.fullName || ''}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={updateMember}
        member={selectedMember}
      />
    </div>
  );
}

export default App;
