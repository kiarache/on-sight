
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project, ProjectStatus } from '@/types';
import { Camera, ChevronRight, Clock, MapPin, CheckCircle2, AlertCircle, Calendar, Zap, Settings } from 'lucide-react';

interface Props {
  projects: Project[];
}

const TechnicianDashboard: React.FC<Props> = ({ projects }) => {
  const navigate = useNavigate();
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.COMPLETED);
  
  // 전체 미완료 개소 계산
  const pendingSitesCount = activeProjects.reduce((acc, p) => {
    const reportedSiteIds = new Set(p.reports.map(r => r.siteId));
    const pendingInProject = p.sites.filter(s => !reportedSiteIds.has(s.id)).length;
    return acc + pendingInProject;
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">ON-Sight</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Field Operations</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">현장 업무 리포트</h1>
          <p className="text-slate-500 text-sm font-medium">오엔시스템의 정확한 증적 수집을 시작하세요.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/account')}
            className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
            title="내 계정 관리"
          >
            <Settings size={20} />
          </button>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <Calendar className="text-indigo-600" size={20} />
          </div>
        </div>
      </header>

      {/* 실시간 상태 요약 카드 */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">진행해야 할 현장</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black">{pendingSitesCount}</span>
              <span className="text-lg font-bold text-slate-400">개소</span>
            </div>
            <button 
              onClick={() => navigate('/submit')}
              className="mt-6 w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-center flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20 text-sm sm:text-base"
            >
              <Camera size={20} /> 지금 보고서 작성하기
            </button>
          </div>
          {/* 장식용 배경 원 */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <Zap size={100} className="absolute -right-4 bottom-0 text-white opacity-5 rotate-12" />
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-indigo-500" /> 할당된 프로젝트 ({activeProjects.length})
          </h2>
        </div>

        <div className="space-y-4">
          {activeProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <CheckCircle2 className="mx-auto text-slate-200 mb-3" size={48} />
              <p className="text-slate-400 font-bold">현재 할당된 업무가 없습니다.</p>
            </div>
          ) : (
            activeProjects.map(project => {
              const reportedSiteIds = new Set(project.reports.map(r => r.siteId));
              const pendingSites = project.sites.filter(s => !reportedSiteIds.has(s.id));
              
              return (
                <div key={project.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
                  <div className="p-5 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {project.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{project.id}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-2">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-xs font-medium truncate">{project.location || '위치 정보 없음'}</span>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500">전체 공정률</span>
                      <span className="text-xs font-black text-indigo-600">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-1000" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">미완료 개소 ({pendingSites.length})</p>
                      {pendingSites.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {pendingSites.slice(0, 3).map(site => (
                            <Link 
                              key={site.id}
                              to={`/submit?pid=${project.id}&sid=${site.id}`}
                              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-1"
                            >
                              {site.name} <ChevronRight size={12} />
                            </Link>
                          ))}
                          {pendingSites.length > 3 && (
                            <span className="text-[11px] text-slate-400 py-2 px-1 font-bold">+{pendingSites.length - 3}개 더보기</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-bold">모든 개소 보고 완료</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 안내 섹션 */}
      <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4 items-center">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 leading-tight">보고서 작성 안내</h4>
          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-normal">
            사진 촬영 시 수평을 유지하고 시리얼 번호가 잘 보이도록 근접 촬영해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
