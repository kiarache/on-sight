import React, { useState } from 'react';
import { User, Lock, Save, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/db';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = db.getCurrentUser();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      return alert('비밀번호가 일치하지 않습니다.');
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('onsight_token')}`
        },
        body: JSON.stringify({ name, password: password || undefined })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '정보 수정 실패');
      }

      const updatedUser = await res.json();
      // 로컬 스토리지 정보 갱신
      localStorage.setItem('onsight_user', JSON.stringify(updatedUser));
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('onsight_token')}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '탈퇴 처리 중 오류가 발생했습니다.');
      }

      // 로그아웃 처리 및 이동
      db.logout();
      window.location.href = '/';
    } catch (err: any) {
      alert(err.message);
      setShowWithdrawModal(false);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">내 계정 관리</h1>
          <p className="text-slate-500 text-sm font-medium">개인 정보 및 비밀번호를 안전하게 변경하세요.</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
        {isSuccess && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
            <CheckCircle2 size={48} className="text-emerald-500 mb-2" />
            <p className="text-lg font-black text-slate-900">정보가 수정되었습니다</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">아이디 (변경 불가)</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" 
                  value={currentUser?.username || ''} 
                  disabled 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-bold cursor-not-allowed" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">성명</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-base font-bold" 
                  required 
                />
              </div>
            </div>

            <div className="h-px bg-slate-100 my-2"></div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">새 비밀번호 (변경 시에만 입력)</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="********"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-base font-bold" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">비밀번호 확인</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="********"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-base font-bold" 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            변경 사항 저장
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest ml-1">위험 구역</h3>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="w-full py-4 border-2 border-red-100 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> 서비스 회원 탈퇴
            </button>
            <p className="text-[11px] text-slate-400 font-medium text-center leading-relaxed">
              탈퇴 시 계정 정보가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
          </div>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">정말 탈퇴하시겠습니까?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                탈퇴 시 기존 보고서 작성 이력 및 모든 계정 설정이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  disabled={isWithdrawing}
                  onClick={handleWithdraw} 
                  className="w-full py-4 text-sm font-black text-white bg-red-600 rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-slate-300"
                >
                  {isWithdrawing ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  네, 탈퇴하겠습니다
                </button>
                <button 
                  disabled={isWithdrawing}
                  onClick={() => setShowWithdrawModal(false)} 
                  className="w-full py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
