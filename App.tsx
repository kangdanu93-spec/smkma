import React, { useState, useEffect, useRef } from 'react';
import { PortalMode } from './types';
import { HomeIcon, BuildingIcon, BriefcaseIcon, GraduationCapIcon, ClipboardIcon, CheckBadgeIcon, ArrowRightIcon, LockIcon, MicIcon, MapIcon, BrainIcon, ChevronDownIcon } from './components/ui/Icons';
import LiveInterface from './components/LiveInterface';
import ChatInterface from './components/ChatInterface';
import SchoolDashboard from './components/SchoolDashboard';
import SimpleContent from './components/SimpleContent';
import AdminPanel from './components/AdminPanel';
import NewsDetail from './components/NewsDetail';
import { databaseService } from './services/database';

interface NavItem {
  label: string;
  icon?: any;
  mode?: PortalMode;
  special?: string;
  externalUrl?: string;
  children?: NavItem[];
}

export default function App() {
  const [currentMode, setCurrentMode] = useState<PortalMode>(PortalMode.HOME);
  const [newsId, setNewsId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
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

    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
        if (navRef.current && !navRef.current.contains(event.target as Node)) {
            setOpenDropdown(null);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If viewing a specific news item, render only NewsDetail
  if (newsId) {
    return <NewsDetail id={newsId} />;
  }

  // Navigation Data Structure (Tiered)
  const navItems: NavItem[] = [
    { 
      label: "Beranda",
      mode: PortalMode.HOME, 
      icon: HomeIcon 
    },
    {
      label: "Smart AI",
      icon: BrainIcon,
      children: [
        { label: "AI Tutor", mode: PortalMode.THINK, icon: BrainIcon },
        { label: "Live Class", mode: PortalMode.LIVE, icon: MicIcon }
      ]
    },
    {
      label: "Info Sekolah",
      icon: BuildingIcon,
      children: [
        { label: "Profil", mode: PortalMode.PROFILE, icon: BuildingIcon },
        { label: "Jurusan", mode: PortalMode.MAJORS, icon: GraduationCapIcon },
        { label: "Peta", mode: PortalMode.MAPS, icon: MapIcon },
        { label: "Bursa Kerja", mode: PortalMode.BKK, icon: BriefcaseIcon }
      ]
    },
    { 
      label: "SPMB", 
      externalUrl: "https://spmb-smkma.vercel.app",
      icon: ClipboardIcon, 
      special: "emerald" 
    },
    {
      label: "Aplikasi",
      icon: CheckBadgeIcon,
      children: [
        { label: "UKOM", mode: PortalMode.UKOM, icon: CheckBadgeIcon, special: "amber", externalUrl: "https://pendaftaran-ukom-lemon.vercel.app/" },
        { label: "Admin Panel", mode: PortalMode.ADMIN, icon: LockIcon }
      ]
    }
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      setOpenDropdown(openDropdown === item.label ? null : item.label);
    } else {
      setOpenDropdown(null);
      if (item.externalUrl) {
        window.open(item.externalUrl, '_blank');
      } else if (item.mode) {
        setCurrentMode(item.mode);
      }
    }
  };

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
        <nav ref={navRef} className="flex items-center gap-2 ml-4 relative">
           {navItems.map((item, index) => {
             // Logic to check if parent is active (if one of its children is selected)
             const isParentActive = item.children?.some(child => child.mode === currentMode) || item.mode === currentMode;
             
             let buttonClass = "flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full text-sm font-bold transition-all duration-300 shrink-0 select-none";
             
             if (item.special === 'emerald') {
                buttonClass += " bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-lg shadow-emerald-900/20 hover:scale-105";
             } else if (isParentActive || openDropdown === item.label) {
                buttonClass += " bg-white text-emerald-900 shadow-md ring-1 ring-slate-200";
             } else {
                buttonClass += " text-slate-500 hover:text-slate-800 hover:bg-slate-100/80";
             }

             return (
               <div key={index} className="relative">
                 <button 
                   onClick={() => handleNavClick(item)}
                   className={buttonClass}
                   title={item.label}
                 >
                   <item.icon className="w-5 h-5" />
                   <span className="hidden md:inline">{item.label}</span>
                   {item.children && (
                     <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                   )}
                 </button>

                 {/* Dropdown Menu */}
                 {item.children && openDropdown === item.label && (
                   <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in-up origin-top-right">
                      {item.children.map((child, cIdx) => {
                        const isChildActive = child.mode === currentMode;
                        return (
                          <button
                            key={cIdx}
                            onClick={() => handleNavClick(child)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left
                              ${isChildActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                          >
                             {child.icon && <child.icon className="w-4 h-4 opacity-70" />}
                             {child.label}
                          </button>
                        );
                      })}
                   </div>
                 )}
               </div>
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