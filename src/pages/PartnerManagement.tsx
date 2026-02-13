
import React, { useState } from 'react';
import { Partner, Technician } from '@/types';
import { Plus, Users, Building2, Phone, Trash2, AlertTriangle, X, Share2, Check, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  partners: Partner[];
  onAddPartner: (partner: Partner) => void;
  onUpdatePartner: (partner: Partner) => void;
  onDeletePartner: (partnerId: string) => Promise<void>;
}

const PartnerManagement: React.FC<Props> = ({ partners, onAddPartner, onUpdatePartner, onDeletePartner }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newPartner, setNewPartner] = useState({ name: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const generatePartnerCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name) return;
    
    if (editingPartner) {
      onUpdatePartner({
        ...editingPartner,
        name: newPartner.name
      });
      setEditingPartner(null);
    } else {
      const partner: Partner = {
        id: generatePartnerCode(),
        name: newPartner.name,
        address: '',
        technicians: []
      };
      onAddPartner(partner);
    }
    
    setNewPartner({ name: '' });
    setShowAddModal(false);
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setNewPartner({ name: partner.name });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setEditingPartner(null);
    setNewPartner({ name: '' });
  };

  const handleCopyRegLink = (partnerId: string) => {
    const regUrl = `${window.location.origin}${window.location.pathname}#/register-technician?pid=${partnerId}`;
    navigator.clipboard.writeText(regUrl).then(() => {
      setCopiedId(partnerId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">협력사 관리</h1>
          <p className="text-slate-500 text-sm">등록된 파트너사와 소속된 기술 인력 현황을 확인합니다.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus size={18} /> 협력사 등록
        </button>
      </header>

      {/* 테이블 영역 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-16">No</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-28">ID</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">협력사명</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">소속 인력</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-48 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                        <Building2 size={28} />
                      </div>
                      <p className="text-sm font-bold text-slate-400">등록된 협력사가 없습니다.</p>
                      <p className="text-xs text-slate-300">위 "협력사 등록" 버튼을 눌러 추가하세요.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                partners.map((partner, index) => (
                  <React.Fragment key={partner.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-400">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] text-indigo-500 font-black tracking-wider uppercase bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                          {partner.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                            <Building2 size={20} />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{partner.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setExpandedId(expandedId === partner.id ? null : partner.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:bg-indigo-50"
                          title="소속 인력 보기"
                        >
                          <Users size={14} className="text-indigo-500" />
                          <span className={partner.technicians.length > 0 ? 'text-indigo-600' : 'text-slate-400'}>
                            {partner.technicians.length}명
                          </span>
                          {partner.technicians.length > 0 && (
                            expandedId === partner.id 
                              ? <ChevronUp size={14} className="text-slate-400" />
                              : <ChevronDown size={14} className="text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => openEditModal(partner)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="수정"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleCopyRegLink(partner.id)}
                            className={`p-2 rounded-lg transition-all ${copiedId === partner.id ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                            title="등록 링크 복사"
                          >
                            {copiedId === partner.id ? <Check size={16} /> : <Share2 size={16} />}
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(partner.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="삭제"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* 확장: 소속 기술 인력 목록 */}
                    {expandedId === partner.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="pl-6 border-l-2 border-indigo-200 ml-6">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <Users size={12} className="text-indigo-400" /> 소속 기술 인력
                            </p>
                            {partner.technicians.length === 0 ? (
                              <p className="text-xs text-slate-400 py-3">등록된 기술 인력이 없습니다.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {partner.technicians.map((tech) => (
                                  <div key={tech.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                                      {tech.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-800 truncate">{tech.name}</p>
                                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <Phone size={10} /> {tech.phone}
                                      </p>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-300 ml-auto shrink-0">{new Date(tech.joinedAt).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* 하단 요약 */}
        {partners.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">총 {partners.length}개 협력사</span>
            <span className="text-xs text-slate-400">
              전체 소속 인력: <span className="font-bold text-indigo-600">{partners.reduce((sum, p) => sum + p.technicians.length, 0)}명</span>
            </span>
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">협력사 삭제</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                정말로 이 협력사를 삭제하시겠습니까?<br/>
                소속된 기사가 있다면 삭제할 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200">취소</button>
                <button onClick={async () => { 
                  try {
                    await onDeletePartner(deleteConfirmId);
                    setDeleteConfirmId(null);
                  } catch (err: any) {
                    alert(err.message || '삭제 중 오류가 발생했습니다.');
                  }
                }} className="flex-1 py-4 text-sm font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100">삭제</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{editingPartner ? '협력사 정보 수정' : '신규 협력사 등록'}</h3>
              <button onClick={closeAddModal} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">협력사 상호명</label>
                  <input type="text" value={newPartner.name} onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} placeholder="예: (주)대한네트웍스" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-base font-bold" required />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                {editingPartner ? '변경 사항 저장' : '협력사 등록 완료'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerManagement;

