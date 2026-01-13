import React, { useState, useEffect } from 'react';
import { PortalMode, PrincipalData, NewsItem, MajorItem } from '../types';
import { databaseService } from '../services/database';
import { ArrowRightIcon, BrainIcon, MapIcon, MicIcon, BookIcon, UserIcon, CheckBadgeIcon, FacebookIcon, InstagramIcon, YoutubeIcon, TiktokIcon, LoaderIcon, PaletteIcon, WrenchIcon, BuildingIcon, NewspaperIcon } from './ui/Icons';

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
  const [majors, setMajors] = useState<MajorItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  
  // Slider State
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Principal
      const pData = await databaseService.getPrincipalData();
      if (pData) setPrincipal(pData);

      // Fetch Hero Images
      const heroes = await databaseService.getHeroImages();
      setHeroImages(heroes);

      // Fetch News
      const nData = await databaseService.getNews();
      setNews(nData);
      
      // Fetch Majors
      const mData = await databaseService.getMajors();
      setMajors(mData);
      
      setLoadingNews(false);
    };
    fetchData();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (heroImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 8000); // 8 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Helper for Theme Colors
  const getThemeColors = (theme: string) => {
      switch(theme) {
          case 'orange': return { bg: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20', text: 'text-orange-600', border: 'hover:border-orange-500/30', blur: 'bg-orange-100/30' };
          case 'blue': return { bg: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-600/20', text: 'text-blue-700', border: 'hover:border-blue-500/30', blur: 'bg-blue-100/30' };
          case 'purple': return { bg: 'from-purple-600 to-fuchsia-600', shadow: 'shadow-purple-600/20', text: 'text-purple-700', border: 'hover:border-purple-500/30', blur: 'bg-purple-100/30' };
          case 'emerald': return { bg: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-600/20', text: 'text-emerald-700', border: 'hover:border-emerald-500/30', blur: 'bg-emerald-100/30' };
          case 'rose': return { bg: 'from-rose-600 to-pink-600', shadow: 'shadow-rose-600/20', text: 'text-rose-700', border: 'hover:border-rose-500/30', blur: 'bg-rose-100/30' };
          default: return { bg: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-600/20', text: 'text-slate-700', border: 'hover:border-slate-500/30', blur: 'bg-slate-100/30' };
      }
  };

  const getDefaultIcon = (code: string) => {
      if (code === 'DKV') return <PaletteIcon className="w-12 h-12" />;
      if (code === 'TKR') return <WrenchIcon className="w-12 h-12" />;
      if (code === 'AP' || code === 'MPLB') return <BuildingIcon className="w-12 h-12" />;
      return <BookIcon className="w-12 h-12" />;
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar relative">
      
      {/* --- HERO SECTION WITH SLIDER --- */}
      <section className="relative w-full h-[600px] flex flex-col items-center justify-center text-center overflow-hidden">
        
        {/* Background Slideshow */}
        {heroImages.length > 0 && heroImages.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
             <img src={img} alt="Hero Background" className="w-full h-full object-cover" />
             {/* Dark Overlay for Text Readability */}
             <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
          </div>
        ))}

        {/* Content Content */}
        <div className="relative z-10 max-w-6xl px-6 space-y-8 animate-fade-in-up flex flex-col items-center">
          
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold shadow-lg cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            PPDB 2026 RESMI DIBUKA
          </div>
          
          <div className="space-y-4 flex flex-col items-center">
            <span className="block text-amber-400 font-bold text-sm md:text-lg tracking-[0.2em] uppercase">
              Selamat Datang Di Website
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] drop-shadow-2xl">
              SMKS MATHLAUL ANWAR <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                BUARANJATI
              </span>
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed font-medium mx-auto drop-shadow-md">
            Membentuk Generasi Unggul & Berkarakter dengan teknologi masa depan dan integritas tinggi.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-5 mt-6">
             <button 
               onClick={() => onNavigate(PortalMode.THINK)}
               className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:-translate-y-1 flex items-center gap-3 active:scale-95 border-b-4 border-emerald-800 hover:border-emerald-700"
             >
               <BrainIcon className="w-5 h-5 text-emerald-100 group-hover:rotate-12 transition-transform" />
               Tanya Asisten AI
             </button>
             <button 
               onClick={() => onNavigate(PortalMode.PPDB)}
               className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border-b-4 border-slate-300 hover:border-white hover:bg-slate-50 shadow-xl hover:-translate-y-1 transition-all active:scale-95"
             >
               Daftar Sekarang
             </button>
          </div>
        </div>

        {/* Slider Indicators - Moved outside content div to be relative to section */}
        {heroImages.length > 1 && (
            <div className="absolute bottom-8 z-20 flex gap-2">
                {heroImages.map((_, idx) => (
                <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-emerald-400 w-8' : 'bg-white/30 hover:bg-white'}`}
                />
                ))}
            </div>
        )}
      </section>

      {/* --- LATEST NEWS GRID (PREMIUM & ELEGANT) --- */}
      <section className="py-12 px-6 max-w-7xl mx-auto relative z-20">
         {/* Section Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="flex items-center gap-4">
                 <div className="h-12 w-2 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
                 <div className="space-y-1">
                    <h3 className="font-black text-slate-900 text-2xl md:text-4xl tracking-tight leading-none">
                        Berita Terkini
                    </h3>
                    <p className="text-slate-500 text-sm md:text-base font-medium">
                        Update informasi terbaru seputar kegiatan sekolah
                    </p>
                 </div>
            </div>
            
            <button className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-900 text-sm font-bold hover:bg-emerald-100 transition-all shadow-sm group">
                Lihat Semua Berita <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </button>
         </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingNews ? (
                // Elegant Skeletons
                 [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl overflow-hidden h-96 animate-pulse shadow-2xl border border-white/50">
                        <div className="w-full h-64 bg-slate-200"></div>
                        <div className="p-8 space-y-4">
                            <div className="h-4 bg-slate-200 rounded-full w-1/3 mb-2"></div>
                            <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
                            <div className="h-4 bg-slate-200 rounded-full w-2/3 mt-4"></div>
                        </div>
                    </div>
                ))
            ) : news.length === 0 ? (
                <div className="col-span-3 bg-white/95 backdrop-blur rounded-3xl p-16 text-center border border-slate-200 shadow-2xl flex flex-col items-center justify-center">
                    <NewspaperIcon className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-slate-500 text-lg font-medium">Belum ada berita terbaru saat ini.</p>
                </div>
            ) : (
                news.slice(0, 3).map((item, index) => (
                    <a 
                        key={item.id}
                        href={`?news_id=${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group bg-white rounded-[2rem] overflow-hidden cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 shadow-xl border border-slate-100 flex flex-col h-full opacity-0 animate-fade-in-up`}
                        style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
                    >
                        {/* Image Area - Full Bleed & Large */}
                        <div className="w-full h-72 bg-slate-100 relative overflow-hidden shrink-0">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                    <NewspaperIcon className="w-20 h-20 opacity-50" />
                                </div>
                            )}
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>

                            {/* Floating Category Badge */}
                            <div className="absolute top-5 left-5">
                                 <span className="px-4 py-1.5 bg-white/90 backdrop-blur-xl text-emerald-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/60 flex items-center gap-2 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-white animate-pulse"></span>
                                    {item.category}
                                 </span>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-8 flex flex-col flex-1 relative bg-white">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-[100px] opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex items-center gap-3 mb-4 text-xs font-bold text-slate-400 relative z-10">
                               <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                   <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                   </svg>
                                   {new Date(item.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                               </div>
                            </div>
                            
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2 relative z-10">
                                {item.title}
                            </h3>
                            
                            <p className="text-slate-500 line-clamp-3 mb-8 text-sm leading-relaxed relative z-10 font-medium">
                                {item.content.replace(/<[^>]+>/g, '')}
                            </p>

                            <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between group/btn relative z-10">
                                <span className="text-sm font-black text-emerald-900 group-hover:text-emerald-600 transition-colors uppercase tracking-wide text-[10px]">Baca Selengkapnya</span>
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-emerald-900/30 group-hover:scale-110">
                                     <ArrowRightIcon className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                                </div>
                            </div>
                        </div>
                    </a>
                ))
            )}
        </div>
      </section>

      {/* --- INFO SECTION (Principal & Majors) --- */}
      <section className="py-20 px-6 bg-white overflow-hidden animate-fade-in-up delay-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
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

            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
                <svg className="absolute -left-8 top-10 w-16 h-16 text-amber-300 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
                <div className="relative z-10 w-full max-w-md">
                    <div className="absolute top-6 right-6 w-full h-full bg-slate-200/50 rounded-3xl -z-20 transform rotate-6"></div>
                    <div className="absolute top-0 right-0 w-full h-full bg-slate-900 rounded-3xl -z-10 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-slate-900 opacity-50"></div>
                       <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                    </div>
                    <div className="relative pt-8 px-8 pb-0 flex justify-center">
                         {principal.photoUrl ? (
                            <img 
                              src={principal.photoUrl} 
                              alt={principal.name} 
                              className="w-full h-auto object-cover rounded-t-xl shadow-2xl z-10 relative transform hover:scale-[1.02] transition-transform duration-500" 
                              style={{ minHeight: '400px', maxHeight: '550px' }} 
                              onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = document.getElementById('principal-fallback');
                                  if(fallback) fallback.style.display = 'flex';
                              }}
                            />
                         ) : null}
                         <div id="principal-fallback" className="w-full h-[450px] bg-slate-800 rounded-t-xl flex items-center justify-center text-slate-600 border-b border-slate-700" style={{display: principal.photoUrl ? 'none' : 'flex'}}>
                            <UserIcon className="w-32 h-32 opacity-50" />
                        </div>
                    </div>
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

        {/* Major Cards Below - Dynamic */}
        <div className="max-w-7xl mx-auto mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             {majors.map((major) => {
                 const theme = getThemeColors(major.colorTheme);
                 return (
                    <div 
                        key={major.id}
                        onClick={() => onNavigate(PortalMode.MAJORS)}
                        className={`group p-5 bg-white rounded-2xl border border-slate-100 ${theme.border} flex items-center gap-6 shadow-sm hover:shadow-xl hover:-translate-x-1 transition-all cursor-pointer relative overflow-hidden`}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${theme.blur} rounded-full blur-2xl -mr-10 -mt-10 transition-colors`}></div>
                        {/* Container Size w-24 h-24 */}
                        <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${theme.bg} text-white flex items-center justify-center text-3xl font-black shrink-0 shadow-lg ${theme.shadow} group-hover:scale-105 transition-transform z-10 p-3`}>
                        {major.logoUrl ? (
                            <img src={major.logoUrl} alt={major.code} className="w-full h-full object-contain filter drop-shadow-md" onError={(e) => e.currentTarget.style.display='none'} />
                        ) : (
                            getDefaultIcon(major.code)
                        )}
                        </div>
                        <div className="z-10">
                        <div className={`text-2xl font-black text-slate-900 group-hover:${theme.text} transition-colors`}>{major.code}</div>
                        <div className="text-slate-500 text-sm mt-1 font-medium line-clamp-1">{major.name}</div>
                        </div>
                    </div>
                 );
             })}
          </div>
        </div>
      </section>

       <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800 text-slate-300">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                
                {/* Column 1: School Info */}
                <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white">SMKS Mathlaul Anwar Buaranjati</h3>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                          SMKS Mathlaul Anwar Buaranjati adalah institusi pendidikan unggulan yang berfokus pada karakter, teknologi, dan prestasi akademik.
                      </p>
                    </div>
                    <div className="flex gap-4">
                        {[
                          { Icon: FacebookIcon, label: "Facebook" },
                          { Icon: InstagramIcon, label: "Instagram" },
                          { Icon: YoutubeIcon, label: "YouTube" },
                          { Icon: TiktokIcon, label: "TikTok" }
                        ].map((social, idx) => (
                          <a key={idx} href="#" aria-label={social.label} className="text-slate-400 hover:text-emerald-400 transition-colors">
                            <social.Icon className="w-5 h-5" />
                          </a>
                        ))}
                    </div>
                </div>

                {/* Column 2: Contact */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white">Hubungi Kami</h3>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <MapIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">JL. Raya Mauk Km. 16 Kec. Sukadiri Kab. Tangerang, Banten 15530</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            <span>(021) 5937-1234</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                            <span>info@smkma-buaranjati.sch.id</span>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Quick Links */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white">Tautan Cepat</h3>
                    <ul className="space-y-3 text-sm">
                        <li>
                          <button onClick={() => onNavigate(PortalMode.MAJORS)} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Program Studi
                          </button>
                        </li>
                        <li>
                          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Beranda
                          </button>
                        </li>
                        <li>
                          <button onClick={() => onNavigate(PortalMode.PPDB)} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Pendaftaran (PPDB)
                          </button>
                        </li>
                        <li>
                          <button onClick={() => onNavigate(PortalMode.BKK)} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Bursa Kerja (BKK)
                          </button>
                        </li>
                        <li>
                          <button onClick={() => onNavigate(PortalMode.ADMIN)} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Login Admin
                          </button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
                <p className="text-slate-500 text-sm">&copy; 2026 SMKS Mathlaul Anwar Buaranjati. All Rights Reserved.</p>
            </div>
          </div>
       </footer>
    </div>
  );
}