import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project, ProjectStatus } from '@/types';
import { Search, Filter, ChevronRight, Plus, MapPin, CheckCircle2, MoreHorizontal } from 'lucide-react';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';

interface Props {
  projects: Project[];
}

const ITEMS_PER_PAGE = 10;

const ProjectManagement: React.FC<Props> = ({ projects }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">프로젝트 관리</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">전체 프로젝트 상태 및 공정 확인</p>
        </div>
        <Button 
          onClick={() => navigate('/projects/new')}
          leftIcon={<Plus size={18} />}
          size="lg"
        >
          프로젝트 추가
        </Button>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="프로젝트명 검색..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-4 sm:py-3.5 bg-white border border-slate-200 rounded-2xl sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto pl-11 pr-8 py-4 sm:py-3.5 bg-white border border-slate-200 rounded-2xl sm:rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-black text-slate-700 appearance-none shadow-sm transition-all"
          >
            <option value="ALL">모든 상태</option>
            {Object.values(ProjectStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Table
          headers={['프로젝트 정보', '개소', '진척률', '상태', '상세']}
          footer={filteredProjects.length > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 text-center w-full">총 {filteredProjects.length}개의 프로젝트</span>
            </div>
          ) : null}
        >
          {filteredProjects.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState 
                  icon={<Search />}
                  title={projects.length === 0 ? '등록된 프로젝트가 없습니다' : '일치하는 항목이 없습니다'}
                  description={projects.length === 0 ? '상단의 "프로젝트 추가" 버튼으로 새 프로젝트를 등록하세요.' : '다른 검색어를 입력하거나 필터를 조정해 보세요.'}
                />
              </td>
            </tr>
          ) : (
            paginatedProjects.map((p) => (
              <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-8 py-6">
                  <Link to={`/project/${p.id}`} className="block">
                    <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">{p.location || '위치 미정'}</p>
                  </Link>
                </td>
                <td className="px-8 py-6">
                  <Badge variant="slate">{p.sites?.length || 0} 개소</Badge>
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
                  <Badge variant={p.status === ProjectStatus.COMPLETED ? 'success' : 'primary'}>
                    {p.status}
                  </Badge>
                </td>
                <td className="px-8 py-6 text-right">
                  <Link to={`/project/${p.id}`} className="inline-flex p-2 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronRight size={20} /></Link>
                </td>
              </tr>
            ))
          )}
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredProjects.length > 0 ? (
          paginatedProjects.map((p) => (
            <Link 
              key={p.id} 
              to={`/project/${p.id}`}
              className="block bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <Badge variant={p.status === ProjectStatus.COMPLETED ? 'success' : 'primary'}>
                  {p.status}
                </Badge>
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
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">진척률</span>
                    <span className="text-sm font-black text-indigo-600 leading-none">{p.progress}%</span>
                  </div>
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1 block">개소</span>
                  <span className="text-sm font-black text-slate-700 leading-none">{p.sites?.length || 0}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState 
            icon={<Search />}
            title="일치하는 항목이 없습니다"
          />
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProjectManagement;
