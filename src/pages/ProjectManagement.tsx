
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project, ProjectStatus } from '@/types';
import { Search, Filter, ChevronRight, Plus, MapPin, CheckCircle2, MoreHorizontal } from 'lucide-react';

interface Props {
  projects: Project[];
}

const ProjectManagement: React.FC<Props> = ({ projects }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">프로젝트 관리</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">전체 프로젝트 상태 및 공정 확인</p>
        </div>
        <button 
          onClick={() => navigate('/projects/new')}
          className="flex items-center justify-center gap-2 px-6 py-4 sm:py-3 bg-indigo-600 text-white rounded-2xl sm:rounded-xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus size={18} /> 프로젝트 추가
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="프로젝트명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 sm:py-3 bg-white border border-slate-200 rounded-2xl sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-4 sm:py-3 bg-white border border-slate-200 rounded-2xl sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-black text-slate-700 appearance-none"
          >
            <option value="ALL">모든 상태</option>
            {Object.values(ProjectStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Project Info</th>
                <th className="px-8 py-5">Sites</th>
                <th className="px-8 py-5">Completion</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <Link to={`/project/${p.id}`} className="block">
                      <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">{p.location || 'Location Pending'}</p>
                    </Link>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{p.sites?.length || 0} 개소</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-indigo-600">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      p.status === ProjectStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link to={`/project/${p.id}`} className="inline-flex p-2 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronRight size={20} /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((p) => (
            <Link 
              key={p.id} 
              to={`/project/${p.id}`}
              className="block bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  p.status === ProjectStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {p.status}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-tighter">ID: {p.id.split('-').pop()}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 leading-tight mb-2 line-clamp-2">{p.name}</h3>
              <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                <MapPin size={12} />
                <span className="text-[11px] font-bold truncate">{p.location || '위치 미정'}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Progress</span>
                    <span className="text-sm font-black text-indigo-600 leading-none">{p.progress}%</span>
                  </div>
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1 block">Sites</span>
                  <span className="text-sm font-black text-slate-700 leading-none">{p.sites?.length || 0}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
            <Search size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">일치하는 항목이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;
