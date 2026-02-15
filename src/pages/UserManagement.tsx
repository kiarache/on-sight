
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Shield, 
  User, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  Key,
  Building2,
  Filter
} from 'lucide-react';
import { db, User as UserType } from '@/services/db';
import { Partner } from '@/types';
import { useToast } from '@/components/Toast';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Table from '@/components/Table';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import Pagination from '@/components/Pagination';

interface UserData {
  id: string;
  username: string;
  name: string;
  role: 'SUPER' | 'ADMIN' | 'TECHNICIAN';
  partnerId?: string | null;
  partnerName?: string | null;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser] = useState<UserType | null>(db.getCurrentUser());
  
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    password: '',
    role: 'TECHNICIAN' as 'SUPER' | 'ADMIN' | 'TECHNICIAN',
    partnerId: '',
    partnerName: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersData, partnersData] = await Promise.all([
        db.getAll<UserData>('users'),
        db.getAll<Partner>('partners')
      ]);
      setUsers(usersData);
      setPartners(partnersData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('onsight_token')}`
        },
        body: JSON.stringify(newUser)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '사용자 생성 실패');
      }

      const created = await res.json();
      setUsers(prev => [created, ...prev]);
      setShowCreateModal(false);
      setNewUser({ username: '', name: '', password: '', role: 'TECHNICIAN', partnerId: '', partnerName: '' });
      toast('새로운 계정이 생성되었습니다.', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('onsight_token')}`
        },
        body: JSON.stringify({ newPassword: '1234' }) // 기본 초기화 비밀번호
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '비밀번호 초기화 실패');
      }

      toast('비밀번호가 1234로 초기화되었습니다.', 'success');
      setResetPasswordId(null);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('onsight_token')}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '사용자 삭제 실패');
      }

      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteConfirmId(null);
      toast('사용자 계정이 삭제되었습니다.', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'SUPER':
        return <Badge variant="purple" icon={<Shield size={10} />}>{role}</Badge>;
      case 'ADMIN':
        return <Badge variant="info" icon={<Shield size={10} />}>{role}</Badge>;
      default:
        return <Badge variant="slate" icon={<User size={10} />}>{role}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Users size={32} className="text-indigo-600" /> 계정 관리
          </h1>
          <p className="text-slate-500 text-base font-medium mt-1">시스템에 등록된 모든 사용자 계정을 조회하고 관리합니다.</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          leftIcon={<UserPlus size={18} />}
          size="lg"
        >
          계정 생성
        </Button>
      </header>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="성명 또는 아이디로 검색..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold shadow-sm"
              />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold appearance-none shadow-sm"
              >
                <option value="ALL">모든 권한</option>
                <option value="SUPER">SUPER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="TECHNICIAN">TECHNICIAN</option>
              </select>
            </div>
          </div>
          <Button 
            variant="ghost"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>

        <Table
          headers={['사용자 정보', '권한 레벨', '가입일', '관리']}
        >
          {loading && Array(5).fill(0).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-8 py-6"><div className="h-10 w-48 bg-slate-100 rounded-xl"></div></td>
              <td className="px-8 py-6"><div className="h-6 w-20 bg-slate-100 rounded-lg mx-auto"></div></td>
              <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-100 rounded mx-auto"></div></td>
              <td className="px-8 py-6"><div className="h-10 w-10 bg-slate-100 rounded-xl ml-auto"></div></td>
            </tr>
          ))}
          
          {!loading && paginatedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-black text-indigo-600 group-hover:scale-105 transition-transform">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-black text-slate-900">{user.name}</p>
                      {user.partnerName && (
                        <Badge variant="primary" icon={<Building2 size={8} />}>{user.partnerName}</Badge>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-400">@{user.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex justify-center">
                  {getRoleBadge(user.role)}
                </div>
              </td>
              <td className="px-8 py-6 text-center">
                <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5">
                  <Calendar size={12} /> {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-2">
                  {(currentUser?.role === 'SUPER' || (user.role !== 'SUPER' && user.id !== currentUser?.id)) && (
                    <>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => setResetPasswordId(user.id)}
                        title="비밀번호 초기화 (1234)"
                      >
                        <Key size={20} />
                      </Button>
                      
                      {user.role !== 'SUPER' && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(user.id)}
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                          title="계정 삭제"
                        >
                          <Trash2 size={20} />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {!loading && filteredUsers.length === 0 && (
            <tr>
              <td colSpan={4}>
                <EmptyState 
                  icon={<Users />}
                  title="사용자를 찾을 수 없습니다."
                  description="검색어나 필터를 확인해 주세요."
                />
              </td>
            </tr>
          )}
        </Table>
        
        {!loading && totalPages > 1 && (
          <div className="pb-8">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="사용자 계정 삭제"
        size="sm"
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirmId(null)}>취소</Button>
            <Button variant="danger" className="flex-1" onClick={() => handleDeleteUser(deleteConfirmId!)}>계정 삭제</Button>
          </>
        }
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            정말로 이 사용자 계정을 삭제하시겠습니까?<br/>
            삭제된 계정은 다시 복구할 수 없습니다.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={!!resetPasswordId}
        onClose={() => setResetPasswordId(null)}
        title="비밀번호 초기화"
        size="sm"
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setResetPasswordId(null)}>취소</Button>
            <Button variant="primary" className="flex-1" onClick={() => handleResetPassword(resetPasswordId!)}>초기화 진행</Button>
          </>
        }
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key size={32} />
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            해당 계정의 비밀번호를 <strong>1234</strong>로 초기화하시겠습니까?
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="새 계정 생성"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">성명</label>
            <input 
              type="text" 
              required 
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              placeholder="홍길동"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">아이디</label>
            <input 
              type="text" 
              required 
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              placeholder="example_id"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">초기 비밀번호</label>
            <input 
              type="password" 
              required 
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                  placeholder="••••••••"
                                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold transition-all"
                                />
                                <PasswordStrengthIndicator password={newUser.password} />
                              </div>
              
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">권한 설정</label>
            <div className="grid grid-cols-2 gap-3">
              {['ADMIN', 'TECHNICIAN'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setNewUser({...newUser, role: role as any})}
                  className={`py-4 rounded-2xl border text-xs font-black transition-all ${
                    newUser.role === role 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            {currentUser?.role === 'SUPER' && (
              <button
                type="button"
                onClick={() => setNewUser({...newUser, role: 'SUPER'})}
                className={`w-full mt-3 py-4 rounded-2xl border text-xs font-black transition-all ${
                  newUser.role === 'SUPER' 
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                SUPER (최고 관리자)
              </button>
            )}
          </div>

          {newUser.role === 'TECHNICIAN' && (
            <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-indigo-600">소속 협력사 지정</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    required
                    value={newUser.partnerId}
                    onChange={(e) => {
                      const p = partners.find(item => item.id === e.target.value);
                      setNewUser({
                        ...newUser, 
                        partnerId: e.target.value,
                        partnerName: p ? p.name : ''
                      });
                    }}
                    className="w-full pl-11 pr-4 py-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold appearance-none transition-all"
                  >
                    <option value="">협력사를 선택해 주세요</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" size="xl" className="w-full">
              계정 생성 완료
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
