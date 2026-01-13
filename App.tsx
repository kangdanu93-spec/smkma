import React, { useState, useEffect } from 'react';
import { PortalMode } from './types';
import { HomeIcon, BuildingIcon, BriefcaseIcon, GraduationCapIcon, ClipboardIcon, CheckBadgeIcon, ArrowRightIcon, LockIcon, MicIcon, MapIcon, BrainIcon } from './components/ui/Icons';
import LiveInterface from './components/LiveInterface';
import ChatInterface from './components/ChatInterface';
import SchoolDashboard from './components/SchoolDashboard';
import SimpleContent from './components/SimpleContent';
import AdminPanel from './components/AdminPanel';
import NewsDetail from './components/NewsDetail';
import { databaseService } from './services/database';

export default function App() {
  const [currentMode, setCurrentMode] = useState<PortalMode>(PortalMode.HOME);
  const [newsId, setNewsId] = useState<string | null>(null);
  
  // OPTIMIZATION: Initialize state from LocalStorage to prevent Logo Flicker/Delay
  const [schoolLogo, setSchoolLogo] = useState<string>(() => {
    if (typeof window !== 'undefined') {
        try {
            const cached = localStorage.getItem('principal_data_local');
            if (cached) {
                return JSON.parse(cached).schoolLogoUrl || '';
            }
        } catch (e) {}
    }
    return '';
  });

  useEffect(() => {
    // Check for news_id in URL params on load
    const params = new URLSearchParams(window.location.search);
    const id = params.get('news_id');
    if (id) {
      setNewsId(id);
    }

    // Fetch School Logo (Async update)
    const fetchConfig = async () => {
        const config = await databaseService.getPrincipalData();
        if (config && config.schoolLogoUrl) {
            setSchoolLogo(config.schoolLogoUrl);
        }
    };
    fetchConfig();
  }, []);

  // If viewing a specific news item, render only NewsDetail
  if (newsId) {
    return <NewsDetail id={newsId} />;
  }

  // Navigation Items Config
  const navItems = [
    { mode: PortalMode.HOME, icon: HomeIcon, label: "Beranda" },
    { mode: PortalMode.THINK, icon: BrainIcon, label: "AI Tutor" },
    { mode: PortalMode.LIVE, icon: MicIcon, label: "Live" },
    { mode: PortalMode.PROFILE, icon: BuildingIcon, label: "Profil" },
    { mode: PortalMode.MAJORS, icon: GraduationCapIcon, label: "Jurusan" },
    { mode: PortalMode.MAPS, icon: MapIcon, label: "Peta" },
    { mode: PortalMode.BKK, icon: BriefcaseIcon, label: "BKK" },
    { mode: PortalMode.PPDB, icon: ClipboardIcon, label: "PPDB", special: "emerald" },
    { mode: PortalMode.UKOM, icon: CheckBadgeIcon, label: "UKOM", special: "amber", externalUrl: "https://pendaftaran-ukom-lemon.vercel.app/" },
    { mode: PortalMode.ADMIN, icon: LockIcon, label: "Admin" },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Professional Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white/80 backdrop-blur-md border-b border-white/50 sticky top-0 z-50 shadow-sm animate-fade-in-up">
        {/* Logo Section */}
        <div 
          onClick={() => setCurrentMode(PortalMode.HOME)}
          className="flex items-center gap-3 md:gap-4 cursor-pointer group shrink-0"
        >
           <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0 group-hover:scale-105 transition-transform duration-300 ${!schoolLogo ? 'bg-gradient-to-br from-emerald-900 to-emerald-700 shadow-lg shadow-emerald-900/20 text-lg md:text-xl' : 'bg-transparent'}`}>
             {schoolLogo ? (
                 <img 
                    src={schoolLogo} 
                    alt="Logo Sekolah" 
                    className="w-full h-full object-contain filter drop-shadow-sm" 
                    width="48"
                    height="48"
                    // @ts-ignore
                    fetchpriority="high"
                 />
             ) : (
                 "M"
             )}
           </div>
           {/* Text hidden on mobile to save space */}
           <div className="hidden md:flex flex-col justify-center">
             <span className="text-lg font-black tracking-tight leading-none text-slate-900 uppercase truncate group-hover:text-emerald-900 transition-colors">SMKS MATHLAUL ANWAR</span>
             <span className="text-xs font-bold text-emerald-600 tracking-widest uppercase">Buaranjati</span>
           </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex items-center gap-1 md:gap-2 ml-4 overflow-x-auto no-scrollbar mask-gradient">
           {navItems.map((item) => {
             const isActive = currentMode === item.mode;
             
             // Dynamic Class Logic
             let baseClass = "flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full text-sm font-bold transition-all duration-300 shrink-0";
             
             // External Link Handling (UKOM)
             if ((item as any).externalUrl) {
                // For UKOM/Amber, make it look active/highlighted to serve as CTA
                const externalClass = item.special === 'amber'
                   ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-600/20 scale-100 hover:scale-105 hover:shadow-amber-600/30"
                   : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 scale-95 hover:scale-100";

                return (
                  <a
                    key={item.mode}
                    href={(item as any).externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClass} ${externalClass}`}
                    title={item.label}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </a>
                );
             }

             // Internal Navigation
             let activeClass = "";
             let inactiveClass = "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 scale-95 hover:scale-100";

             if (item.special === 'emerald') {
                activeClass = "bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-lg shadow-emerald-900/20 scale-100";
             } else if (item.special === 'amber') {
                activeClass = "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-600/20 scale-100";
             } else {
                activeClass = "bg-white text-emerald-900 shadow-md ring-1 ring-slate-200 scale-100";
             }

             return (
               <button 
                 key={item.mode}
                 onClick={() => setCurrentMode(item.mode)}
                 className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                 title={item.label}
               >
                 <item.icon className="w-5 h-5" />
                 {/* Label hidden on mobile (screens < md), visible on desktop */}
                 <span className="hidden md:inline">{item.label}</span>
               </button>
             );
           })}
        </nav>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col items-center w-full relative">
        {currentMode === PortalMode.HOME && (
          <SchoolDashboard onNavigate={setCurrentMode} />
        )}

        {currentMode === PortalMode.ADMIN && (
          <div className="w-full h-full p-4 md:p-6 bg-slate-100/50 backdrop-blur-sm animate-fade-in-up overflow-y-auto">
            <AdminPanel />
          </div>
        )}
        
        {currentMode === PortalMode.LIVE && (
          <div className="w-full h-full p-4 md:p-6 flex flex-col items-center justify-center bg-slate-100/50 backdrop-blur-sm animate-fade-in-up">
            <LiveInterface apiKey={process.env.API_KEY || ''} />
          </div>
        )}
        
        {(currentMode === PortalMode.MAPS || currentMode === PortalMode.THINK) && (
          <div className="w-full h-full p-4 md:p-6 flex flex-col items-center animate-fade-in-up">
            <ChatInterface mode={currentMode} apiKey={process.env.API_KEY || ''} />
          </div>
        )}

        {(currentMode === PortalMode.PROFILE || currentMode === PortalMode.MAJORS || currentMode === PortalMode.BKK || currentMode === PortalMode.PPDB) && (
           <div className="w-full h-full animate-fade-in-up">
              <SimpleContent mode={currentMode} />
           </div>
        )}
      </main>
    </div>
  );
}