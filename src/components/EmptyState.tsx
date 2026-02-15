import React from 'react';
import { LucideProps } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactElement<LucideProps>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500 w-full">
      <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
        {React.cloneElement(icon, { size: 40 })}
      </div>
      <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-sm font-medium text-slate-400 max-w-xs mb-8">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
