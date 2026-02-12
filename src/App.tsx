
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Camera, Bell, Settings, LogOut, ChevronRight, Menu, X, Plus, Info, Briefcase, Lock, ShieldCheck, Trash2, Key, AlertCircle, RefreshCw, Shield, User as UserIcon, Home, UserPlus, Users } from 'lucide-react';
import { INITIAL_PROJECTS, INITIAL_PARTNERS } from '@/config/constants';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Project, ProjectStatus, Partner, Technician } from '@/types';
import { db, User } from '@/services/db';
import AdminDashboard from '@/pages/AdminDashboard';
import TechnicianDashboard from '@/pages/TechnicianDashboard';
import FieldSubmission from '@/pages/FieldSubmission';
import ProjectDetail from '@/pages/ProjectDetail';
import PartnerManagement from '@/pages/PartnerManagement';
import AddProject from '@/pages/AddProject';
import ProjectManagement from '@/pages/ProjectManagement';
import SecuritySettings from '@/pages/SecuritySettings';
import TechnicianRegistration from '@/pages/TechnicianRegistration';
import AccountSettings from '@/pages/AccountSettings';
import UserManagement from '@/pages/UserManagement';

<SpeedInsights/>

const LoginModal = ({ onLogin, onCancel }: { onLogin: (user: User) => void, onCancel: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');
    
    try {
      // db.login은 이제 타임아웃 처리가 되어 있어 무한정 대기하지 않습니다.
      const user = await db.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err: any) {
      console.error('Login attempt failed:', err);
      setError(err.message || '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      // 어떤 상황에서도 로딩 상태를 해제하여 버튼을 다시 활성화합니다.
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <form onSubmit={handleLogin} className="bg-white w-full max-w-sm p-8 rounded-[32px] shadow-2xl space-y-6 animate-in zoom-in-95">
        <div className="text-center">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">시스템 로그인</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">ON-Sight 보안 인증</p>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account ID</label>
            <input 
              type="text" 
              autoFocus
              disabled={loading}
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold disabled:opacity-50" 
              placeholder="아이디를 입력하세요" 
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              disabled={loading}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold disabled:opacity-50" 
              placeholder="비밀번호를 입력하세요" 
              required 
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-red-600 text-[11px] font-bold leading-tight">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RefreshCw className="animate-spin" size={18} /> 인증 확인 중...</>
            ) : '로그인'}
          </button>
          {!loading && (
            <button type="button" onClick={onCancel} className="w-full py-2 text-slate-400 font-bold text-xs hover:text-slate-600">닫기</button>
          )}
        </div>
      </form>
    </div>
  );
};

