
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@/services/db';
import { UserPlus, Building2, User, Phone, CheckCircle2, ChevronLeft, Loader2, Key, Check, X, AlertCircle } from 'lucide-react';
import { Partner, Technician } from '@/types';
import { useToast } from '@/components/Toast';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

interface Props {
  onAddTechnician: (partnerId: string, tech: Technician) => void;
  partners: Partner[];
}

const TechnicianRegistration: React.FC<Props> = ({ onAddTechnician }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const pid = searchParams.get('pid');
  
  const [step, setStep] = useState<'terms' | 'form'>('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [publicPartners, setPublicPartners] = useState<{id: string, name: string}[]>([]);
  
  const [partnerId, setPartnerId] = useState(pid || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // 공약사항 및 이용약관 로드
    fetch('/api/system/settings')
      .then(res => res.json())
      .then(data => setTermsContent(data.terms || '약관을 불러올 수 없습니다.'))
      .catch(() => setTermsContent('약관을 불러오는 중 오류가 발생했습니다.'));

    // 협력사 목록 로드 (공개 API)
    fetch('/api/public/partners')
      .then(res => res.json())
      .then(data => setPublicPartners(data))
      .catch(err => console.error('Failed to fetch public partners:', err));
  }, []);

  const handleCheckUsername = async () => {
    if (!username.trim()) {
      toast('아이디를 입력해주세요.', 'error');
      return;
    }
    
    setUsernameCheckStatus('checking');
    try {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setUsernameCheckStatus(data.available ? 'available' : 'taken');
    } catch (error) {
      toast('중복 확인 중 오류가 발생했습니다.', 'error');
      setUsernameCheckStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameCheckStatus !== 'available') {
      toast('아이디 중복 확인을 먼저 진행해주세요.', 'error');
      return;
    }
    
    if (!partnerId || !username || !password || !name || !phone) return;

    setIsSubmitting(true);
    try {
      const selectedPartner = publicPartners.find(p => p.id === partnerId);
      
      await db.save('register', {
        id: `user-${Date.now()}`,
        username,
        password,
        name,
        role: 'TECHNICIAN',
        partnerId,
        partnerName: selectedPartner ? selectedPartner.name : '',
        createdAt: new Date().toISOString()
      });

      const newTech: Technician = {
        id: `TECH-${Date.now()}`,
        name,
        phone,
        joinedAt: new Date().toISOString()
      };
      
      onAddTechnician(partnerId, newTech);
      setIsSuccess(true);
    } catch (err: any) {
      toast('등록 중 오류가 발생했습니다: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">가입이 완료되었습니다!</h2>
        <p className="text-slate-500 mb-8 font-medium">이제 설정하신 아이디로 로그인하여<br/>현장 보고서를 작성할 수 있습니다.</p>
        <button onClick={() => navigate('/')} className="w-full max-w-xs py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl">홈으로 이동</button>
      </div>
    );
  }

  if (step === 'terms') {
    return (
      <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-12">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-black text-slate-900">개인정보 수집 및 이용 동의</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">서비스 이용을 위해 아래 약관에 동의해주세요.</p>
        </header>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-h-96 overflow-y-auto">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">{termsContent}</pre>
          </div>

          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
            <button
              onClick={() => setTermsAccepted(!termsAccepted)}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                termsAccepted ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
              }`}
            >
              {termsAccepted && <Check size={16} className="text-white" />}
            </button>
            <label className="text-sm font-bold text-slate-900 cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
              위 내용을 모두 확인하였으며 동의합니다.
            </label>
          </div>

          <button
            onClick={() => setStep('form')}
            disabled={!termsAccepted}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-md shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:bg-slate-300 disabled:shadow-none"
          >
            다음 단계로
          </button>
        </div>

        <button onClick={() => navigate(-1)} className="mt-8 w-full flex items-center justify-center gap-2 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors">
          <ChevronLeft size={14} /> 이전으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="mb-8 text-center">
        <div className="w-14 h-14 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
          <UserPlus size={28} />
        </div>
        <h1 className="text-xl font-black text-slate-900">현장 요원 계정 생성</h1>
        <p className="text-slate-500 text-xs mt-1 font-medium">본인의 정보를 등록하고 현장 관리 시스템에 접속하세요.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">소속 협력사 선택</label>
            <div className="relative">
              <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-base font-bold appearance-none" required>
                <option value="">협력사를 검색/선택하세요</option>
                {publicPartners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">사용하고 싶은 아이디</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameCheckStatus('idle');
                  }} 
                  placeholder="ID 입력" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold" 
                  required 
                />
              </div>
              <button
                type="button"
                onClick={handleCheckUsername}
                disabled={usernameCheckStatus === 'checking'}
                className="px-4 py-3.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors disabled:bg-slate-300 whitespace-nowrap"
              >
                {usernameCheckStatus === 'checking' ? <Loader2 className="animate-spin" size={16} /> : '중복 확인'}
              </button>
            </div>
            {usernameCheckStatus === 'available' && (
              <p className="text-xs text-emerald-600 font-bold mt-1.5 ml-1 flex items-center gap-1">
                <Check size={14} /> 사용 가능한 아이디입니다.
              </p>
            )}
            {usernameCheckStatus === 'taken' && (
              <p className="text-xs text-red-600 font-bold mt-1.5 ml-1 flex items-center gap-1">
                <X size={14} /> 이미 사용중인 아이디입니다.
              </p>
            )}
          </div>

          <div>
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">비밀번호</label>
             <div className="relative">
                <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PW 입력" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold" required />
             </div>
             <PasswordStrengthIndicator password={password} />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">성명</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="실명" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold" required />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">연락처</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold" required />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting || usernameCheckStatus !== 'available'} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-md shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none">
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : '계정 생성 및 등록'}
        </button>
      </form>

      <button onClick={() => navigate(-1)} className="mt-8 w-full flex items-center justify-center gap-2 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors">
        <ChevronLeft size={14} /> 이전으로 돌아가기
      </button>
    </div>
  );
};

export default TechnicianRegistration;

