import React, { useState, useEffect } from 'react';
import { PortalMode, PrincipalData, NewsItem } from '../types';
import { databaseService } from '../services/database';
import { ArrowRightIcon, BrainIcon, MapIcon, MicIcon, BookIcon, UserIcon, CheckBadgeIcon, FacebookIcon, InstagramIcon, YoutubeIcon, TiktokIcon, LoaderIcon } from './ui/Icons';

interface SchoolDashboardProps {
  onNavigate: (mode: PortalMode) => void;
}

export default function SchoolDashboard({ onNavigate }: SchoolDashboardProps) {
  const [principal, setPrincipal] = useState<PrincipalData>({
    name: 'Siti Komalia, S.Farm',
    title: 'Kepala Sekolah',
    message: '"Kami berkomitmen mencetak lulusan yang tidak hanya cerdas secara intelektual, namun juga matang secara emosional dan spiritual. Teknologi adalah alat, karakter adalah kunci."',
    photoUrl: ''
  });

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Principal
      const pData = await databaseService.getPrincipalData();
      if (pData) setPrincipal(pData);

      // Fetch News
      const nData = await databaseService.getNews();
      setNews(nData);
      setLoadingNews(false);
    };
    fetchData();
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar relative">
      {/* Dynamic Animated Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-[80px] animate-float"></div>
        <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] bg-teal-200/20 rounded-full blur-[80px] animate-float-delayed"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[350px] h-[350px] bg-indigo-200/20 rounded-full blur-[80px] animate-float"></div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="relative z-10 max-w-6xl space-y-8 animate-fade-in-up flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md border border-emerald-100 text-emerald-900 text-xs font-bold shadow-sm hover:shadow-md transition-shadow cursor-default ring-1 ring-white/50">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            PPDB 2026 RESMI DIBUKA
          </div>
          
          <div className="space-y-2 flex flex-col items-center">
            <span className="block text-orange-500 font-bold text-sm md:text-lg tracking-widest uppercase mb-1">
              Selamat Datang Di Website
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] drop-shadow-sm">
              <span className="bg-gradient-to-r from-emerald-800 via-teal-600 to-emerald-800 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer uppercase">
                SMKS MATHLAUL ANWAR BUARANJATI
              </span>
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-medium mx-auto">
            Membentuk Generasi Unggul & Berkarakter dengan teknologi masa depan.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-5 mt-4">
             <button 
               onClick={() => onNavigate(PortalMode.THINK)}
               className="group px-8 py-4 bg-emerald-900 text-white font-bold rounded-xl hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20 hover:shadow-emerald-900/30 hover:-translate-y-1 flex items-center gap-3 active:scale-95"
             >
               <BrainIcon className="w-5 h-5 text-emerald-100 group-hover:rotate-12 transition-transform" />
               Tanya Asisten AI
             </button>
             <button 
               onClick={() => onNavigate(PortalMode.PPDB)}
               className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 font-bold rounded-xl border border-white hover:border-emerald-200 hover:text-emerald-900 hover:bg-white shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-all active:scale-95"
             >
               Daftar Sekarang
             </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-10 animate-fade-in-up delay-100">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-1 bg-emerald-600 rounded-full"></span>
            Layanan Digital
          </h2>
          <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1 ml-4 hidden md:block"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Smart Tutor Card */}
          <div 
            onClick={() => onNavigate(PortalMode.THINK)}
            className="group glass-panel rounded-2xl p-6 cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 animate-fade-in-up delay-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[60px] transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center mb-5 transition-colors group-hover:bg-indigo-600 group-hover:text-white shadow-sm">
              <BrainIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">Smart Tutor</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Asisten belajar cerdas berbasis AI untuk bantuan akademik 24/7.
            </p>
            <div className="flex items-center text-indigo-700 font-bold text-xs mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
              Akses Sekarang <ArrowRightIcon className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Live Class Card */}
          <div 
            onClick={() => onNavigate(PortalMode.LIVE)}
            className="group glass-panel rounded-2xl p-6 cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 animate-fade-in-up delay-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-[60px] transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-5 transition-colors group-hover:bg-rose-600 group-hover:text-white shadow-sm">
              <MicIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">Kelas Live</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Interaksi langsung dengan pengajar melalui video conference.
            </p>
            <div className="flex items-center text-rose-600 font-bold text-xs mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
              Mulai Sesi <ArrowRightIcon className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Maps Card */}
          <div 
            onClick={() => onNavigate(PortalMode.MAPS)}
            className="group glass-panel rounded-2xl p-6 cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 animate-fade-in-up delay-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[60px] transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-5 transition-colors group-hover:bg-emerald-600 group-hover:text-white shadow-sm">
              <MapIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">Peta Lokasi</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Navigasi area sekolah dan informasi fasilitas gedung.
            </p>
            <div className="flex items-center text-emerald-700 font-bold text-xs mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
              Buka Peta <ArrowRightIcon className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* UKOM Card */}
          <div 
            onClick={() => onNavigate(PortalMode.UKOM)}
            className="group glass-panel rounded-2xl p-6 cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 animate-fade-in-up delay-300 relative overflow-hidden border-amber-100/50"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[60px] transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 transition-colors group-hover:bg-amber-500 group-hover:text-white shadow-sm">
              <CheckBadgeIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">E-UKOM</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Sistem pendaftaran Uji Kompetensi Keahlian siswa.
            </p>
            <div className="flex items-center text-amber-600 font-bold text-xs mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
              Login Aplikasi <ArrowRightIcon className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* Info Section - SAMBUTAN REDESIGN */}
      <section className="py-20 px-6 bg-white overflow-hidden animate-fade-in-up delay-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Side: Text Content */}
            <div className="space-y-6 order-2 lg:order-1">
                <div>
                  <h3 className="text-emerald-800 font-bold text-lg uppercase tracking-wider mb-2">Sambutan Dari</h3>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                      {principal.title} <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-600">
                          SMKS Mathlaul Anwar
                      </span>
                  </h2>
                </div>
                
                <div className="prose prose-lg text-slate-600 leading-relaxed text-justify">
                     <p className="whitespace-pre-line text-lg">
                        {principal.message}
                     </p>
                </div>
            </div>

            {/* Right Side: Photo with decorations */}
            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
                {/* Sparkle Decoration 1 (Top Left) */}
                <svg className="absolute -left-8 top-10 w-16 h-16 text-amber-300 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
                
                {/* Sparkle Decoration 2 (Bottom Right) */}
                <svg className="absolute -right-4 bottom-20 w-12 h-12 text-amber-300 animate-pulse delay-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>

                {/* Background Box */}
                <div className="relative z-10 w-full max-w-md">
                    {/* Shadow Layer */}
                    <div className="absolute top-6 right-6 w-full h-full bg-slate-200/50 rounded-3xl -z-20 transform rotate-6"></div>
                    {/* Main Background Color */}
                    <div className="absolute top-0 right-0 w-full h-full bg-slate-900 rounded-3xl -z-10 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-slate-900 opacity-50"></div>
                       {/* Dotted Pattern Overlay */}
                       <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                    </div>
                    
                    {/* Image Container */}
                    <div className="relative pt-8 px-8 pb-0 flex justify-center">
                         {principal.photoUrl ? (
                            <img 
                              src={principal.photoUrl} 
                              alt={principal.name} 
                              className="w-full h-auto object-cover rounded-t-xl shadow-2xl z-10 relative transform hover:scale-[1.02] transition-transform duration-500" 
                              style={{ minHeight: '400px', maxHeight: '550px' }} 
                            />
                         ) : (
                            <div className="w-full h-[450px] bg-slate-800 rounded-t-xl flex items-center justify-center text-slate-600 border-b border-slate-700">
                                <UserIcon className="w-32 h-32 opacity-50" />
                            </div>
                         )}
                    </div>

                    {/* Name Plate */}
                    <div className="absolute bottom-12 -left-4 md:-left-10 z-30">
                        <div className="bg-amber-500 text-slate-900 font-black px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl shadow-xl transform -skew-x-6 border-b-4 border-amber-600">
                             <div className="transform skew-x-6 uppercase tracking-tight">
                                {principal.name}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Major Cards Below */}
        <div className="max-w-7xl mx-auto mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             {/* Card 1: DKV */}
             <div className="group p-5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-500/30 flex items-center gap-6 shadow-sm hover:shadow-xl hover:-translate-x-1 transition-all cursor-default">
                <div className="w-20 h-20 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
                  DKV
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">Desain Komunikasi Visual</div>
                  <div className="text-slate-500 text-sm mt-1">Seni Grafis & Multimedia Kreatif</div>
                </div>
             </div>

             {/* Card 2: TKR */}
             <div className="group p-5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-500/30 flex items-center gap-6 shadow-sm hover:shadow-xl hover:-translate-x-1 transition-all cursor-default">
                <div className="w-20 h-20 rounded-xl bg-slate-800 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-lg shadow-slate-800/20 group-hover:scale-105 transition-transform">
                  TKR
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">Teknik Kendaraan Ringan</div>
                  <div className="text-slate-500 text-sm mt-1">Otomotif Modern & Mekanikal</div>
                </div>
             </div>

             {/* Card 3: PERKANTORAN */}
             <div className="group p-5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-500/30 flex items-center gap-6 shadow-sm hover:shadow-xl hover:-translate-x-1 transition-all cursor-default">
                <div className="w-20 h-20 rounded-xl bg-slate-700 text-white flex items-center justify-center text-xl font-black shrink-0 text-center px-1 shadow-lg shadow-slate-700/20 group-hover:scale-105 transition-transform">
                  MPLB
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">Manajemen Perkantoran</div>
                  <div className="text-slate-500 text-sm mt-1">Administrasi Bisnis & Digital</div>
                </div>
             </div>
          </div>
        </div>
      </section>

       {/* News Preview */}
       <section className="py-20 px-6 max-w-7xl mx-auto animate-fade-in-up delay-300">
        <div className="flex justify-between items-end mb-12">
           <div>
             <h2 className="text-3xl font-bold text-slate-900">Berita Terbaru</h2>
             <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full mt-4"></div>
           </div>
           <button className="text-emerald-800 text-sm font-bold hover:text-emerald-950 flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 rounded-lg transition-colors">
             Arsip Berita <ArrowRightIcon className="w-4 h-4" />
           </button>
        </div>
        
        {loadingNews ? (
             <div className="flex justify-center items-center py-20 text-emerald-900">
                <LoaderIcon className="w-10 h-10 animate-spin" />
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.length === 0 ? (
                <div className="col-span-3 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                    Belum ada berita terbaru saat ini.
                </div>
            ) : (
                news.slice(0, 3).map((item) => (
                <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                    <div className="h-52 bg-slate-100 w-full flex items-center justify-center text-slate-300 group-hover:bg-slate-50 transition-colors relative overflow-hidden shrink-0">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <BookIcon className="w-16 h-16 group-hover:scale-110 transition-transform duration-500 text-slate-300 group-hover:text-emerald-200" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-7 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[10px] font-bold text-white bg-emerald-900 px-2.5 py-1 rounded shadow-md shadow-emerald-900/20 uppercase">{item.category}</span>
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {new Date(item.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-emerald-800 transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed flex-1">
                            {item.content}
                        </p>
                        <a 
                          href={`?news_id=${item.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-emerald-700 flex items-center gap-2 group-hover:gap-3 transition-all mt-auto"
                        >
                            Baca Selengkapnya <ArrowRightIcon className="w-4 h-4" />
                        </a>
                    </div>
                </div>
                ))
            )}
            </div>
        )}
       </section>

       <footer className="py-12 bg-slate-900 text-center text-white relative overflow-hidden border-t border-slate-800">
          <div className="relative z-10 container mx-auto px-6">
            <h3 className="font-bold text-2xl mb-8 tracking-wider">Follow Us</h3>
            
            <div className="flex justify-center gap-4 sm:gap-6 mb-12">
               {[
                 { Icon: FacebookIcon, label: "Facebook" },
                 { Icon: InstagramIcon, label: "Instagram" },
                 { Icon: YoutubeIcon, label: "YouTube" },
                 { Icon: TiktokIcon, label: "TikTok" }
               ].map((social, idx) => (
                 <div 
                   key={idx}
                   aria-label={social.label}
                   className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-2 border-white/20 rounded-lg text-white/20 cursor-not-allowed transition-all duration-300"
                 >
                   <social.Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                 </div>
               ))}
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8 max-w-2xl mx-auto"></div>

            <p className="text-slate-500 text-sm">&copy; 2026 SMKS Mathalul Anwar Buaranjati. All Rights Reserved.</p>
          </div>
       </footer>
    </div>
  );
}