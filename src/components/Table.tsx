import React from 'react';

interface TableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ headers, children, footer }) => {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {headers.map((header, index) => (
                <th key={index} className="px-8 py-5">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Table;
