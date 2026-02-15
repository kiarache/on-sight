import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Project, ProjectStatus, Site, Partner } from '@/types';
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  Briefcase, 
  Link as LinkIcon,
  MessageSquare,
  Image as ImageIcon,
  Download,
  FileText,
  MapPin,
  ExternalLink,
  Users as UserIcon,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Check as CheckIcon,
  X as XIcon
} from 'lucide-react';
import JSZip from 'jszip';
import { useToast } from '@/components/Toast';

interface Props {
  projects: Project[];
  partners: Partner[];
  onUpdateStatus: (id: string, status: ProjectStatus) => void;
  onUpdateSites: (id: string, sites: Site[]) => void;
  onUpdateProject: (project: Project) => void;
}

const ProjectDetail: React.FC<Props> = ({ projects, partners, onUpdateStatus, onUpdateSites, onUpdateProject }) => {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const project = projects.find(p => p.id === id);
  const [isExporting, setIsExporting] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', address: '', assignedPartnerId: '', assignedPartnerName: '' });
  
  // 프로젝트명 편집 상태
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // 사이트 편집 상태
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [tempSiteName, setTempSiteName] = useState('');
  const [tempSiteAddress, setTempSiteAddress] = useState('');

  if (!project) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p className="font-bold">프로젝트를 찾을 수 없습니다.</p>
        <Link to="/" className="mt-4 text-indigo-600 font-bold flex items-center gap-1 hover:underline">
          <ChevronLeft size={16} /> 대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  const sites = project.sites || [];

  const handleAddSite = () => {
    if (!newSite.name.trim() || !newSite.address.trim()) {
      toast('개소명과 주소를 모두 입력해주세요.', 'error');
      return;
    }
    const site: Site = {
      id: `SITE-${Date.now()}`,
      name: newSite.name,
      address: newSite.address,
      assignedPartnerId: newSite.assignedPartnerId,
      assignedPartnerName: newSite.assignedPartnerName
    };
    onUpdateSites(project.id, [...sites, site]);
    setNewSite({ name: '', address: '', assignedPartnerId: '', assignedPartnerName: '' });
    setShowSiteModal(false);
  };

  const handleDeleteSite = (siteId: string) => {
    if (confirm('이 개소를 삭제하시겠습니까?')) {
      onUpdateSites(project.id, sites.filter(s => s.id !== siteId));
    }
  };

  const handleExportZip = async () => {
    if (project.reports.length === 0) return;
    
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${project.name}_증적자료`);
      
      folder?.file("reports_summary.txt", 
        `프로젝트: ${project.name}\n` +
        `ID: ${project.id}\n` +
        `생성일: ${new Date().toLocaleDateString()}\n\n` +
        project.reports.map((r, i) => (
          `[보고서 #${i+1}]\n` +
          `작성자: ${r.technicianName}\n` +
          `작성일: ${new Date(r.createdAt).toLocaleString()}\n` +
          `내용: ${r.content}\n` +
          `사진 수: ${r.photos.length}개\n` +
          `----------------------------------\n`
        )).join('\n')
      );

      const photosFolder = folder?.folder("photos");
      for (const report of project.reports) {
        for (let i = 0; i < report.photos.length; i++) {
          const photo = report.photos[i];
          photosFolder?.file(`report_${report.id}_photo_${i+1}.txt`, `Photo Content URL: ${photo.url}\nCategory: ${photo.category}\nDesc: ${photo.description}`);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}_백업.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("ZIP Export Error:", error);
      toast("파일 생성 중 오류가 발생했습니다.", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateProjectName = () => {
    if (!tempName.trim()) return;
    onUpdateProject({ ...project, name: tempName, lastUpdated: new Date().toISOString() });
    setIsEditingName(false);
  };

  const handleStartEditSite = (site: Site) => {
    setEditingSiteId(site.id);
    setTempSiteName(site.name);
    setTempSiteAddress(site.address);
  };

  const handleSaveSiteEdit = () => {
    if (!tempSiteName.trim() || !tempSiteAddress.trim()) return;
    const updatedSites = sites.map(s => 
      s.id === editingSiteId ? { ...s, name: tempSiteName, address: tempSiteAddress } : s
    );
    onUpdateSites(project.id, updatedSites);
    setEditingSiteId(null);
  };

  const completedSiteIds = new Set(project.reports.map(r => r.siteId).filter(Boolean));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-600 outline-none bg-transparent py-1 w-full max-w-md"
                  autoFocus
                />
                <button onClick={handleUpdateProjectName} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                  <CheckIcon size={20} />
                </button>
                <button onClick={() => setIsEditingName(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                  <XIcon size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                <button 
                  onClick={() => { setTempName(project.name); setIsEditingName(true); }}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                >
                  <Edit size={14} /> <span className="text-[10px] font-bold">수정</span>
                </button>
              </div>
            )}
            <p className="text-slate-400 text-[11px] font-mono mt-1">ID: {project.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={project.status}
            onChange={(e) => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.values(ProjectStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button 
            onClick={handleExportZip}
            disabled={isExporting || project.reports.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
          >
            {isExporting ? <span className="animate-spin text-white">...</span> : <Download size={16} />}
            증적 자료 내보내기
          </button>
        </div>
      </header>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">전체 리포트</p>
            <p className="text-2xl font-black text-slate-900">{project.reports.length}개</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">전체 사이트</p>
            <p className="text-2xl font-black text-slate-900">{sites.length}개</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">완료 개소</p>
            <p className="text-2xl font-black text-slate-900">{completedSiteIds.size}개</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:ring-2 hover:ring-indigo-500/20">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">전체 진척률</p>
            <p className="text-2xl font-black text-indigo-600 font-mono">{project.progress}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 리포트 타임라인 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-slate-900">현장 리포트 내역</h2>
          </div>

          <div className="space-y-4">
            {project.reports.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 border-dashed text-center flex flex-col items-center">
                <FileText size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium">아직 제출된 리포트가 없습니다.</p>
              </div>
            ) : (
              project.reports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{report.technicianName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {report.content}
                    </p>

                    {report.photos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {report.photos.map((photo) => (
                          <div key={photo.id} className="group relative rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-100">
                            <img src={photo.url} alt={photo.description} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                              <span className="text-[9px] font-bold text-white uppercase tracking-wider">{photo.category}</span>
                              <p className="text-[10px] text-white/80 truncate font-medium">{photo.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 프로젝트 정보 및 사이트 관리 */}
        <div className="space-y-6">
          {/* 사이트 관리 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600" /> 사이트 개소 관리
              </h3>
              <button 
                onClick={() => setShowSiteModal(true)}
                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sites.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">등록된 개소가 없습니다.</p>
              ) : (
                sites.map(site => {
                  const isCompleted = completedSiteIds.has(site.id);
                  return (
                    <div key={site.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between group hover:bg-slate-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        {editingSiteId === site.id ? (
                          <div className="space-y-2 pr-2">
                            <input 
                              type="text" 
                              value={tempSiteName}
                              onChange={(e) => setTempSiteName(e.target.value)}
                              className="w-full px-2 py-1 text-xs font-bold border border-indigo-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="개소명"
                            />
                            <input 
                              type="text" 
                              value={tempSiteAddress}
                              onChange={(e) => setTempSiteAddress(e.target.value)}
                              className="w-full px-2 py-1 text-[10px] border border-indigo-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="주소"
                            />
                            <div className="flex gap-1 justify-end">
                              <button onClick={handleSaveSiteEdit} className="p-1 text-indigo-600 hover:bg-white rounded transition-colors"><CheckIcon size={14} /></button>
                              <button onClick={() => setEditingSiteId(null)} className="p-1 text-slate-400 hover:bg-white rounded transition-colors"><XIcon size={14} /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{site.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-[10px] text-slate-400 truncate">{site.address}</p>
                                {site.assignedPartnerName && (
                                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[9px] font-bold border border-indigo-100/50 flex items-center gap-1 flex-shrink-0">
                                    <Briefcase size={8} /> {site.assignedPartnerName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {editingSiteId !== site.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleStartEditSite(site)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded"
                            title="정보 수정"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSite(site.id)}
                            className="p-1 text-red-300 hover:text-red-500 hover:bg-white rounded"
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-bold mb-2">실시간 구축 현황</h3>
              <p className="text-[11px] text-indigo-100 font-medium leading-relaxed mb-4">
                현장 기사가 제출한 사진과 데이터가 실시간으로 동기화되고 있습니다.
              </p>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center overflow-hidden">
                    <UserIcon size={16} />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-800 flex items-center justify-center text-[10px] font-bold">
                  +12
                </div>
              </div>
            </div>
            <RefreshCw size={80} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
          </div>
        </div>
      </div>

      {/* 사이트 추가 모달 */}
      {showSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">새 개소 등록</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">개소명</label>
                <input
                  type="text"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  placeholder="예: 1호점"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">주소</label>
                <input
                  type="text"
                  value={newSite.address}
                  onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
                  placeholder="예: 서울시 강남구 테헤란로 123"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">담당 협력사</label>
                <select
                  value={newSite.assignedPartnerId}
                  onChange={(e) => {
                    const p = partners.find(item => item.id === e.target.value);
                    setNewSite({ ...newSite, assignedPartnerId: e.target.value, assignedPartnerName: p?.name || '' });
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm appearance-none font-bold"
                >
                  <option value="">협력사 선택 안함</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddSite}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                등록
              </button>
              <button
                onClick={() => {
                  setShowSiteModal(false);
                  setNewSite({ name: '', address: '', assignedPartnerId: '', assignedPartnerName: '' });
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
