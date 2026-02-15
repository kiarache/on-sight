
import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Send, Loader2, X, MapPin, ChevronLeft, ImagePlus, User, Briefcase, FileText } from 'lucide-react';
import { Project, Partner } from '@/types';
import { compressImage } from '@/utils/imageUtils';
import { useToast } from '@/components/Toast';

interface PhotoSlot {
  label: string;
  type: string;
  photo?: { id: string; url: string; description: string };
}

interface Props {
  projects: Project[];
  partners: Partner[];
  onAddReport: (projectId: string, report: any) => void;
}

const FieldSubmission: React.FC<Props> = ({ projects, partners, onAddReport }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const initialProjectId = searchParams.get('pid') || '';
  const initialSiteId = searchParams.get('sid') || '';

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [selectedSiteId, setSelectedSiteId] = useState(initialSiteId);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [content, setContent] = useState('');
  
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>([]);
  // Local state to store actual File objects
  const [fileMap, setFileMap] = useState<Record<number, File>>({});

  React.useEffect(() => {
    setPhotoSlots([
      { label: '설치 전 전경', type: 'BEFORE' },
      { label: '장비 장착 사진', type: 'EQUIPMENT' },
      { label: '시리얼/명판 사진', type: 'SERIAL' },
      { label: '설치 후 완료 사진', type: 'AFTER' },
    ]);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSlotIndex = useRef<number | null>(null);

  const activeProjects = projects.filter(p => p.status !== '완료');
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedPartner = partners.find(p => p.id === selectedPartnerId);

  const triggerUpload = (index: number) => {
    activeSlotIndex.current = index;
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = activeSlotIndex.current;
    if (!file || index === null) return;

    // Preview용 URL 생성
    const previewUrl = URL.createObjectURL(file);
    
    const updatedSlots = [...photoSlots];
    updatedSlots[index].photo = {
      id: Math.random().toString(36).substr(2, 9),
      url: previewUrl, // UI 표시용
      description: '',
    };
    
    setFileMap(prev => ({ ...prev, [index]: file }));
    setPhotoSlots(updatedSlots);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedSlots = [...photoSlots];
    if (updatedSlots[index].photo) {
      updatedSlots[index].photo!.description = value;
      setPhotoSlots(updatedSlots);
    }
  };

  const removePhoto = (index: number) => {
    const updatedSlots = [...photoSlots];
    updatedSlots[index].photo = undefined;
    setPhotoSlots(updatedSlots);
    
    const updatedFileMap = { ...fileMap };
    delete updatedFileMap[index];
    setFileMap(updatedFileMap);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uploadedPhotosCount = photoSlots.filter(s => !!s.photo).length;

    if (!selectedProjectId || !selectedSiteId || !selectedPartnerId || !technicianName || uploadedPhotosCount === 0) {
      toast('필수 정보를 입력하고 사진을 1장 이상 등록해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // 메타데이터 준비
      const reportData = {
        id: `REP-${Date.now()}`,
        projectId: selectedProjectId,
        siteId: selectedSiteId,
        technicianName,
        content,
        // 서버에서 url을 채워줄 것이므로 여기서는 메타정보만 보냄
        photos: photoSlots
          .filter(s => !!s.photo)
          .map(s => ({
            id: s.photo!.id,
            description: s.photo!.description,
            category: s.label,
            timestamp: new Date().toISOString(),
          })),
        createdAt: new Date().toISOString()
      };

      formData.append('projectId', selectedProjectId);
      formData.append('report', JSON.stringify(reportData));
      
      // 실제 파일들 추가 (백엔드 upload.array('photos')와 매칭)
      photoSlots.forEach((slot, idx) => {
        if (slot.photo && fileMap[idx]) {
          formData.append('photos', fileMap[idx]);
        }
      });

      await onAddReport(selectedProjectId, formData);
      navigate('/');
    } catch (err: any) {
      toast('제출 중 오류가 발생했습니다: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-32">
      <header className="mb-6 sm:mb-8 flex items-center gap-4 px-2">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm active:scale-90 transition-all"><ChevronLeft size={20} /></button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">현장 보고서 작성</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5 leading-none">현장 증적 보고서</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 px-1">
        {/* Info Section */}
        <div className="bg-white p-5 sm:p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
              <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-indigo-600 appearance-none">
                <option value="">프로젝트 선택</option>
                {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
              <select value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} disabled={!selectedProjectId} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 appearance-none">
                <option value="">개소 선택</option>
                {selectedProject?.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={selectedPartnerId} onChange={(e) => setSelectedPartnerId(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-indigo-600 appearance-none">
                <option value="">협력사</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} disabled={!selectedPartnerId} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 appearance-none">
                <option value="">작업자</option>
                {selectedPartner?.technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-white p-5 sm:p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">증적 사진</h2>
            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">1장 이상 필수</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {photoSlots.map((slot, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-tighter">{slot.label}</span>
                <div className={`relative aspect-[4/3] rounded-[24px] overflow-hidden border-2 transition-all active:scale-[0.98] ${
                  slot.photo ? 'border-indigo-400 shadow-md' : 'border-dashed border-slate-200 bg-slate-50/50'
                }`}>
                  {slot.photo ? (
                    <>
                      <img src={slot.photo.url} className="w-full h-full object-cover" alt={slot.label} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                      <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2.5 right-2.5 p-1.5 bg-black/40 text-white backdrop-blur-md rounded-xl transition-all"><X size={14} /></button>
                      <div className="absolute bottom-2 left-2 right-2">
                         <input 
                           type="text" 
                           value={slot.photo.description}
                           onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                           placeholder="메모를 입력하세요..."
                           className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 text-white text-[9px] outline-none placeholder:text-white/40"
                         />
                      </div>
                    </>
                  ) : (
                    <button type="button" onClick={() => triggerUpload(idx)} className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-300 group-hover:text-indigo-600 transition-colors">
                        <Camera size={24} />
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">촬영</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm flex items-start gap-3">
          <FileText size={18} className="text-slate-400 mt-1 flex-shrink-0" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="w-full p-0 bg-transparent outline-none text-sm font-bold placeholder:text-slate-300" placeholder="특이사항이나 장비 상태 요약..."></textarea>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 transition-all active:scale-95 flex items-center justify-center gap-3">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={20} /> 보고서 제출</>}
        </button>
      </form>

      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" capture="environment" className="hidden" />
    </div>
  );
};

export default FieldSubmission;
