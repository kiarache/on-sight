
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectStatus, Site, Partner } from '@/types';
import { db } from '@/services/db';
import { ChevronLeft, Plus, Trash2, Save, Map, FileSpreadsheet, Info, ClipboardList, Briefcase } from 'lucide-react';

interface Props {
  onAddProject: (project: Project) => void;
}

const AddProject: React.FC<Props> = ({ onAddProject }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [sites, setSites] = useState<Omit<Site, 'id'>[]>([{ name: '', address: '', assignedPartnerId: '', assignedPartnerName: '' }]);

  React.useEffect(() => {
    db.getAll<Partner>('partners').then(setPartners);
  }, []);

  const handleAddSite = () => {
    setSites([...sites, { name: '', address: '', assignedPartnerId: '', assignedPartnerName: '' }]);
  };

  const handleRemoveSite = (index: number) => {
    if (sites.length === 1) return;
    setSites(sites.filter((_, i) => i !== index));
  };

  const handleSiteChange = (index: number, field: keyof Omit<Site, 'id'>, value: string) => {
    const newSites = [...sites];
    if (field === 'assignedPartnerId') {
      const partner = partners.find(p => p.id === value);
      newSites[index].assignedPartnerId = value;
      newSites[index].assignedPartnerName = partner?.name || '';
    } else {
      (newSites[index] as any)[field] = value;
    }
    setSites(newSites);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newSites: Omit<Site, 'id'>[] = [];

      lines.forEach((line, index) => {
        if (index === 0 && (line.includes('개소') || line.includes('명칭'))) return;
        if (!line.trim()) return;

        const [siteName, siteAddress, partnerName] = line.split(',').map(s => s.trim());
        if (siteName && siteAddress) {
          const partner = partners.find(p => p.name === partnerName);
          newSites.push({ 
            name: siteName, 
            address: siteAddress,
            assignedPartnerId: partner?.id || '',
            assignedPartnerName: partner?.name || partnerName || ''
          });
        }
      });

      if (newSites.length > 0) {
        if (sites.length === 1 && !sites[0].name && !sites[0].address) {
          setSites(newSites);
        } else {
          setSites([...sites, ...newSites]);
        }
        alert(`${newSites.length}개의 개소가 로드되었습니다.`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newProject: Project = {
      id: `PRJ-${Date.now()}`,
      name,
      status: ProjectStatus.PLANNING,
      progress: 0,
      lastUpdated: new Date().toISOString(),
      reports: [],
      sites: sites
        .filter(s => s.name && s.address)
        .map((s, idx) => ({ ...s, id: `SITE-${Date.now()}-${idx}` }))
    };

    onAddProject(newProject);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">새 프로젝트 등록</h1>
          <p className="text-slate-500 text-sm">사업 명칭과 공사 개소 정보를 입력하여 프로젝트를 시작하세요.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-100 pb-4 mb-4">
            <ClipboardList size={20} />
            <h2 className="font-bold text-lg">사업 명칭</h2>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">프로젝트 이름</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 2024년 전국 기지국 노후 장비 교체 사업"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg font-medium"
              required
            />
          </div>
        </section>

        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Map size={20} />
              <h2 className="font-bold text-lg">공사 개소(사이트) 설정</h2>
            </div>
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors"
              >
                <FileSpreadsheet size={16} /> 엑셀 업로드
              </button>
              <button 
                type="button"
                onClick={handleAddSite}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
              >
                <Plus size={16} /> 개소 직접 추가
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 flex items-start gap-3">
            <Info size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 mb-1">빠른 등록 팁</p>
              <p>엑셀 파일(CSV)을 사용하면 수백 개의 개소도 한 번에 등록할 수 있습니다. <span className="font-mono bg-white px-1 border border-slate-200 rounded text-indigo-600">개소명, 주소, 담당협력사(선택)</span> 형식을 유지해 주세요.</p>
            </div>
          </div>

          <div className="space-y-4">
            {sites.map((site, index) => (
              <div key={index} className="relative p-5 bg-white rounded-xl border border-slate-200 group hover:border-indigo-300 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">사이트 #{index + 1}</span>
                  {sites.length > 1 && (
                    <button type="button" onClick={() => handleRemoveSite(index)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 ml-1">개소명 (지점명)</label>
                    <input 
                      type="text" 
                      value={site.name}
                      onChange={(e) => handleSiteChange(index, 'name', e.target.value)}
                      placeholder="예: 강남역 MDF실"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 ml-1">상세 주소</label>
                    <input 
                      type="text" 
                      value={site.address}
                      onChange={(e) => handleSiteChange(index, 'address', e.target.value)}
                      placeholder="시설 위치"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 ml-1">담당 협력사</label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={site.assignedPartnerId}
                        onChange={(e) => handleSiteChange(index, 'assignedPartnerId', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-sm appearance-none font-bold"
                      >
                        <option value="">협력사 선택 안함</option>
                        {partners.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">취소</button>
          <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
            <Save size={20} /> 프로젝트 등록 및 사이트 생성
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;
