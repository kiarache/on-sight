
import React, { useState } from 'react';
import { Partner } from '@/types';
import { useToast } from '@/components/Toast';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Table from '@/components/Table';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import { Plus, Users, Building2, Phone, Trash2, AlertTriangle, Share2, Check, Edit2, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface Props {
  partners: Partner[];
  onAddPartner: (partner: Partner) => void;
  onUpdatePartner: (partner: Partner) => void;
  onDeletePartner: (partnerId: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

const PartnerManagement: React.FC<Props> = ({ partners, onAddPartner, onUpdatePartner, onDeletePartner }) => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newPartner, setNewPartner] = useState({ name: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
      toast('협력사 정보가 수정되었습니다.', 'success');
      setEditingPartner(null);
    } else {
      const partner: Partner = {
        id: generatePartnerCode(),
        name: newPartner.name,
        address: '',
        technicians: []
      };
      onAddPartner(partner);
      toast('신규 협력사가 등록되었습니다.', 'success');
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
      toast('등록 링크가 클립보드에 복사되었습니다.', 'info');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPartners.length / ITEMS_PER_PAGE);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">협력사 관리</h1>
          <p className="text-slate-500 text-sm font-medium">등록된 파트너사와 소속된 기술 인력 현황을 확인합니다.</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus size={18} />}
          size="lg"
        >
          협력사 등록
        </Button>
      </header>

      {/* 검색 바 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="협력사명 또는 ID로 검색..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all shadow-sm"
        />
      </div>

      {/* 테이블 영역 */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <Table
          headers={['No', 'ID', '협력사명', '소속 인력', '관리']}
          footer={filteredPartners.length > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">총 {filteredPartners.length}개 협력사</span>
              <span className="text-xs text-slate-400">
                전체 소속 인력: <span className="font-bold text-indigo-600">{filteredPartners.reduce((sum, p) => sum + p.technicians.length, 0)}명</span>
              </span>
            </div>
          ) : null}
        >
          {filteredPartners.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState 
                  icon={<Building2 />}
                  title={searchTerm ? '검색 결과가 없습니다.' : '등록된 협력사가 없습니다.'}
                  description={searchTerm ? '다른 검색어를 입력해 보세요.' : '위 "협력사 등록" 버튼을 눌러 추가하세요.'}
                />
              </td>
            </tr>
          ) : (
            paginatedPartners.map((partner, index) => (
              <React.Fragment key={partner.id}>
                <tr className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-slate-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
                  </td>
                  <td className="px-8 py-4">
                    <Badge variant="primary">{partner.id}</Badge>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                        <Building2 size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{partner.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === partner.id ? null : partner.id)}
                      leftIcon={<Users size={14} className="text-indigo-500" />}
                      rightIcon={partner.technicians.length > 0 && (
                        expandedId === partner.id 
                          ? <ChevronUp size={14} className="text-slate-400" />
                          : <ChevronDown size={14} className="text-slate-400" />
                      )}
                    >
                      <span className={partner.technicians.length > 0 ? 'text-indigo-600' : 'text-slate-400'}>
                        {partner.technicians.length}명
                      </span>
                    </Button>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(partner)}
                        title="수정"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyRegLink(partner.id)}
                        className={copiedId === partner.id ? 'text-emerald-500 bg-emerald-50' : ''}
                        title="등록 링크 복사"
                      >
                        {copiedId === partner.id ? <Check size={16} /> : <Share2 size={16} />}
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(partner.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
                {/* 확장: 소속 기술 인력 목록 */}
                {expandedId === partner.id && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={5} className="px-8 py-4">
                      <div className="pl-6 border-l-2 border-indigo-200 ml-6">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Users size={12} className="text-indigo-400" /> 소속 기술 인력
                        </p>
                        {partner.technicians.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3">등록된 기술 인력이 없습니다.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {partner.technicians.map((tech) => (
                              <div key={tech.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
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
        </Table>
        
        {totalPages > 1 && (
          <div className="pb-8">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="협력사 삭제"
        size="sm"
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirmId(null)}>취소</Button>
            <Button variant="danger" className="flex-1" onClick={async () => { 
              try {
                await onDeletePartner(deleteConfirmId!);
                setDeleteConfirmId(null);
                toast('협력사가 삭제되었습니다.', 'success');
              } catch (err: any) {
                toast(err.message || '삭제 중 오류가 발생했습니다.', 'error');
              }
            }}>삭제</Button>
          </>
        }
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            정말로 이 협력사를 삭제하시겠습니까?<br/>
            소속된 기사가 있다면 삭제할 수 없습니다.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={showAddModal}
        onClose={closeAddModal}
        title={editingPartner ? '협력사 정보 수정' : '신규 협력사 등록'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">협력사 상호명</label>
              <input 
                type="text" 
                value={newPartner.name} 
                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} 
                placeholder="예: (주)대한네트웍스" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-base font-bold transition-all" 
                required 
              />
            </div>
          </div>
          <Button type="submit" size="xl" className="w-full">
            {editingPartner ? '변경 사항 저장' : '협력사 등록 완료'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default PartnerManagement;

