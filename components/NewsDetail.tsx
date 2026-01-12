import React, { useEffect, useState } from 'react';
import { databaseService } from '../services/database';
import { NewsItem } from '../types';
import { LoaderIcon, ArrowRightIcon, BookIcon, FacebookIcon, InstagramIcon, YoutubeIcon, TiktokIcon } from './ui/Icons';

interface NewsDetailProps {
  id: string;
}

export default function NewsDetail({ id }: NewsDetailProps) {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const data = await databaseService.getNewsById(id);
      setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoaderIcon className="w-10 h-10 animate-spin text-emerald-900" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 text-slate-400">
           <BookIcon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Berita Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Artikel yang Anda cari mungkin telah dihapus atau link tidak valid.</p>
        <a href="/" className="px-6 py-3 bg-emerald-900 text-white rounded-lg font-bold hover:bg-emerald-800 transition-colors">
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
       {/* Simple Header */}
       <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-900 flex items-center justify-center font-bold text-white shadow-sm">M</div>
                 <div className="flex flex-col">
                   <span className="text-sm font-black text-slate-900 uppercase">SMKS Mathlaul Anwar</span>
                   <span className="text-[10px] font-bold text-emerald-600 uppercase">Buaranjati</span>
                 </div>
             </div>
             <a href="/" className="text-sm font-bold text-slate-500 hover:text-emerald-900 flex items-center gap-2">
                Beranda <ArrowRightIcon className="w-4 h-4" />
             </a>
          </div>
       </header>

       <article className="max-w-4xl mx-auto px-6 py-12 animate-fade-in-up">
          {/* Breadcrumb / Category */}
          <div className="flex items-center gap-3 mb-6">
             <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wide">
                {news.category}
             </span>
             <span className="text-slate-400 text-sm font-medium">
               {new Date(news.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
             </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
             {news.title}
          </h1>

          {/* Featured Image */}
          <div className="w-full aspect-video bg-slate-100 rounded-2xl overflow-hidden mb-10 shadow-lg relative flex items-center justify-center">
             {news.imageUrl && (
                <img 
                  src={news.imageUrl} 
                  alt={news.title} 
                  className="w-full h-full object-cover absolute inset-0 z-10" 
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
             )}
             <div className="text-slate-300 z-0">
                <BookIcon className="w-20 h-20" />
             </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
             {news.content}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Bagikan Berita Ini</h3>
             <div className="flex gap-4">
                 {[FacebookIcon, InstagramIcon, YoutubeIcon, TiktokIcon].map((Icon, i) => (
                    <button key={i} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                       <Icon className="w-5 h-5" />
                    </button>
                 ))}
             </div>
          </div>
       </article>

       <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center text-slate-500 text-sm mt-12">
          &copy; 2026 SMKS Mathlaul Anwar Buaranjati. All Rights Reserved.
       </footer>
    </div>
  );
}