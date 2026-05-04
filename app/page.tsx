'use client';
import React, { useState, useEffect } from 'react';
import {
  Brain, Home, LayoutGrid, Sparkles, Timer, CheckSquare,
  FileText, Library, Trophy, BarChart3, Target, Settings,
  LifeBuoy, LogOut, Quote, Flame, Hexagon, Code, Type,
  FlaskConical, Atom, Clock, CheckCircle2, Zap, ChevronRight,
  ChevronDown, Medal, Sun, Check, Search, Book, PlayCircle
} from 'lucide-react';
import {
  SubjectsView, AiAssistantView, PomodoroView, TasksView,
  NotesView, QuestionBankView, AchievementsView, LeaderboardView
} from './views';
import { loginWithGoogle, logoutUser } from './firebase';
import { useAuthUser, useUserData, useTasks } from './hooks/useData';


const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-zinc-800/80 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>
    <Icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
    <span className="font-medium text-[14px]">{label}</span>
  </div>
);

const NavSection = ({ activeTab, onChange }: { activeTab: string, onChange: (t: string) => void }) => (
  <nav className="flex flex-col gap-1 mt-6">
    <SidebarItem icon={Home} label="Ana Sayfa" active={activeTab === 'Ana Sayfa'} onClick={() => onChange('Ana Sayfa')} />
    <SidebarItem icon={LayoutGrid} label="Konular" active={activeTab === 'Konular'} onClick={() => onChange('Konular')} />
    <SidebarItem icon={Sparkles} label="AI Asistan" active={activeTab === 'AI Asistan'} onClick={() => onChange('AI Asistan')} />
    <SidebarItem icon={Timer} label="Pomodoro" active={activeTab === 'Pomodoro'} onClick={() => onChange('Pomodoro')} />
    <SidebarItem icon={CheckSquare} label="Görevler" active={activeTab === 'Görevler'} onClick={() => onChange('Görevler')} />
    <SidebarItem icon={FileText} label="Notlarım" active={activeTab === 'Notlarım'} onClick={() => onChange('Notlarım')} />
    <SidebarItem icon={Library} label="Soru Bankası" active={activeTab === 'Soru Bankası'} onClick={() => onChange('Soru Bankası')} />
    <SidebarItem icon={Trophy} label="Başarımlar" active={activeTab === 'Başarımlar'} onClick={() => onChange('Başarımlar')} />
    <SidebarItem icon={BarChart3} label="Leaderboard" active={activeTab === 'Leaderboard'} onClick={() => onChange('Leaderboard')} />
  </nav>
);

const ProgressRing = ({ progress, className = "" }: { progress: number, className?: string }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-10 h-10 transform -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-zinc-800"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-emerald-500 transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-zinc-200">{progress}%</span>
    </div>
  );
};

