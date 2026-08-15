import { useEffect, useState, type FC, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { FamilyMember } from '../types';
import type { RelationType } from '../utils/relationships';

interface ConnectRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (relationType: RelationType) => void;
  sourceMember: FamilyMember | null;
  targetMember: FamilyMember | null;
  defaultRelationType?: RelationType;
}

const ConnectRelationModal: FC<ConnectRelationModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  sourceMember,
  targetMember,
  defaultRelationType = 'child',
}) => {
  const [relationType, setRelationType] = useState<RelationType>(defaultRelationType);

  useEffect(() => {
    if (isOpen) {
      setRelationType(defaultRelationType);
    }
  }, [isOpen, defaultRelationType]);

  if (!isOpen || !sourceMember || !targetMember) return null;

  const sourceName = sourceMember.fullName;
  const targetName = targetMember.fullName;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onConnect(relationType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connect Members</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Link <span className="font-semibold text-slate-900 dark:text-white">{sourceName}</span>
          {' '}to{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{targetName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Relationship
            </label>
            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value as RelationType)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
            >
              <option value="child">{targetName} is child of {sourceName}</option>
              <option value="parent">{targetName} is parent of {sourceName}</option>
              <option value="partner">{targetName} is partner of {sourceName}</option>
              <option value="sibling">{targetName} is sibling of {sourceName}</option>
            </select>
          </div>

          {relationType === 'sibling' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One member must already have a parent in the tree. The other will be linked as a child of that parent.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/30"
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectRelationModal;
