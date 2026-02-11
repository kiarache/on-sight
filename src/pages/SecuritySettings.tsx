import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Save, 
  Server, 
  Database, 
  Globe, 
  RefreshCw,
  FileText,
  Info,
  Download,
  Power,
  AlertTriangle
} from 'lucide-react';

const SecuritySettings: React.FC = () => {
  const [terms, setTerms] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [health, setHealth] = useState({
    backend: 'checking',
    db: 'checking',
    frontend: 'online'
  });
  const [lastCheck, setLastCheck] = useState(new Date());

  const fetchStatus = () => {
    setLastCheck(new Date());
    setHealth(prev => ({ ...prev, backend: 'checking', db: 'checking' }));
    
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealth({
          backend: data.status === 'ok' ? 'online' : 'offline',
          db: data.database === 'ok' ? 'online' : 'offline',
          frontend: 'online'
        });
      })
      .catch(() => {
        setHealth({ backend: 'offline', db: 'offline', frontend: 'online' });
      });
  };

  const fetchTerms = () => {
    fetch('/api/system/settings')
      .then(res => res.json())
      .then(data => setTerms(data.terms || ''))
      .catch(() => {});
  };

  useEffect(() => {
    fetchTerms();
    fetchStatus();
  }, []);

  const handleSaveTerms = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/system/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('onsight_token')}`
        },
        body: JSON.stringify({ terms })
      });
      if (res.ok) {
        alert('시스템 약관이 저장되었습니다.');
      }
    } catch (e) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/system/backup', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('onsight_token')}`
        }
      });
      if (!res.ok) throw new Error();
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onsight_db_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('백업 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleRestartService = async () => {
    if (!confirm('정말로 서비스를 재기동하시겠습니까? 약 10~20초간 서비스 이용이 불가능할 수 있습니다.')) return;
    
    try {
      const res = await fetch('/api/system/restart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('onsight_token')}`
        }
      });
      if (res.ok) {
        alert('재기동 요청을 보냈습니다. 서버가 다시 시작될 때까지 잠시만 기다려 주세요.');
        setTimeout(() => window.location.reload(), 5000);
      }
    } catch (e) {
      alert('재기동 요청 중 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'online') return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (status === 'offline') return 'text-red-500 bg-red-50 border-red-100';
    return 'text-amber-500 bg-amber-50 border-amber-100';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header>
        <h1 className="text-3xl font-black text-slate-900">시스템 설정 및 관리</h1>
        <p className="text-slate-500 text-base font-medium mt-2">솔루션 기술 지원 환경 및 보안 설정을 관리합니다.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 시스템 상태 모니터링 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Settings size={20} className="text-indigo-600" /> 솔루션 정보
              </h2>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">Stable v1.0</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">솔루션 명칭</span>
                <span className="text-sm font-black text-slate-900">ON-Sight (Workplace)</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">현재 버전</span>
                <span className="text-sm font-black text-indigo-600">v1.2.4</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">구축 모드</span>
                <span className="text-sm font-black text-slate-900">Production</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" /> 인프라 상태
              </h2>
              <button 
                onClick={fetchStatus}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Frontend', status: health.frontend, icon: <Globe size={18} /> },
                { label: 'Backend Server', status: health.backend, icon: <Server size={18} /> },
                { label: 'Database Service', status: health.db, icon: <Database size={18} /> },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400">{item.icon}</div>
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(item.status)}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'online' ? 'bg-emerald-500' : (item.status === 'offline' ? 'bg-red-500' : 'bg-amber-500')}`}></div>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-6 text-center font-medium">최종 점검: {lastCheck.toLocaleString()}</p>
          </div>

          {/* 시스템 제어 (SUPER 관리자 전용) */}
          <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 shadow-xl shadow-slate-200">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-8">
              <Settings size={20} className="text-indigo-400" /> 시스템 제어
            </h2>
            
            <div className="space-y-3">
              <button 
                onClick={handleDownloadBackup}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Download size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-white">DB 백업 다운로드</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">JSON Format</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={handleRestartService}
                className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                    <Power size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-red-500">서비스 재기동</p>
                    <p className="text-[10px] text-red-400/60 font-bold uppercase tracking-tight">Force Restart</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                재기동 시 현재 진행 중인 모든 작업이 중단될 수 있습니다. 반드시 사용자 접속이 적은 시간대에 수행하십시오.
              </p>
            </div>
          </div>
        </div>

        {/* 약관 관리 */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-amber-600" /> 서비스 이용약관 관리
              </h2>
              <button 
                onClick={handleSaveTerms}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-slate-300"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                설정 저장
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-[500px]">
              <div className="mb-4 p-5 bg-amber-50 text-amber-900 rounded-2xl border border-amber-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center text-amber-900 shrink-0">
                  <Info size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black">관리자 안내사항</p>
                  <p className="text-xs font-bold opacity-80 leading-relaxed">
                    수정된 약관은 신규 계정 가입 시 즉시 적용됩니다. 개인정보 처리방침 등 중요 정책 변경 시 반드시 업데이트 바랍니다.
                  </p>
                </div>
              </div>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="flex-1 w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-base font-medium leading-relaxed resize-none custom-scrollbar"
                placeholder="시스템 이용약관 내용을 입력하세요..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