const Navbar = ({ currentUser, onLogout }: { currentUser: User | null, onLogout: () => void }) => {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs transition-transform group-hover:scale-105">ON</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">ON-<span className="text-indigo-600">Sight</span></span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
             {currentUser && (
               <>
                 <div className="flex flex-col items-end border-r border-slate-100 pr-4">
                   <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest leading-none mb-1">{currentUser.role}</span>
                   <span className="text-sm font-bold text-slate-700">{currentUser.name} 님</span>
                 </div>
                 <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="로그아웃"><LogOut size={20} /></button>
               </>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const BottomNav = ({ currentUser }: { currentUser: User | null }) => {
  if (!currentUser) return null;
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 pb-safe z-50 flex justify-around items-center">
      <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
        {({ isActive }) => (<><LayoutDashboard size={20} strokeWidth={isActive ? 3 : 2} /><span className="text-[10px] font-bold">홈</span></>)}
      </NavLink>
      
      {(currentUser.role === 'SUPER' || currentUser.role === 'ADMIN') && (
        <NavLink to="/projects" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
          {({ isActive }) => (<><ClipboardList size={20} strokeWidth={isActive ? 3 : 2} /><span className="text-[10px] font-bold">프로젝트</span></>)}
        </NavLink>
      )}

      <NavLink to="/submit" className="flex flex-col items-center justify-center -mt-8">
        <div className="w-14 h-14 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-200 flex items-center justify-center transform active:scale-95 transition-all">
          <Camera size={24} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold text-indigo-600 mt-1">촬영</span>
      </NavLink>

      {(currentUser.role === 'SUPER' || currentUser.role === 'ADMIN') && (
        <NavLink to="/partners" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
          {({ isActive }) => (<><Briefcase size={20} strokeWidth={isActive ? 3 : 2} /><span className="text-[10px] font-bold">협력사</span></>)}
        </NavLink>
      )}

      {currentUser.role === 'SUPER' && (
        <NavLink to="/security" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
          {({ isActive }) => (<><Settings size={20} strokeWidth={isActive ? 3 : 2} /><span className="text-[10px] font-bold">설정</span></>)}
        </NavLink>
      )}
    </div>
  );
};

const LoginLanding = ({ onShowLogin }: { onShowLogin: () => void }) => (
  <div className="h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
      <Shield size={40} />
    </div>
    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">보안 시스템 작동 중</h1>
    <p className="text-slate-500 mb-8 max-w-xs mx-auto font-medium">인가된 사용자만 접근할 수 있는 영역입니다.<br/>계정 인증 후 이용해 주시기 바랍니다.</p>
    <div className="flex flex-col w-full max-w-xs gap-3">
      <button 
        onClick={onShowLogin} 
        className="py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <Lock size={18} /> 시스템 로그인
      </button>
      <Link to="/register" className="py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all">현장 요원 계정 가입</Link>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(db.getCurrentUser());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!currentUser) {
      setProjects([]);
      setPartners([]);
      return;
    }
    try {
      const [proj, part] = await Promise.all([
        db.getAll<Project>('projects'),
        db.getAll<Partner>('partners')
      ]);
      setProjects(proj);
      setPartners(part);
    } catch (err) {
      console.error('Data fetch error:', err);
      setProjects([]);
      setPartners([]);
    }
  };

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
  };

  const addProject = async (p: Project) => { 
    try {
      await db.save('projects', p); 
      setProjects(prev => [p, ...prev]); 
    } catch(e) { alert('프로젝트 저장 실패: ' + (e as any).message); }
  };
  
  const addPartner = async (p: Partner) => { 
    try {
      await db.save('partners', p); 
      setPartners(prev => [...prev, p]); 
    } catch(e) { alert('협력사 저장 실패'); }
  };

  const deletePartner = async (id: string) => { 
    try {
      await db.delete('partners', id); 
      setPartners(prev => prev.filter(p => p.id !== id)); 
    } catch(e: any) { 
      console.error('Delete partner error:', e);
      throw e; 
    }
  };

  const updatePartner = async (p: Partner) => {
    try {
      await db.save('partners', p);
      setPartners(prev => prev.map(item => item.id === p.id ? p : item));
    } catch(e) { alert('협력사 수정 실패'); }
  };

  const updateProject = async (updated: Project) => {
    try {
      await db.save('projects', updated);
      setProjects(prev => prev.map(item => item.id === updated.id ? updated : item));
    } catch(e) { alert('프로젝트 업데이트 실패'); }
  };

  const updateStatus = async (id: string, status: ProjectStatus) => {
    const p = projects.find(item => item.id === id);
    if (!p) return;
    const updated = { ...p, status, lastUpdated: new Date().toISOString() };
    updateProject(updated);
  };

  const addTechnician = async (partnerId: string, tech: Technician) => {
    try {
      let partner = partners.find(p => p.id === partnerId);
      
      if (!partner) {
          const allPartners = await db.getAll<Partner>('partners');
          partner = allPartners.find(p => p.id === partnerId);
          if (!partner) return alert('협력사를 찾을 수 없습니다.');
          setPartners(allPartners);
      }

      const updated = { ...partner, technicians: [...partner.technicians, tech] };
      await db.save('partners', updated);
      setPartners(prev => prev.map(p => p.id === partnerId ? updated : p));
    } catch(e) { alert('기술자 등록 실패'); }
  };

  const addReport = async (projectId: string, report: any) => {
    try {
      const updatedProject = await db.submitReport(projectId, report);
      setProjects(prev => prev.map(item => item.id === projectId ? updatedProject : item));
    } catch(e: any) { 
        alert('보고서 제출 실패: ' + e.message); 
    }
  };

  const updateSites = async (projectId: string, newSites: any[]) => {
    const p = projects.find(item => item.id === projectId);
    if (!p) return;
    
    const completedSiteIds = new Set(p.reports.map(r => r.siteId).filter(Boolean));
    const totalSites = newSites.length;
    let newProgress = 0;
    if (totalSites > 0) {
      const completedCount = newSites.filter(site => completedSiteIds.has(site.id)).length;
      newProgress = Math.round((completedCount / totalSites) * 100);
    }

    const updated = { ...p, sites: newSites, progress: newProgress, lastUpdated: new Date().toISOString() };
    try {
      await db.save('projects', updated);
      setProjects(prev => prev.map(item => item.id === projectId ? updated : item));
    } catch(e) { alert('사이트 업데이트 실패'); }
  };


  if (isLoading) return <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
    <RefreshCw className="animate-spin text-indigo-600" size={32} />
    <p className="text-slate-500 font-bold animate-pulse text-sm">시스템을 불러오는 중입니다...</p>
  </div>;

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col md:flex-row">
          {currentUser && (
            <div className="hidden md:flex sticky top-16 h-[calc(100vh-64px)] w-60 bg-white border-r border-slate-200 p-4 flex-col gap-1 z-40">
              <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                <LayoutDashboard size={20} /> 대시보드
              </NavLink>
              {(currentUser.role === 'SUPER' || currentUser.role === 'ADMIN') && (
                <>
                  <NavLink to="/projects" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <ClipboardList size={20} /> 프로젝트 관리
                  </NavLink>
                  <NavLink to="/partners" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Briefcase size={20} /> 협력사 관리
                  </NavLink>
                  <NavLink to="/users-management" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Users size={20} /> 계정 관리
                  </NavLink>
                </>
              )}
              {currentUser.role === 'SUPER' && (
                <NavLink to="/security" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Settings size={20} /> 시스템 설정
                </NavLink>
              )}
              <NavLink to="/submit" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Camera size={20} /> 보고서 작성
              </NavLink>
            </div>
          )}

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50">
            <div className="w-full h-full p-4 sm:p-6 lg:p-8">
              {!currentUser ? (
                <Routes>
                  <Route path="/" element={<LoginLanding onShowLogin={() => setShowLoginModal(true)} />} />
                  <Route path="/register" element={<TechnicianRegistration onAddTechnician={addTechnician} partners={partners} />} />
                  <Route path="/register-technician" element={<TechnicianRegistration onAddTechnician={addTechnician} partners={partners} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/" element={currentUser.role === 'TECHNICIAN' ? <TechnicianDashboard projects={projects} /> : <AdminDashboard projects={projects} />} />
                  <Route path="/projects" element={currentUser.role !== 'TECHNICIAN' ? <ProjectManagement projects={projects} /> : <Navigate to="/" />} />
                  <Route path="/projects/new" element={currentUser.role !== 'TECHNICIAN' ? <AddProject onAddProject={addProject} /> : <Navigate to="/" />} />
                  <Route path="/partners" element={currentUser.role !== 'TECHNICIAN' ? <PartnerManagement partners={partners} onAddPartner={addPartner} onUpdatePartner={updatePartner} onDeletePartner={deletePartner} /> : <Navigate to="/" />} />
                  <Route path="/project/:id" element={<ProjectDetail projects={projects} partners={partners} onUpdateStatus={updateStatus} onUpdateSites={updateSites} onUpdateProject={updateProject} />} />
                  <Route path="/security" element={currentUser.role === 'SUPER' ? <SecuritySettings /> : <Navigate to="/" />} />
                  <Route path="/account" element={<AccountSettings />} />
                  <Route path="/users-management" element={currentUser.role !== 'TECHNICIAN' ? <UserManagement /> : <Navigate to="/" />} />
                  <Route path="/submit" element={<FieldSubmission projects={projects} partners={partners} onAddReport={addReport} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              )}
            </div>
          </main>
        </div>

        {showLoginModal && <LoginModal onLogin={handleLogin} onCancel={() => setShowLoginModal(false)} />}
        <BottomNav currentUser={currentUser} />
      </div>
    </HashRouter>
  );
};

export default App;