const Heatmap = () => {
  const [mounted, setMounted] = useState(false);
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Custom generated map to mimic the screenshot
  const generateColor = (r: number, c: number) => {
    if (c < 2) return 'bg-[#1e1e20]';
    if (r === 0 && (c === 4 || c === 7 || c === 8 || c === 10)) return 'bg-emerald-500';
    if (r === 1 && (c === 3 || c === 4 || c === 5 || c === 9 || c === 11)) return 'bg-emerald-600';
    if (r === 2 && (c === 3 || c === 7 || c === 9 || c === 10)) return 'bg-emerald-400';
    if (r === 3 && (c === 2 || c === 3 || c === 8 || c === 9 || c === 10)) return 'bg-emerald-500';
    if (r === 4 && (c === 3 || c === 5 || c === 8 || c === 9)) return 'bg-emerald-600';
    if (r === 5 && (c === 2 || c === 6 || c === 8 || c === 9)) return 'bg-emerald-500';
    if (r === 6 && (c === 7 || c === 8)) return 'bg-emerald-400';
    
    // Deterministic pseudo-random pattern replacing Math.random()
    const pseudoRandom = (r * 17 + c * 23) % 100;
    if (pseudoRandom > 80 && c > 1) return 'bg-emerald-900/40';
    return 'bg-[#1e1e20]';
  };

  if (!mounted) {
    return (
      <div className="flex flex-col gap-3 opacity-0">
        <div className="flex gap-2 text-[11px] text-zinc-500 font-medium">
          <div className="flex flex-col gap-[6px] pt-1 pr-1">
            {days.map(d => <div key={d} className="h-3.5 leading-[14px]">{d}</div>)}
          </div>
          <div className="flex gap-[6px] flex-1">
            {Array.from({length: 12}).map((_, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-[6px] flex-1">
                {Array.from({length: 7}).map((_, rowIndex) => {
                  return <div key={`${colIndex}-${rowIndex}`} className={`w-full aspect-square rounded-[3px] bg-[#1e1e20]`} />
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 text-[11px] text-zinc-500 font-medium">
        <div className="flex flex-col gap-[6px] pt-1 pr-1">
          {days.map(d => <div key={d} className="h-3.5 leading-[14px]">{d}</div>)}
        </div>
        <div className="flex gap-[6px] flex-1">
          {Array.from({length: 12}).map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-[6px] flex-1">
              {Array.from({length: 7}).map((_, rowIndex) => {
                return <div key={`${colIndex}-${rowIndex}`} className={`w-full aspect-square rounded-[3px] ${generateColor(rowIndex, colIndex)}`} />
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center text-[11px] text-zinc-500 font-medium mt-2">
        <span>Daha az</span>
        <div className="flex gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#1e1e20]" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-900/40" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-700/60" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-600" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-500" />
        </div>
        <span>Daha çok</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Ana Sayfa');
  const { user, loading } = useAuthUser();
  const { userData } = useUserData(user?.uid);

  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center font-sans"><div className="animate-pulse flex items-center gap-2"><Brain className="w-8 h-8 text-emerald-500" /><span className="font-bold text-xl">Yükleniyor...</span></div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center font-sans p-4">
         <div className="max-w-md w-full bg-[#141416] border border-white/5 p-8 rounded-3xl flex flex-col items-center">
            <Brain className="w-16 h-16 text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">StudyHub'a Hoş Geldin</h1>
            <p className="text-zinc-400 text-center mb-8 font-medium">Odaklanmak ve hedeflerine ulaşmak için giriş yap.</p>
            <button 
              onClick={loginWithGoogle}
              className="w-full bg-white text-zinc-900 font-bold text-[15px] py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3"
            >
              Google ile Giriş Yap
            </button>
         </div>
      </div>
    );
  }

  const xp = userData?.xp || 0;
  const level = userData?.level || 1;
  const dailyStreak = userData?.dailyStreak || 0;
  const totalStudyTime = userData?.totalStudyTime || 0;
  const pomodorosCompleted = userData?.pomodorosCompleted || 0;
  const xpNeeded = level * 500;
  const progressPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans selection:bg-zinc-800">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-[#1e1e20] flex flex-col p-4 bg-[#0a0a0c]">
        <div className="flex justify-between items-center px-4 pt-2 pb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-zinc-100" />
            <span className="font-bold tracking-tight text-base pt-0.5">StudyHub</span>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors" />
        </div>

        <NavSection activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-auto bg-gradient-to-t pt-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-white/5 bg-[#121214] overflow-hidden relative">
             <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-800/20 blur-xl rounded-full" />
            <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg border border-zinc-700 shadow-inner z-10 text-emerald-400">
              {user.email?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex-1 z-10 min-w-0">
              <div className="flex items-center justify-between shadow-sm">
                <h4 className="font-semibold text-[14px] truncate">{user.email?.split('@')[0] || 'Öğrenci'}</h4>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium mb-1.5 mt-0.5">Seviye {level}</p>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{width: `${progressPercent}%`}} />
              </div>
              <p className="text-[10px] text-zinc-500 font-medium mt-1 text-center pr-1">{xp} / {xpNeeded} XP</p>
            </div>
          </div>

          <button onClick={() => setActiveTab('Pomodoro')} className="w-full mt-3 flex items-center justify-center gap-2.5 py-3 rounded-xl border border-white/5 bg-[#121214] text-zinc-300 hover:bg-zinc-800/80 transition-colors group">
            <Target className="w-[18px] h-[18px] text-zinc-400 group-hover:text-zinc-200 transition-colors" strokeWidth={2} />
            <span className="font-medium text-[14px]">Odak Modu</span>
          </button>

          <div className="flex justify-around mt-4 pt-1 px-2 border-transparent">
            <div className="p-2 border border-transparent hover:border-[#1e1e20] hover:bg-[#1e1e20]/50 rounded-xl cursor-pointer transition-all">
                <Settings className="w-5 h-5 text-zinc-500 hover:text-zinc-300 transition-colors" strokeWidth={2} />
            </div>
            <div className="p-2 border border-transparent hover:border-[#1e1e20] hover:bg-[#1e1e20]/50 rounded-xl cursor-pointer transition-all">
                <LifeBuoy className="w-5 h-5 text-zinc-500 hover:text-zinc-300 transition-colors" strokeWidth={2} />
            </div>
            <div onClick={logoutUser} className="p-2 border border-transparent hover:border-[#1e1e20] hover:bg-[#1e1e20]/50 rounded-xl cursor-pointer transition-all">
                <LogOut className="w-5 h-5 text-zinc-500 hover:text-zinc-300 transition-colors" strokeWidth={2} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className={`p-8 pb-10 flex-1 ${activeTab === 'Pomodoro' || activeTab === 'AI Asistan' ? 'w-full' : 'max-w-[1400px] w-full'}`}>
          
          {activeTab === 'Ana Sayfa' ? (
            <>
              {/* Header */}
              <header className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    Merhaba, {user.email?.split('@')[0] || 'Öğrenci'}! <span className="text-2xl animate-pulse">👋</span>
                  </h1>
              <p className="text-zinc-400 mt-2 text-[15px] font-medium">Bugün harika bir gün, odaklan ve ilerlemeye devam et.</p>
            </div>
            <button className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] border border-[#27272a] bg-[#141416]/50 hover:bg-[#1e1e20] transition-colors text-[13px] font-bold text-zinc-200">
              <Quote className="w-4 h-4 text-zinc-400" />
              AI Motivasyon
            </button>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#141416] border border-white/5 rounded-[22px] p-5 flex flex-col justify-between h-[125px] overflow-hidden relative">
              <div className="flex gap-4 relative z-10 w-full pt-1">
                <div className="shrink-0 mt-0.5">
                   <Flame className="w-[42px] h-[42px] text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)] fill-amber-500/10" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col ml-1 leading-none">
                  <div className="text-[34px] font-bold tracking-tight mt-[-2px]">{dailyStreak}</div>
                  <div className="text-zinc-400 text-[14px] font-medium font-sans mt-1">Günlük Seri</div>
                </div>
              </div>
              <div className="text-[12px] text-zinc-500 font-medium z-10 mt-auto">Ateşini söndürme!</div>
            </div>

            <div className="bg-[#141416] border border-white/5 rounded-[22px] p-5 flex flex-col justify-between h-[125px] relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="text-zinc-400 text-[13px] font-medium mb-1">Mevcut XP</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-bold tracking-tight">{xp}</span>
                    <span className="text-zinc-500 text-[13px] font-medium">/ {xpNeeded}</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto w-[100%] mb-1 relative z-10">
                 <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${progressPercent}%` }} />
                 </div>
              </div>
            </div>

            <div className="bg-[#141416] border border-white/5 rounded-[22px] p-5 flex flex-col justify-between h-[125px]">
              <div className="flex justify-between">
                <div>
                   <div className="text-zinc-400 text-[13px] font-medium mb-2">Seviye</div>
                   <div className="text-[26px] font-bold tracking-tight leading-none text-white">{level}</div>
                </div>
                <div className="grid place-items-center">
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <Hexagon className="w-12 h-12 text-zinc-800/80 absolute fill-[#1a1a1c]" strokeWidth={1} />
                    <span className="font-bold text-white relative z-10 text-[15px]">{level}</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto z-10">
                 <div className="text-[12px] text-zinc-500 font-medium mb-2">Sonraki seviye: {level + 1}</div>
              </div>
            </div>

            <div className="bg-[#141416] border border-white/5 rounded-[22px] p-5 flex flex-col justify-between h-[125px] relative overflow-hidden">
              <div className="text-zinc-400 text-[13px] font-medium mb-1 relative z-10">Pomodoro</div>
              <div className="flex items-baseline gap-1.5 z-10 relative">
                <span className="text-[28px] font-bold tracking-tight">{pomodorosCompleted}</span>
              </div>
              <div className="text-[12px] text-zinc-500 font-medium z-10 mt-auto">Tamamlanan oturum</div>
              
              {/* Decorative mini bar chart overlay in the background similar to image */}
              <div className="absolute -right-2 top-8 flex items-end gap-[6px] opacity-[0.15] -rotate-12 translate-y-4">
                 {/* Tall soft bars */}
                 {[40, 65, 35, 80, 50, 100].map((h, i) => (
                    <div key={i} className="w-4 bg-white rounded-t-[4px] blur-[1px]" style={{height: `${h}px`}} />
                 ))}
              </div>
               <div className="absolute right-5 bottom-[22px] flex items-end gap-1.5 opacity-50 z-0">
                <div className="w-[10px] h-4 bg-zinc-700/80 rounded-[2px]" />
                <div className="w-[10px] h-6 bg-zinc-700/80 rounded-[2px]" />
                <div className="w-[10px] h-10 bg-zinc-700/80 rounded-[2px]" />
                <div className="w-[10px] h-8 bg-zinc-600/80 rounded-[2px]" />
                <div className="w-[10px] h-14 bg-zinc-600/80 rounded-[2px]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
            
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              
              {/* Tasks Card */}
              <section className="bg-[#141416] border border-white/5 rounded-[24px] p-[22px]">
                <div className="flex justify-between items-center mb-5 px-1">
                  <h2 className="text-[17px] font-bold text-white tracking-wide">Bugünkü Görevlerin</h2>
                  <button className="text-[12px] font-bold text-zinc-400 hover:text-white px-3.5 py-1.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors tracking-wide">Tümünü Gör</button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {[
                    { icon: <span className="font-serif italic text-lg font-semibold text-zinc-400 drop-shadow-md">f(x)</span>, title: 'Matematik', desc: 'Türev konusunu bitir', xp: '+80 XP', progress: 60, iconBg: 'bg-[#18181b]' },
                    { icon: <Atom className="w-6 h-6 text-zinc-400 drop-shadow-md" strokeWidth={1.5} />, title: 'Fizik', desc: 'Hareket kanunları testini çöz', xp: '+70 XP', progress: 25, iconBg: 'bg-[#18181b]' },
                    { icon: <Code className="w-5 h-5 text-zinc-400 drop-shadow-md" strokeWidth={2} />, title: 'Programlama', desc: 'Döngüler konusunu tamamla', xp: '+60 XP', progress: 0, iconBg: 'bg-[#18181b]' },
                    { icon: <span className="font-bold text-[22px] font-serif text-zinc-400 leading-none">A</span>, title: 'İngilizce', desc: 'Kelime çalışması yap', xp: '+40 XP', progress: 0, iconBg: 'bg-[#18181b]' },
                  ].map((task, i) => (
                    <div key={i} className="flex items-center justify-between p-[14px] rounded-[18px] bg-[#18181B]/50 border border-white/5 hover:border-white/10 hover:bg-[#18181B] transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-[56px] h-[56px] rounded-2xl ${task.iconBg} border border-white-[0.03] flex items-center justify-center shadow-sm shrink-0`}>
                          {task.icon}
                        </div>
                        <div className="flex flex-col">
                          <div className="font-bold text-[15px] mb-[3px] text-zinc-100 tracking-wide">{task.title}</div>
                          <div className="text-[13px] text-zinc-400 font-medium tracking-wide truncate">{task.desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pr-1 shrink-0">
                        <div className={`text-[12px] font-bold text-amber-500 tracking-wider ${task.progress > 0 ? '' : 'opacity-80'}`}>
                           {task.xp}
                        </div>
                        <ProgressRing progress={task.progress} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Statistics */}
              <section className="bg-[#141416] border border-white/5 rounded-[24px] p-[22px]">
                <h2 className="text-[17px] font-bold mb-5 text-white tracking-wide px-1">İstatistiklerin</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: <Clock className="w-[18px] h-[18px] text-zinc-400" strokeWidth={2.5} />, label: 'Toplam Çalışma', value: '24s 30dk', sub: 'Bu hafta' },
                    { icon: <Target className="w-[18px] h-[18px] text-zinc-400" strokeWidth={2.5} />, label: 'Tamamlanan Görev', value: '18', sub: 'Bu hafta' },
                    { icon: <CheckCircle2 className="w-[18px] h-[18px] text-zinc-400" strokeWidth={2.5} />, label: 'Doğru Cevap Oranı', value: '%87', sub: 'Quizlerde' },
                    { icon: <Zap className="w-[18px] h-[18px] text-zinc-400" strokeWidth={2.5} />, label: 'Pomodoro Süresi', value: '12s 45dk', sub: 'Bu hafta' },
                  ].map((stat, i) => (
                     <div key={i} className="flex flex-col gap-[6px] p-4 rounded-[20px] bg-[#18181B]/50 border border-white/5 hover:bg-[#18181B] transition-colors cursor-pointer">
                      <div className="flex items-center gap-[6px] mb-1">
                        {stat.icon}
                        <span className="text-[11px] text-zinc-400 font-bold tracking-wide">{stat.label}</span>
                      </div>
                      <div className="text-[19px] font-bold text-white tracking-tight leading-none mt-1">{stat.value}</div>
                      <div className="text-[11px] text-zinc-500 font-medium">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Achievements */}
              <section className="bg-[#141416] border border-white/5 rounded-[24px] p-[22px]">
                <div className="flex justify-between items-center mb-5 px-1">
                  <h2 className="text-[17px] font-bold text-white tracking-wide">Yakın Zamandaki Başarımlar</h2>
                  <button className="text-[12px] font-bold text-zinc-400 hover:text-white px-3.5 py-1.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors tracking-wide">Tümünü Gör</button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                     { icon: <Flame className="w-8 h-8 text-amber-500 fill-amber-500/20" strokeWidth={1.5} />, title: '7 Günlük Seri', sub: 'Tebrikler!', shapeBg: 'bg-[#1e1e22]/80', borderOpacity: 'border-amber-500/10' },
                     { icon: <Check className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" strokeWidth={3} />, title: 'İlk Quiz', sub: 'Tebrikler!', shapeBg: 'bg-[#1a2e24]', borderOpacity: 'border-emerald-500/20' },
                     { icon: <Medal className="w-8 h-8 text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]" strokeWidth={1.5} />, title: '100 XP', sub: '100 XP kazandın', shapeBg: 'bg-[#262014]', borderOpacity: 'border-[#d4af37]/20' },
                     { icon: <div className="relative"><Timer className="w-8 h-8 text-zinc-400 drop-shadow-md" strokeWidth={1.5} /><div className="absolute right-0 bottom-0 w-[14px] h-[14px] bg-zinc-800 rounded-full border border-zinc-600 flex items-center justify-center text-[9px] font-extrabold text-zinc-200">5</div></div>, title: '5 Pomodoro', sub: '5 pomodoro tamamladın', shapeBg: 'bg-[#18181b]', borderOpacity: 'border-zinc-500/10'},
                     { icon: <Sun className="w-8 h-8 text-[#facc15] drop-shadow-[0_0_8px_rgba(250,204,21,0.2)]" strokeWidth={2} />, title: 'Sabahçı', sub: 'Sabah 7\'de çalıştın', shapeBg: 'bg-[#262014]', borderOpacity: 'border-[#facc15]/20' },
                  ].map((badge, i) => (
                    <div key={i} className="flex flex-col items-center justify-center py-5 px-2 rounded-[20px] bg-[#18181B]/50 border border-white/5 hover:bg-[#18181B] transition-colors cursor-pointer text-center group">
                       
                       <div className="relative w-[76px] h-[76px] mb-4 flex items-center justify-center">
                          {/* Outer glow ring styling */}
                          <div className="absolute inset-0 rounded-full border-[1.5px] border-zinc-800/80 bg-[#121214] shadow-inner" />
                          <div className={`absolute inset-[6px] rounded-full border ${badge.borderOpacity} ${badge.shapeBg} shadow-2xl flex items-center justify-center z-10 transition-transform group-hover:scale-105 duration-300`}>
                              {/* Inner metallic/solid background */}
                               {badge.icon}
                          </div>
                          
                           {/* Add polygonal mask via CSS for specific shapes if needed, but the image uses rounded badges/hexagons with solid borders */}
                           {/* To exactly match the image, the outer container is round, inner is abstract shapes. Let's stick to rounded for cleaner code since complex SVGs bloat the UI. The visual impact is achieved with colors. */}
                       </div>
                       
                       <div className="text-[13px] font-bold text-zinc-200 leading-tight mb-1">{badge.title}</div>
                       <div className="text-[11px] font-medium text-zinc-500 leading-tight line-clamp-1 break-all">{badge.sub}</div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              
              {/* Motivation Card */}
              <section className="bg-[#141416] border border-white/5 rounded-[24px] overflow-hidden relative min-h-[220px]">
                {/* Decorative background representing the mountain vector graphic */}
                <div className="absolute inset-0 bg-[#121214] opacity-50 pointer-events-none" />
                 {/* Vector art approximation */}
                 <div className="absolute inset-x-0 bottom-0 h-[65%] w-full opacity-[0.15]">
                   <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                     <path d="M0,100 L0,80 L20,60 L40,85 L65,40 L85,70 L100,60 L100,100 Z" fill="#ffffff" />
                   </svg>
                 </div>
                 <div className="absolute inset-x-0 bottom-0 h-[80%] w-full opacity-20 invert pt-10">
                   <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                     <path d="M0,100 L0,70 L30,40 L50,75 L75,30 L95,65 L100,50 L100,100 Z" fill="#000000" />
                   </svg>
                 </div>
                 
                {/* Subtle sparkles */}
                <div className="absolute top-10 right-8 w-1 h-1 text-zinc-500"><Sparkles className="w-4 h-4 opacity-30" /></div>
                <div className="absolute top-24 right-20 w-1 h-1 text-zinc-500"><Sparkles className="w-5 h-5 opacity-20" /></div>
                <div className="absolute bottom-16 left-6 w-1 h-1 text-zinc-500"><Sparkles className="w-3 h-3 opacity-20" /></div>
                
                <div className="relative z-10 p-7 flex flex-col h-full bg-gradient-to-t from-transparent to-[#141416]/90">
                  <Quote className="w-5 h-5 text-zinc-400 mb-5 fill-zinc-500" />
                  <p className="text-[22px] font-bold leading-snug tracking-tight text-white flex-1 pr-4">
                    Bugün 25 dakika çalışırsan, yarın %1 daha güçlü olursun.
                  </p>
                  <p className="text-[13px] font-medium text-zinc-500 mt-6">— StudyHub AI</p>
                </div>
              </section>

              {/* Heatmap Card */}
              <section className="bg-[#141416] border border-white/5 rounded-[24px] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-[16px] text-white tracking-wide">Çalışma Geçmişin</h2>
                  <button className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/5 bg-zinc-800/30 hover:bg-zinc-800/80 transition-colors">
                    Son 12 Hafta <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <Heatmap />
              </section>

              {/* Subjects to Continue Card */}
              <section className="bg-[#141416] border border-white/5 rounded-[24px] p-6 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-5 shrink-0">
                  <h2 className="font-bold text-[16px] text-white tracking-wide truncate pr-2">Devam Etmen Gereken Konular</h2>
                  <button className="text-[11px] font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors shrink-0">Tüm Konular</button>
                </div>
                
                <div className="flex flex-col gap-[10px] overflow-y-auto pr-1 pb-1 flex-1">
                  {[
                    { icon: <span className="font-serif italic text-lg font-semibold text-zinc-400">f(x)</span>, title: 'Matematik', desc: 'Limit ve Süreklilik', progress: 75, iconBg: 'bg-[#18181b]' },
                    { icon: <Atom className="w-[20px] h-[20px] text-zinc-400" strokeWidth={1.5} />, title: 'Fizik', desc: 'Newton\'un Hareket Yasaları', progress: 40, iconBg: 'bg-[#18181b]' },
                    { icon: <FlaskConical className="w-[20px] h-[20px] text-zinc-400" strokeWidth={1.5} />, title: 'Kimya', desc: 'Asitler ve Bazlar', progress: 20, iconBg: 'bg-[#18181b]' },
                    { icon: <Code className="w-[20px] h-[20px] text-zinc-400" strokeWidth={1.5} />, title: 'Programlama', desc: 'Fonksiyonlar', progress: 10, iconBg: 'bg-[#18181b]' },
                  ].map((subject, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-[20px] bg-[#18181B]/30 hover:bg-[#18181B] border border-white/0 hover:border-white/5 transition-colors group cursor-pointer">
                      <div className={`w-[46px] h-[46px] rounded-[14px] ${subject.iconBg} border border-white/[0.03] flex items-center justify-center shrink-0`}>
                        {subject.icon}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-[14px] mb-[2px] text-zinc-200 tracking-wide truncate">{subject.title}</div>
                        <div className="text-[12px] font-medium text-zinc-500 truncate">{subject.desc}</div>
                      </div>
                      <div className="flex items-center gap-3 w-[140px] shrink-0 justify-end">
                         <div className="flex-1 max-w-[80px] h-[4px] bg-zinc-800/80 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-zinc-300 rounded-full" style={{width: `${subject.progress}%`}} />
                         </div>
                         <span className="text-[12px] font-bold text-zinc-400 w-9 text-right tabular-nums tracking-wider">{subject.progress}%</span>
                         <ChevronRight className="w-[14px] h-[14px] text-zinc-600 group-hover:text-zinc-300 transition-colors" strokeWidth={2.5} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
            
          </div>
        </>
        ) : activeTab === 'Konular' ? <SubjectsView />
        : activeTab === 'AI Asistan' ? <AiAssistantView />
        : activeTab === 'Pomodoro' ? <PomodoroView onExit={() => setActiveTab('Ana Sayfa')} />
        : activeTab === 'Görevler' ? <TasksView />
        : activeTab === 'Notlarım' ? <NotesView />
        : activeTab === 'Soru Bankası' ? <QuestionBankView />
        : activeTab === 'Başarımlar' ? <AchievementsView />
        : activeTab === 'Leaderboard' ? <LeaderboardView />
        : null}

        </div>
      </main>
    </div>
  );
}
