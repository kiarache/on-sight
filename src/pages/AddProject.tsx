import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectStatus, Site, Partner } from '@/types';
import { db } from '@/services/db';
import { useToast } from '@/components/Toast';
import { ChevronLeft, Plus, Trash2, Save, Map, FileSpreadsheet, Info, ClipboardList, Briefcase, AlertCircle, Check } from 'lucide-react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Table from '@/components/Table';
import Badge from '@/components/Badge';

interface Props {
  onAddProject: (project: Project) => void;
}

interface PreviewSite extends Omit<Site, 'id'> {
  error?: string;
}

const AddProject: React.FC<Props> = ({ onAddProject }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [sites, setSites] = useState<Omit<Site, 'id'>[]>([{ name: '', address: '', assignedPartnerId: '', assignedPartnerName: '' }]);
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSites, setPreviewSites] = useState<PreviewSite[]>([]);

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
      const parsedSites: PreviewSite[] = [];

      lines.forEach((line, index) => {
        if (index === 0 && (line.includes('개소') || line.includes('명칭') || line.includes('이름'))) return;
        if (!line.trim()) return;

        const parts = line.split(',').map(s => s.trim());
        const siteName = parts[0];
        const siteAddress = parts[1];
        const partnerName = parts[2];

        let error = '';
        if (!siteName) error = '개소명 누락';
        else if (!siteAddress) error = '주소 누락';

        const partner = partners.find(p => p.name === partnerName);
        parsedSites.push({ 
          name: siteName || '', 
          address: siteAddress || '',
          assignedPartnerId: partner?.id || '',
          assignedPartnerName: partner?.name || partnerName || '',
          error
        });
      });

      if (parsedSites.length > 0) {
        setPreviewSites(parsedSites);
        setShowPreviewModal(true);
      } else {
        toast('유효한 데이터가 없습니다.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmUpload = () => {
    const validSites = previewSites.filter(s => !s.error).map(({ error, ...s }) => s);
    if (validSites.length === 0) {
      toast('등록 가능한 데이터가 없습니다.', 'error');
      return;
    }

    if (sites.length === 1 && !sites[0].name && !sites[0].address) {
      setSites(validSites);
    } else {
      setSites([...sites, ...validSites]);
    }
    
    toast(`${validSites.length}개의 개소가 추가되었습니다.`, 'success');
    setShowPreviewModal(false);
    setPreviewSites([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const validSites = sites.filter(s => s.name && s.address);
    if (validSites.length === 0) {
      return toast('최소 하나 이상의 유효한 사이트 정보를 입력해 주세요.', 'error');
    }

    const newProject: Project = {
      id: `PRJ-${Date.now()}`,
      name,
      status: ProjectStatus.PLANNING,
      progress: 0,
      lastUpdated: new Date().toISOString(),
      reports: [],
      sites: validSites.map((s, idx) => ({ ...s, id: `SITE-${Date.now()}-${idx}` }))
    };

    onAddProject(newProject);
    toast('프로젝트가 등록되었습니다.', 'success');
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="p-2 h-10 w-10 border border-slate-200"
        >
          <ChevronLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">새 프로젝트 등록</h1>
          <p className="text-slate-500 text-sm font-medium">사업 명칭과 공사 개소 정보를 입력하여 프로젝트를 시작하세요.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-100 pb-4 mb-4">
            <ClipboardList size={20} />
            <h2 className="font-bold text-lg">사업 명칭</h2>
          </div>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">프로젝트 이름</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 2024년 전국 기지국 노후 장비 교체 사업"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg font-bold shadow-sm"
              required
            />
          </div>
        </section>

        <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Map size={20} />
              <h2 className="font-bold text-lg">공사 개소(사이트) 설정</h2>
            </div>
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<FileSpreadsheet size={16} />}
                className="text-emerald-600 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200"
              >
                엑셀 업로드
              </Button>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSite}
                leftIcon={<Plus size={16} />}
              >
                개소 직접 추가
              </Button>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-4 flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <Info size={20} />
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <p className="font-black text-slate-800 mb-1">빠른 등록 팁</p>
              <p className="font-medium">엑셀 파일(CSV)을 사용하면 수백 개의 개소도 한 번에 등록할 수 있습니다. <span className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded text-indigo-600 font-bold italic">개소명, 주소, 담당협력사(선택)</span> 형식을 유지해 주세요.</p>
            </div>
          </div>

          <div className="space-y-4">
            {sites.map((site, index) => (
              <div key={index} className="relative p-6 bg-slate-50/50 rounded-[24px] border border-slate-200 group hover:border-indigo-300 hover:bg-white transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="primary">사이트 #{index + 1}</Badge>
                  {sites.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveSite(index)} 
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">개소명 (지점명)</label>
                    <input 
                      type="text" 
                      value={site.name}
                      onChange={(e) => handleSiteChange(index, 'name', e.target.value)}
                      placeholder="예: 강남역 MDF실"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">상세 주소</label>
                    <input 
                      type="text" 
                      value={site.address}
                      onChange={(e) => handleSiteChange(index, 'address', e.target.value)}
                      placeholder="시설 위치"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">담당 협력사</label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={site.assignedPartnerId}
                        onChange={(e) => handleSiteChange(index, 'assignedPartnerId', e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none font-bold shadow-sm"
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
          <Button 
            variant="secondary" 
            size="xl" 
            className="flex-1" 
            onClick={() => navigate(-1)}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            size="xl" 
            className="flex-[2]"
            leftIcon={<Save size={20} />}
          >
            프로젝트 등록 및 사이트 생성
          </Button>
        </div>
      </form>

      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="CSV 업로드 미리보기"
        size="xl"
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setShowPreviewModal(false)}>취소</Button>
            <Button variant="primary" className="flex-1" onClick={confirmUpload} leftIcon={<Check size={18} />}>확인 후 추가</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">총 {previewSites.length}개의 항목이 발견되었습니다.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                성공: {previewSites.filter(s => !s.error).length}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                오류: {previewSites.filter(s => s.error).length}
              </div>
            </div>
          </div>
          
          <Table
            headers={['상태', '개소명', '주소', '협력사']}
          >
            {previewSites.map((site, index) => (
              <tr key={index} className={site.error ? 'bg-red-50/50' : ''}>
                <td className="px-8 py-4">
                  {site.error ? (
                    <Badge variant="danger" icon={<AlertCircle size={10} />}>{site.error}</Badge>
                  ) : (
                    <Badge variant="success" icon={<Check size={10} />}>정상</Badge>
                  )}
                </td>
                <td className="px-8 py-4 text-sm font-bold text-slate-700">{site.name || <span className="text-red-400 italic">미입력</span>}</td>
                <td className="px-8 py-4 text-xs font-medium text-slate-500">{site.address || <span className="text-red-400 italic">미입력</span>}</td>
                <td className="px-8 py-4 text-xs font-bold text-slate-400">{site.assignedPartnerName || '-'}</td>
              </tr>
            ))}
          </Table>
          
          {previewSites.some(s => s.error) && (
            <p className="text-xs text-red-500 font-bold flex items-center gap-1.5">
              <AlertCircle size={14} /> 오류가 있는 행은 제외하고 등록됩니다.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AddProject;
