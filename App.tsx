import React, { useState } from 'react';
import { PortalMode } from './types';
import { HomeIcon, BuildingIcon, BriefcaseIcon, GraduationCapIcon, ClipboardIcon, CheckBadgeIcon, ArrowRightIcon, LockIcon } from './components/ui/Icons';
import LiveInterface from './components/LiveInterface';
import ChatInterface from './components/ChatInterface';
import SchoolDashboard from './components/SchoolDashboard';
import SimpleContent from './components/SimpleContent';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentMode, setCurrentMode] = useState<PortalMode>(PortalMode.HOME);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Professional Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-white/50 sticky top-0 z-50 shadow-sm animate-fade-in-up">
        <div 
          onClick={() => setCurrentMode(PortalMode.HOME)}
          className="flex items-center gap-4 cursor-pointer group max-w-[40%]"
        >
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-900 to-emerald-700 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-900/20 text-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
             M
           </div>
           <div className="flex flex-col justify-center">
             <span className="text-sm md:text-lg font-black tracking-tight leading-none text-slate-900 uppercase truncate group-hover:text-emerald-900 transition-colors">SMKS MATHLAUL ANWAR</span>
             <span className="text-[10px] md:text-xs font-bold text-emerald-600 tracking-widest uppercase">Buaranjati</span>
           </div>
        </div>

        <nav className="flex bg-slate-100/50 backdrop-blur-sm rounded-full p-1.5 border border-white/60 ml-4 shrink-0 overflow-x-auto max-w-[60vw] sm:max-w-none custom-scrollbar shadow-inner">
          <button 
            onClick={() => setCurrentMode(PortalMode.HOME)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              currentMode === PortalMode.HOME 
                ? 'bg-white text-emerald-900 shadow-md ring-1 ring-slate-100 scale-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 scale-95 hover:scale-100'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Beranda</span>
          </button>
          
          <button 
            onClick={() => setCurrentMode(PortalMode.PROFILE)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              currentMode === PortalMode.PROFILE 
                ? 'bg-white text-emerald-900 shadow-md ring-1 ring-slate-100 scale-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 scale-95 hover:scale-100'
            }`}
          >
            <BuildingIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Profil</span>
          </button>
          
          <button 
            onClick={() => setCurrentMode(PortalMode.MAJORS)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              currentMode === PortalMode.MAJORS 
                ? 'bg-white text-emerald-900 shadow-md ring-1 ring-slate-100 scale-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 scale-95 hover:scale-100'
            }`}
          >
            <GraduationCapIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Jurusan</span>
          </button>
          
          <button 
            onClick={() => setCurrentMode(PortalMode.BKK)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              currentMode === PortalMode.BKK 
                ? 'bg-white text-emerald-900 shadow-md ring-1 ring-slate-100 scale-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 scale-95 hover:scale-100'
            }`}
          >
            <BriefcaseIcon className="w-4 h-4" />
            <span className="hidden sm:inline">BKK</span>
          </button>

          <button 
            onClick={() => setCurrentMode(PortalMode.PPDB)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              currentMode === PortalMode.PPDB 
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-lg shadow-emerald-900/20' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 scale-95 hover:scale-100'
            }`}
          >
            <ClipboardIcon className="w-4 h-4" />
            <span className="hidden sm:inline">PPDB</span>
          </button>

          <button 
            onClick={() => setCurrentMode(PortalMode.UKOM)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              currentMode === PortalMode.UKOM 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-600/20' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 scale-95 hover:scale-100'
            }`}
          >
            <CheckBadgeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">E-UKOM</span>
          </button>

          <button 
            onClick={() => setCurrentMode(PortalMode.ADMIN)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              currentMode === PortalMode.ADMIN 
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/20' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 scale-95 hover:scale-100'
            }`}
          >
            <LockIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
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

        {currentMode === PortalMode.UKOM && (
           <div className="w-full h-full p-4 md:p-8 flex flex-col animate-fade-in-up">
             <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative flex flex-col">
               <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-amber-100 rounded-lg text-amber-700 animate-pulse">
                        <CheckBadgeIcon className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-900">Aplikasi Pendaftaran UKOM</h3>
                       <p className="text-xs text-slate-500">Portal Eksternal Terintegrasi</p>
                     </div>
                  </div>
                  <a 
                    href="https://pendaftaran-ukom-lemon.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors hover:shadow-sm"
                  >
                    Buka di Tab Baru <ArrowRightIcon className="w-3 h-3" />
                  </a>
               </div>
               <iframe 
                 src="https://pendaftaran-ukom-lemon.vercel.app/" 
                 className="w-full flex-1 border-0"
                 title="Pendaftaran UKOM"
                 allow="camera; microphone; geolocation"
               />
             </div>
           </div>
        )}
      </main>
    </div>
  );
}