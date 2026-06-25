'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Book, PlayCircle, Clock, CheckCircle2, ChevronRight, 
  Send, Bot, User, Flame, Play, Pause, RotateCcw, Plus,
  FileText, MoreVertical, Trophy, Medal, Hexagon,
  Award, Star, Zap, Target, Music, SkipForward, X, ChevronsLeft,
  Lock, Library
} from 'lucide-react';
import { tytSubjects, aytSubjects } from './subjectsData';
import { useAuthUser, useTasks, useSubjectProgress } from './hooks/useData';
import { db } from './firebase';
import { addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

export const ReadSubjectView = ({ category, subject, onBack }: { category: string, subject: string, onBack: () => void }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchOrGenerate = async () => {
      try {
        const q = query(
          collection(db, 'subjectContents'),
          where('category', '==', category),
          where('subject', '==', subject)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          if (mounted) {
            setContent(querySnapshot.docs[0].data().markdownContent);
            setLoading(false);
          }
          return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Sen tecrübeli bir YKS (TYT/AYT) öğretmenisin. Öğrenci için "${category}" dersinin "${subject}" konusu hakkında detaylı, anlaşılır ve eğitici bir ders notu hazırla. Konuyu formüller, önemli notlar ve uyarılar ile zenginleştir. Lütfen sadece Markdown formatında yanıt ver, ekstra açıklama yapma.`,
        });

        const generatedContent = response.text || "İçerik oluşturulamadı.";
        
        await addDoc(collection(db, 'subjectContents'), {
          category,
          subject,
          markdownContent: generatedContent,
          createdAt: Date.now()
        });

        if (mounted) {
          setContent(generatedContent);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setContent("İçerik yüklenirken bir hata oluştu.");
          setLoading(false);
        }
      }
    };
    fetchOrGenerate();
    
    return () => { mounted = false; };
  }, [category, subject]);

  return (
    <div className="flex flex-col h-full w-full max-w-[1000px] mx-auto pb-10">
      <header className="mb-6 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
          <ChevronRight className="w-5 h-5 text-zinc-400 rotate-180" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">{subject}</h1>
          <p className="text-emerald-400 mt-1 text-[14px] font-bold tracking-wide uppercase">{category}</p>
        </div>
      </header>

      <div className="bg-[#141416] border border-white/5 rounded-[24px] p-6 lg:p-10 min-h-[500px]">
        {loading ? (
          <div className="w-full h-[400px] flex flex-col items-center justify-center gap-4 text-emerald-500">
            <Bot className="w-12 h-12 animate-bounce" />
            <div className="font-bold text-[15px] animate-pulse">AI İçerik Oluşturuyor...</div>
          </div>
        ) : (
          <div className="prose prose-invert prose-emerald max-w-none">
            <div className="markdown-body">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SubjectsView = () => {
  const [examType, setExamType] = useState<'TYT' | 'AYT'>('TYT');
  const [selectedCategory, setSelectedCategory] = useState<string>('Türkçe');
  const [readingSubject, setReadingSubject] = useState<{category: string, subject: string} | null>(null);
  
  const subjectsData = examType === 'TYT' ? tytSubjects : aytSubjects;
  const categories = Object.keys(subjectsData);
  
  // Ensure we select a valid category when switching exam types
  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [examType, categories, selectedCategory]);

  const { user } = useAuthUser();
  const { progress } = useSubjectProgress(user?.uid);

  if (readingSubject) {
    return (
      <ReadSubjectView 
        category={readingSubject.category} 
        subject={readingSubject.subject} 
        onBack={() => setReadingSubject(null)} 
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">Konular</h1>
          <p className="text-zinc-400 mt-2 text-[15px] font-medium">Tüm TYT ve AYT konuları ve ilerlemen.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex bg-[#141416]/80 p-1 rounded-xl border border-white/5">
            <button 
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${examType === 'TYT' ? 'bg-emerald-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
              onClick={() => setExamType('TYT')}
            >
              TYT
            </button>
            <button 
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${examType === 'AYT' ? 'bg-emerald-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
              onClick={() => setExamType('AYT')}
            >
              AYT
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Konu ara..." 
              className="pl-10 pr-4 py-2.5 rounded-[14px] border border-[#27272a] bg-[#141416]/50 text-[13px] text-zinc-200 focus:outline-none focus:border-zinc-500 w-[250px]"
            />
          </div>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 font-bold text-[14px] transition-colors ${
               selectedCategory === cat 
                 ? 'text-emerald-400 border-b-2 border-emerald-400 -mb-[1px]' 
                 : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
        {(subjectsData as Record<string, string[]>)[selectedCategory]?.map((title, i) => {
          const subProg = progress.find(p => p.subject === title && p.category === selectedCategory);
          const currentProgress = subProg ? subProg.progress : 0;
          return (
            <div 
              key={i} 
              onClick={() => setReadingSubject({ category: selectedCategory, subject: title })}
              className="bg-[#141416] border border-white/5 rounded-[20px] p-5 hover:border-white/10 transition-colors cursor-pointer group flex flex-col justify-between h-[120px]">
              <div className="flex gap-3 items-start">
                <div className="w-[42px] h-[42px] rounded-xl bg-[#18181b] border border-white/[0.03] flex items-center justify-center shrink-0">
                  <Book className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="flex-1 mt-0.5 min-w-0 pr-1">
                  <h3 className="font-bold text-[14px] text-zinc-200 leading-tight line-clamp-2">{title}</h3>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between items-center text-[11px] font-medium text-zinc-400 mb-1.5">
                  <span>İlerleme</span>
                  <span className="text-zinc-300 font-bold">{currentProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${currentProgress}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AiAssistantView = () => (
  <div className="flex flex-col h-full max-h-[calc(100vh-80px)] w-full max-w-[1000px] mx-auto">
    <header className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">AI Asistan</h1>
      <p className="text-zinc-400 mt-1 text-[15px] font-medium">Sorularını sor, anında cevap al.</p>
    </header>

    <div className="flex-1 bg-[#141416] border border-white/5 rounded-[24px] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <div className="flex gap-4 max-w-[80%]">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="bg-[#1e1e20] rounded-[18px] rounded-tl-sm p-4 text-[14px] text-zinc-300 leading-relaxed shadow-sm">
            Merhaba ! Bugün hangi konuda yardıma ihtiyacın var? Çözemediğin bir soru veya anlamadığın bir konu varsa bana sorabilirsin.
          </div>
        </div>

        <div className="flex gap-4 max-w-[80%] self-end flex-row-reverse">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="bg-emerald-600/20 border border-emerald-500/20 rounded-[18px] rounded-tr-sm p-4 text-[14px] text-emerald-100 leading-relaxed shadow-sm">
            Türev alırken çarpım kuralını bana örnekle açıklar mısın?
          </div>
        </div>

        <div className="flex gap-4 max-w-[80%]">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="bg-[#1e1e20] rounded-[18px] rounded-tl-sm p-4 text-[14px] text-zinc-300 leading-relaxed shadow-sm">
            <p className="mb-2">Tabii ki! Çarpım kuralı, iki fonksiyonun çarpımının türevini alırken kullanılır. Kural şöyledir:</p>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 font-mono text-[13px] text-emerald-400 mb-2">
              (f(x) · g(x))' = f'(x) · g(x) + f(x) · g'(x)
            </div>
            <p>Yani: Birincinin türevi çarpı ikinci + birinci çarpı ikincinin türevi.</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#121214] border-t border-white/5">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Mesajını yaz..." 
            className="w-full bg-[#1e1e20] border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-[14px] text-zinc-200 focus:outline-none focus:border-zinc-500"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-colors">
            <Send className="w-4 h-4 text-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const PomodoroView = ({ onExit }: { onExit?: () => void }) => {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [miniXpToast, setMiniXpToast] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playlist = [
    '/Mozart - Requiem.mp3'
  ];

  const currentSongName = playlist[currentSongIndex].replace(/^\//, '').replace(/\.mp3$/, '');

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(playlist[currentSongIndex]);
      
      const setAudioData = () => {
        setMusicDuration(audioRef.current?.duration || 0);
      };
      
      const setAudioTime = () => {
        setMusicCurrentTime(audioRef.current?.currentTime || 0);
      };

      const handleEnded = () => {
        handleNextSong();
      };
      
      audioRef.current.addEventListener('loadedmetadata', setAudioData);
      audioRef.current.addEventListener('timeupdate', setAudioTime);
      audioRef.current.addEventListener('ended', handleEnded);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', setAudioData);
          audioRef.current.removeEventListener('timeupdate', setAudioTime);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [currentSongIndex]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleNextSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const nextIndex = (currentSongIndex + 1) % playlist.length;
    setCurrentSongIndex(nextIndex);
    // Auto play if it was already playing
    setTimeout(() => {
      if (isMusicPlaying && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio playback failed", e));
      }
    }, 50);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio playback failed", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onExit) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const getInitialTime = (m: string) => {
    if (m === 'focus') return 25 * 60;
    if (m === 'shortBreak') return 5 * 60;
    return 15 * 60;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          if (mode === 'focus' && newTime > 0 && newTime % 300 === 0 && newTime !== 25 * 60) {
            setMiniXpToast(true);
            setTimeout(() => setMiniXpToast(false), 4000);
          }
          return newTime;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      
      if (mode === 'focus') {
        const newPomodoros = pomodorosCompleted + 1;
        setPomodorosCompleted(newPomodoros);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
        
        if (newPomodoros % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(15 * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(5 * 60);
        }
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, pomodorosCompleted]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const changeMode = (m: 'focus' | 'shortBreak' | 'longBreak') => {
    setMode(m);
    setIsActive(false);
    setTimeLeft(getInitialTime(m));
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-160px)] w-full max-w-[1000px] mx-auto py-4 relative">
      {/* Decorative abstract shapes matching image vibe but with our colors */}
      <div className="absolute top-[20%] left-[-10%] w-2 h-2 rounded-sm bg-emerald-500 rotate-45 opacity-60 blur-[1px]"></div>
      <div className="absolute top-[30%] left-[5%] w-3 h-3 rounded-sm bg-amber-500 rotate-12 opacity-80"></div>
      <div className="absolute bottom-[20%] left-[10%] w-2.5 h-2.5 rounded-sm bg-indigo-500 -rotate-12 opacity-70"></div>
      
      <div className="absolute top-[15%] right-[5%] w-3 h-3 rounded-sm bg-indigo-500 rotate-45 opacity-80"></div>
      <div className="absolute bottom-[30%] right-[10%] w-2 h-2 rounded-sm bg-emerald-500 -rotate-12 opacity-90"></div>
      <div className="absolute bottom-[10%] right-[3%] w-3 h-3 rounded-sm bg-amber-500 rotate-45 opacity-60"></div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141416]/10 to-[#141416]/50 pointer-events-none rounded-3xl" />

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-10 z-10">
        <div onClick={onExit} className="flex items-center gap-2 text-zinc-500 hover:text-white cursor-pointer transition-colors">
           <ChevronsLeft className="w-5 h-5" />
           <span className="font-bold text-[14px]">Odak Modu</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <button className={`px-4 py-1.5 rounded-full font-bold text-[11px] sm:text-[12px] transition-colors ${mode === 'focus' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} onClick={() => changeMode('focus')}>Odak</button>
            <button className={`px-4 py-1.5 rounded-full font-bold text-[11px] sm:text-[12px] transition-colors ${mode === 'shortBreak' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} onClick={() => changeMode('shortBreak')}>Kısa Mola</button>
            <button className={`px-4 py-1.5 rounded-full font-bold text-[11px] sm:text-[12px] transition-colors ${mode === 'longBreak' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} onClick={() => changeMode('longBreak')}>Uzun Mola</button>
        </div>
        <div className="hidden sm:flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={onExit}>
           <span className="font-bold text-[13px] text-zinc-500">Çıkış</span>
           <kbd className="px-2 py-1 bg-zinc-800/80 border border-white/5 rounded-lg text-[11px] font-bold text-zinc-400">Esc</kbd>
        </div>
      </div>

      {/* Main Timer Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        <button className="px-6 py-2 rounded-full border border-white/5 bg-[#1e1e20]/50 text-zinc-400 font-bold text-[12px] mb-8 transition-colors shadow-sm pointer-events-none">
          {mode === 'focus' ? 'Odaklanma Zamanı' : mode === 'shortBreak' ? 'Kısa Mola Zamanı' : 'Uzun Mola Zamanı'}
        </button>

        <div className="text-[140px] sm:text-[180px] font-bold tracking-tighter text-white tabular-nums leading-none mb-6 drop-shadow-[0_0_60px_rgba(255,255,255,0.05)]">
          {formatTime(timeLeft)}
        </div>

        <div className="text-zinc-400 font-medium text-[16px] tracking-wide mb-6">
          {mode === 'focus' ? 'Odaklan. Derin çalış. Başar.' : 'Dinlen. Yenilen. Geri dön.'}
        </div>

        <div className="text-zinc-500 font-bold text-[12px] tracking-widest uppercase mb-12 flex items-center gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < (pomodorosCompleted % 4) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
          ))}
          <span className="ml-2">{(pomodorosCompleted % 4) + 1} / 4 Pomodoro</span>
        </div>

        <button 
          onClick={toggleTimer}
          className={`px-12 py-4 rounded-full border bg-[#121214] font-bold text-[15px] transition-all tracking-wide flex items-center gap-2 ${isActive ? 'border-amber-500/40 hover:border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.05)] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-emerald-500/40 hover:border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'}`}
        >
          {isActive ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
          {isActive ? 'Durdur' : 'Başlat'}
        </button>
      </div>

      {/* Bottom Widgets */}
      <div className="w-full flex flex-col items-center gap-6 mt-16 z-10 min-h-[140px]">
        {/* Music Widget */}
        <div className="w-full max-w-[420px] p-4 rounded-[24px] bg-[#141416]/90 border border-white/5 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
          <div className="flex items-center gap-4">
             <div className="w-[52px] h-[52px] rounded-[18px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center shrink-0 shadow-inner">
               <Music className="w-6 h-6 text-indigo-400 drop-shadow-md" />
             </div>
             <div className="flex-1 min-w-0 pr-2">
               <div className="font-bold text-zinc-100 text-[15px] truncate">{currentSongName}</div>
               <div className="text-zinc-500 text-[13px] font-medium mt-0.5 truncate">MP3 Player</div>
             </div>
             <div className="flex items-center gap-2 pr-2 shrink-0">
               <button onClick={toggleMusic} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white group border border-transparent hover:border-white/5">
                  {isMusicPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
               </button>
               <button onClick={handleNextSong} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white group border border-transparent hover:border-white/5">
                  <SkipForward className="w-4 h-4 ml-0.5" fill="currentColor" />
               </button>
             </div>
          </div>
          <div className="flex items-center gap-4 px-2">
             <div className="flex-1 h-[5px] bg-[#1e1e20] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all ease-linear" 
                  style={{ width: `${musicDuration > 0 ? (musicCurrentTime / musicDuration) * 100 : 0}%` }}
                />
             </div>
             <span className="text-[11px] font-bold text-zinc-500 tabular-nums shrink-0">
                {formatTime(Math.floor(musicCurrentTime))} / {formatTime(Math.floor(musicDuration || 0))}
             </span>
          </div>
        </div>

        {/* Floating Mini XP Toast */}
        <div className="absolute top-10 right-10 flex flex-col items-end gap-3 pointer-events-none z-50">
          {miniXpToast && (
            <div className="p-4 rounded-2xl bg-[#141416]/90 border border-emerald-500/20 backdrop-blur-md shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-5 fade-in duration-300 zoom-in-95">
               <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-emerald-400" />
               </div>
               <span className="font-bold text-[14px] text-zinc-200">5dk Odak: <span className="text-emerald-400">+10 XP</span></span>
            </div>
          )}
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="w-full max-w-[420px] p-6 rounded-[24px] bg-[#141416] border border-emerald-500/20 shadow-2xl flex items-center gap-5 hover:border-emerald-500/30 transition-all relative group animate-in slide-in-from-bottom-5 fade-in duration-300">
            <button onClick={() => setShowToast(false)} className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
            <div className="w-[52px] h-[52px] rounded-[18px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" fill="currentColor" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="font-bold text-amber-500 text-[16px] tracking-wide">Pomodoro tamamlandı!</div>
              <div className="text-zinc-400 font-medium text-[14px]">
                <span className="text-emerald-400 font-bold">+50 XP</span> kazandın!
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export const TasksView = () => {
  const { user } = useAuthUser();
  const { tasks } = useTasks(user?.uid);
  
  const handleCreateDummyTask = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/tasks`), {
        userId: user.uid,
        title: 'Yeni Görev',
        description: 'Bu görev test amaçlıdır.',
        subject: 'Genel',
        xpReward: 50,
        progress: 0,
        isCompleted: false,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}/tasks`, taskId), {
        isCompleted: !currentStatus
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1000px] mx-auto pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">Görevler</h1>
          <p className="text-zinc-400 mt-2 text-[15px] font-medium">Bugün yapman gerekenleri planla.</p>
        </div>
        <button onClick={handleCreateDummyTask} className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] bg-emerald-600 hover:bg-emerald-500 transition-colors text-[13px] font-bold text-white shadow-sm">
          <Plus className="w-4 h-4" />
          Yeni Görev
        </button>
      </header>
  
      <div className="bg-[#141416] border border-white/5 rounded-[24px] p-6">
        <div className="flex gap-4 border-b border-[#27272a] pb-4 mb-4">
          <div className="text-[14px] font-bold text-emerald-400 border-b-2 border-emerald-400 pb-4 -mb-[17px] px-2 cursor-pointer">Tümü</div>
        </div>
  
        <div className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 font-medium">Henüz bir görev eklenmemiş. "Yeni Görev"e tıklayarak ekleyin.</div>
          ) : tasks.map((task, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${task.isCompleted ? 'border-white/5 bg-[#141416] opacity-60' : 'border-[#27272a] bg-[#1e1e20]/50'} hover:border-white/10 transition-colors group cursor-pointer`}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleToggleTask(task.id, task.isCompleted)}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-[#141416]' : 'border-zinc-600 text-transparent hover:border-emerald-500 group-hover:border-emerald-500/50'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div>
                  <div className={`font-bold text-[15px] mb-1 ${task.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{task.title}</div>
                  <div className="flex items-center gap-3 text-[12px] font-medium text-zinc-500">
                    <span className="flex items-center gap-1"><Book className="w-3.5 h-3.5" /> {task.subject}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-[12px] font-bold ${task.isCompleted ? 'text-zinc-600' : 'text-amber-500'}`}>+{task.xpReward} XP</div>
                <MoreVertical className="w-5 h-5 text-zinc-600 hover:text-zinc-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NotesView = () => (
  <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-10">
    <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">Notlarım</h1>
        <p className="text-zinc-400 mt-2 text-[15px] font-medium">Aldığın notlara hızlıca göz at.</p>
      </div>
      <div className="flex gap-3 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Notlarda ara..." 
            className="pl-10 pr-4 py-2.5 rounded-[14px] border border-[#27272a] bg-[#141416]/50 text-[13px] text-zinc-200 focus:outline-none focus:border-zinc-500 w-[200px]"
          />
        </div>
        <button className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] bg-zinc-800 hover:bg-zinc-700 transition-colors text-[13px] font-bold text-white shadow-sm">
          <Plus className="w-4 h-4" />
          Yeni
        </button>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {[1,2,3,4,5,6,7,8].map((i) => (
        <div key={i} className="bg-[#141416] border border-white/5 rounded-[24px] p-5 hover:border-white/10 transition-colors cursor-pointer group flex flex-col h-[220px]">
          <div className="flex justify-between items-start mb-3">
            <div className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
              {['Matematik', 'Fizik', 'Tarih', 'Biyoloji'][i%4]}
            </div>
            <MoreVertical className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
          </div>
          <h3 className="font-bold text-[16px] text-zinc-200 mb-2 leading-tight">
            {['Türev Kuralları Özeti', 'Newton Yasaları', 'I. Dünya Savaşı Nedenleri', 'Hücre Organelleri'][i%4]}
          </h3>
          <p className="text-[13px] text-zinc-500 font-medium leading-relaxed line-clamp-3 mb-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <div className="text-[11px] text-zinc-600 font-bold mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <span>2 gün önce</span>
            <FileText className="w-3.5 h-3.5" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const QuestionBankView = () => (
   <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-10">
    <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">Soru Bankası</h1>
        <p className="text-zinc-400 mt-2 text-[15px] font-medium">Binlerce soruyla kendini test et.</p>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Example category card */}
      {[
        { title: 'Matematik Testleri', count: 1250, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
        { title: 'Fizik Testleri', count: 840, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
        { title: 'Kimya Testleri', count: 620, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
        { title: 'Biyoloji Testleri', count: 950, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
        { title: 'Tarih Testleri', count: 430, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
        { title: 'Coğrafya Testleri', count: 510, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
      ].map((cat, i) => (
        <div key={i} className="bg-[#141416] border border-white/5 rounded-[24px] p-6 hover:bg-[#18181b] transition-colors cursor-pointer flex items-center gap-5">
           <div className={`w-16 h-16 rounded-[20px] ${cat.bg} border ${cat.border} flex items-center justify-center shrink-0`}>
              <Library className={`w-8 h-8 ${cat.color}`} />
           </div>
           <div>
             <h3 className="font-bold text-[17px] text-zinc-100 mb-1">{cat.title}</h3>
             <p className="text-[13px] text-zinc-500 font-medium">{cat.count} Soru</p>
           </div>
           <ChevronRight className="w-5 h-5 text-zinc-600 ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

export const AchievementsView = () => (
  <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-10">
    <header className="mb-2">
      <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">Başarımlar</h1>
      <p className="text-zinc-400 mt-2 text-[15px] font-medium">Kazandığın rozetler ve istatistiklerin.</p>
    </header>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => {
        const isLocked = i > 7;
        return (
          <div key={i} className={`bg-[#141416] border border-white/5 rounded-[24px] p-6 text-center flex flex-col items-center justify-center ${isLocked ? 'opacity-50 grayscale' : 'hover:bg-[#18181b]'} transition-colors cursor-pointer group`}>
            <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[1.5px] border-zinc-800 bg-[#121214] shadow-inner" />
                <div className={`absolute inset-[6px] rounded-full border border-white/10 ${isLocked ? 'bg-zinc-800' : 'bg-amber-500/10 border-amber-500/20'} flex items-center justify-center z-10 transition-transform group-hover:scale-105 duration-300`}>
                    {isLocked ? <Lock className="w-6 h-6 text-zinc-500" /> : <Flame className="w-8 h-8 text-amber-500" strokeWidth={1.5} />}
                </div>
            </div>
            <div className="text-[14px] font-bold text-zinc-200 leading-tight mb-1">Rozet Adı {i}</div>
            <div className="text-[12px] font-medium text-zinc-500 leading-tight">{isLocked ? 'Kilitli' : 'Kazanıldı!'}</div>
          </div>
        )
      })}
    </div>
  </div>
);

export const LeaderboardView = () => (
  <div className="flex flex-col gap-6 w-full max-w-[1000px] mx-auto pb-10">
    <header className="mb-2">
      <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">Leaderboard</h1>
      <p className="text-zinc-400 mt-2 text-[15px] font-medium">Haftalık en çok XP kazananlar.</p>
    </header>

    <div className="bg-[#141416] border border-white/5 rounded-[24px] overflow-hidden">
      <div className="px-6 py-4 bg-[#18181b] border-b border-white/5 flex gap-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">
        <div className="w-12 text-center">Sıra</div>
        <div className="flex-1">Öğrenci</div>
        <div className="w-24 text-right">Seviye</div>
        <div className="w-32 text-right">Haftalık XP</div>
      </div>
      
      <div className="flex flex-col">
        {[
          { name: ' Ergili', xp: 4320, level: 12, isCurrent: true },
          { name: 'Ayşe Yılmaz', xp: 3850, level: 11, isCurrent: false },
          { name: 'Mehmet Demir', xp: 3500, level: 10, isCurrent: false },
          { name: 'Zeynep Kaya', xp: 3200, level: 10, isCurrent: false },
          { name: 'Can Özkan', xp: 2900, level: 9, isCurrent: false },
          { name: 'Elif Şahin', xp: 2100, level: 8, isCurrent: false },
        ].map((user, i) => (
          <div key={i} className={`px-6 py-4 flex items-center gap-4 border-b border-white/5 last:border-0 hover:bg-[#18181b]/50 transition-colors ${user.isCurrent ? 'bg-amber-500/5' : ''}`}>
            <div className="w-12 flex justify-center">
              {i === 0 ? <Medal className="w-6 h-6 text-yellow-400 drop-shadow-md" /> :
               i === 1 ? <Medal className="w-6 h-6 text-zinc-400 drop-shadow-md" /> :
               i === 2 ? <Medal className="w-6 h-6 text-amber-600 drop-shadow-md" /> :
               <div className="font-bold text-zinc-500">{i + 1}</div>}
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 border border-white/5">
                {user.name.charAt(0)}
              </div>
              <span className={`font-bold text-[15px] ${user.isCurrent ? 'text-amber-500' : 'text-zinc-200'}`}>
                {user.name} {user.isCurrent && '(Sen)'}
              </span>
            </div>
            <div className="w-24 text-right font-medium text-zinc-400">
              Lvl {user.level}
            </div>
            <div className="w-32 text-right font-bold text-zinc-200">
              {user.xp} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
