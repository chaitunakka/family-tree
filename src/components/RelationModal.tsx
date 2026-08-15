import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { FamilyMember } from '../types';

interface RelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: FamilyMember, relationship: { type: string, targetId: string }) => void;
  targetMemberId: string | null;
  targetMemberName: string;
}

const RelationModal: React.FC<RelationModalProps> = ({ isOpen, onClose, onAdd, targetMemberId, targetMemberName }) => {
  const [fullName, setFullName] = useState('');
  const [relationType, setRelationType] = useState('child');
  const [birthDate, setBirthDate] = useState('');
  const [biography, setBiography] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !targetMemberId) return;

    const newMember: FamilyMember = {
      id: Math.random().toString(36).substr(2, 9),
      fullName,
      birthDate,
      biography,
    };

    onAdd(newMember, { type: relationType, targetId: targetMemberId });
    setFullName('');
    setBirthDate('');
    setBiography('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Relation to {targetMemberName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
            >
              <option value="child">Child</option>
              <option value="parent">Parent</option>
              <option value="partner">Partner</option>
              <option value="sibling">Sibling</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Birth Date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Biography</label>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white h-24 resize-none"
              placeholder="A short story about them..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/30"
          >
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
};

export default RelationModal;
