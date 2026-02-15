import React from 'react';

interface Props {
  password?: string;
}

const PasswordStrengthIndicator: React.FC<Props> = ({ password = '' }) => {
  const getStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: 'bg-slate-200' };
    
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw) || /[a-z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    if (score <= 1) return { score, label: '약함', color: 'bg-red-500' };
    if (score === 2) return { score, label: '보통', color: 'bg-amber-500' };
    if (score === 3) return { score, label: '강함', color: 'bg-indigo-500' };
    return { score, label: '매우 강함', color: 'bg-emerald-500' };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">비밀번호 강도</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${strength.color.replace('bg-', 'text-')}`}>
          {strength.label}
        </span>
      </div>
      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step} 
            className={`h-full flex-1 transition-all duration-500 ${
              step <= strength.score ? strength.color : 'bg-slate-200'
            }`} 
          />
        ))}
      </div>
      <p className="text-[9px] text-slate-400 font-medium">
        8자 이상, 영문/숫자/특수문자를 조합하면 안전합니다.
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
