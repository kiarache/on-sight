
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Project, ProjectStatus } from '@/types';
import { ArrowUpRight, Clock, Plus, Target, Users, Zap, RefreshCw } from 'lucide-react';

interface Props {
  projects: Project[];
}

const REFRESH_OPTIONS = [
  { label: '30초', value: 30000 },
  { label: '1분', value: 60000 },
  { label: '5분', value: 300000 },
];

const AdminDashboard: React.FC<Props> = ({ projects }) => {
  const navigate = useNavigate();
  const [refreshInterval, setRefreshInterval] = useState(60000); 
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState(60000);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setTimeLeft(refreshInterval);
      setIsRefreshing(false);
    }, 600);
  }, [refreshInterval]);

  useEffect(() => {
    setTimeLeft(refreshInterval);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          handleManualRefresh();
          return refreshInterval;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshInterval, handleManualRefresh]);

  const statusCounts = {
    [ProjectStatus.PLANNING]: projects.filter(p => p.status === ProjectStatus.PLANNING).length,
    [ProjectStatus.IN_PROGRESS]: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
    [ProjectStatus.REVIEW]: projects.filter(p => p.status === ProjectStatus.REVIEW).length,
    [ProjectStatus.COMPLETED]: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
  };

  const stats = [
    { label: '전체 프로젝트', value: projects.length, icon: <Target className="text-indigo-600" size={24} />, bg: 'bg-indigo-50' },
    { label: '진행중 프로젝트', value: statusCounts[ProjectStatus.IN_PROGRESS] + statusCounts[ProjectStatus.REVIEW], icon: <Zap className="text-amber-600" size={24} />, bg: 'bg-amber-50' },
    { label: '완료된 사업', value: statusCounts[ProjectStatus.COMPLETED], icon: <Target className="text-emerald-600" size={24} />, bg: 'bg-emerald-50' },
    { label: '전체 구축 개소', value: projects.reduce((acc, p) => acc + (p.sites?.length || 0), 0), icon: <Users className="text-blue-600" size={24} />, bg: 'bg-blue-50' },
  ];

  const barChartData = projects.slice(0, 8).map(p => ({
    name: p.name,
    progress: p.progress
  }));

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#94a3b8', '#6366f1', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">현장 공정 현황</h1>
          <p className="text-slate-500 text-sm">실시간 진척도 및 사업별 데이터를 모니터링합니다.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto Refresh</span>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              {REFRESH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button onClick={handleManualRefresh} className={`p-1 hover:text-indigo-600 transition-colors ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-300'}`}>
              <RefreshCw size={14} />
            </button>
          </div>

          <button 
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={18} /> 사업 등록
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:border-indigo-200">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-slate-800">주요 사업 진척률</h3>
            <span className="text-[10px] text-slate-400 font-medium">업데이트: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fill: '#64748b', fontWeight: 700 }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '14px', fontWeight: 700 }}
                />
                <Bar dataKey="progress" radius={[6, 6, 0, 0]} barSize={40}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.progress > 90 ? '#10b981' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-6">프로젝트 상태</h3>
          <div className="flex-1 min-h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{projects.length}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Projects</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <div className="flex justify-between flex-1 items-center">
                   <span className="text-[10px] font-medium text-slate-500">{entry.name}</span>
                   <span className="text-xs font-bold text-slate-700">{entry.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
