import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, Plus, Edit2, Flower2 } from 'lucide-react';
import type { FamilyMember } from '../types';
import { formatLifespan, isDeceased } from '../utils/formatDates';

type FamilyMemberNodeData = FamilyMember & {
  onAddRelation?: (id: string) => void;
  onEdit?: (id: string) => void;
};

const FamilyMemberNode = ({ data }: { data: FamilyMemberNodeData }) => {
  const deceased = isDeceased(data.deathDate);
  const lifespan = formatLifespan(data.birthDate, data.deathDate);

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-xl min-w-[200px] transition-all relative ${
        deceased
          ? 'bg-slate-50 dark:bg-slate-900/80 border-2 border-dashed border-slate-300 dark:border-slate-600 opacity-90 hover:border-slate-400 dark:hover:border-slate-500'
          : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400'
      }`}
    >
      {deceased && (
        <div
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-sm"
          title="Deceased"
        >
          <Flower2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        </div>
      )}

      <Handle type="target" position={Position.Top} id="top" className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3 bg-blue-500" />

      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-pink-500 !top-1/2 -translate-y-1/2" />
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-pink-500 !top-1/2 -translate-y-1/2" />

      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 ${
            deceased ? 'opacity-80' : ''
          }`}
        >
          {data.photo ? (
            <img
              src={data.photo}
              alt={data.fullName}
              className={`w-full h-full object-cover ${deceased ? 'grayscale' : ''}`}
            />
          ) : (
            <User className={`w-6 h-6 ${deceased ? 'text-slate-400 grayscale' : 'text-slate-400'}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={`text-sm font-bold truncate ${
              deceased ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'
            }`}
          >
            {data.fullName}
          </div>
          {lifespan && (
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{lifespan}</div>
          )}
        </div>
      </div>

      {data.biography && (
        <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic border-t border-slate-100 dark:border-slate-800 pt-2">
          {data.biography}
        </div>
      )}

      <div className="mt-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onAddRelation?.(data.id);
          }}
          className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <Plus className="w-3 h-3" /> Add Relation
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit?.(data.id);
          }}
          className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
      </div>
    </div>
  );
};

export default memo(FamilyMemberNode);
