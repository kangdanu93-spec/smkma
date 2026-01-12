import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/database';
import { PrincipalData, NewsItem } from '../types';
import { UserIcon, CheckBadgeIcon, LoaderIcon, LockIcon, LogOutIcon, NewspaperIcon, PlusIcon, EditIcon, TrashIcon, XIcon, BookIcon } from './ui/Icons';

// Helper to clean up URLs
const processImageUrl = (url: string) => {
  if (!url) return '';
  
  // Support Google Drive Sharing Links
  // Convert https://drive.google.com/file/d/ID/view... -> https://drive.google.com/uc?export=view&id=ID
  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
          return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
      }
  }
  
  return url;
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'principal' | 'news'>('principal');
  const [showHelp, setShowHelp] = useState(false);

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Principal Data State
  const [data, setData] = useState<PrincipalData>({
    name: '',
    title: '',
    message: '',
    photoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Image Validation State
  const [imgWarning, setImgWarning] = useState('');
  const [imgError, setImgError] = useState(false);

  // News Data State
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [currentNews, setCurrentNews] = useState<NewsItem>({
      id: '',
      title: '',
      content: '',
      category: 'NEWS',
      date: new Date().toISOString().split('T')[0],
      imageUrl: ''
  });

  useEffect(() => {
    // Check session storage on mount
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadAllData();
    }
    setAuthLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (username === 'admin' && password === 'smkma@2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      loadAllData();
    } else {
      setLoginError('Username atau Password salah!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setUsername('');
    setPassword('');
  };

  const loadAllData = async () => {
    setLoading(true);
    // Load Principal
    const result = await databaseService.getPrincipalData();
    if (result) {
      setData(result);
    } else {
        setData({
            name: 'Siti Komalia, S.Farm',
            title: 'Kepala Sekolah',
            message: 'Kami berkomitmen mencetak lulusan yang tidak hanya cerdas secara intelektual, namun juga matang secara emosional dan spiritual. Teknologi adalah alat, karakter adalah kunci.',
            photoUrl: ''
        });
    }

    // Load News
    await loadNews();
    setLoading(false);
  };

  const loadNews = async () => {
      const news = await databaseService.getNews();
      setNewsList(news);
  };

  // --- Image Input Handler ---
  const handleImageInput = (value: string, type: 'principal' | 'news') => {
      setImgError(false); // Reset error state on change
      const processed = processImageUrl(value);
      
      let warning = '';
      if (value.includes('photos.app.goo.gl')) {
          warning = '⚠️ Ini link album/share. Gunakan link langsung (Klik Kanan > Copy Image Address) atau Google Drive.';
      } else if (value.includes('authuser=') || (value.includes('googleusercontent.com') && value.length > 50)) {
           // Warning for likely session-based links
           warning = '⚠️ Link ini terlihat seperti link sesi sementara (authuser). Sebaiknya gunakan Google Drive (Public) agar gambar awet.';
      }

      setImgWarning(warning);

      if (type === 'principal') {
          setData({ ...data, photoUrl: processed });
      } else {
          setCurrentNews({ ...currentNews, imageUrl: processed });
      }
  };

  // --- Principal Handlers ---

  const handlePrincipalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const success = await databaseService.updatePrincipalData(data);
    if (success) {
      setSuccessMsg('Profil Kepala Sekolah berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setSaving(false);
  };

  // --- News Handlers ---
  const resetNewsForm = () => {
      setCurrentNews({
          id: '',
          title: '',
          content: '',
          category: 'NEWS',
          date: new Date().toISOString().split('T')[0],
          imageUrl: ''
      });
      setIsEditingNews(false);
      setImgWarning('');
      setImgError(false);
      setShowHelp(false);
  };

  const handleEditNews = (item: NewsItem) => {
      setCurrentNews(item);
      setIsEditingNews(true);
      setImgWarning('');
      setImgError(false);
  };

  const handleDeleteNews = async (id: string) => {
      if(confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
          setLoading(true);
          await databaseService.deleteNews(id);
          await loadNews();
          setLoading(false);
      }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      // Pass null as file because we are using URL string
      const success = await databaseService.saveNews(currentNews);
      if(success) {
          setSuccessMsg(currentNews.id ? 'Berita diperbarui!' : 'Berita ditambahkan!');
          setTimeout(() => setSuccessMsg(''), 3000);
          await loadNews();
          resetNewsForm();
      }
      setSaving(false);
  };

  if (authLoading) return null;

  // LOGIN VIEW
  if (!isAuthenticated) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in-up">
           <div className="bg-slate-900 p-8 text-center">
             <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
               <LockIcon className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold text-white tracking-tight">Admin Login</h2>
             <p className="text-slate-400 text-sm mt-2">Masuk untuk mengelola data sekolah</p>
           </div>
           
           <div className="p-8">
             {loginError && (
               <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg font-medium text-center">
                 {loginError}
               </div>
             )}
             
             <form onSubmit={handleLogin} className="space-y-5">
               <div>
                 <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Username</label>
                 <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 text-slate-900 font-medium"
                   placeholder="Masukkan username"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Password</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 text-slate-900 font-medium"
                   placeholder="Masukkan password"
                 />
               </div>
               <button 
                 type="submit"
                 className="w-full py-3.5 bg-emerald-900 text-white font-bold rounded-xl hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl mt-4"
               >
                 Masuk Panel Admin
               </button>
             </form>
           </div>
        </div>
      </div>
    );
  }

  // ADMIN CONTENT VIEW
  if (loading && !isAuthenticated) return <div className="flex justify-center items-center h-full"><LoaderIcon className="w-8 h-8 animate-spin text-emerald-900" /></div>;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 pb-20">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-h-[80vh]">
        {/* Header & Tabs */}
        <div className="border-b border-slate-100 bg-slate-50">
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                    <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                    <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
                    <p className="text-sm text-slate-500">Kelola Website Sekolah</p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-bold transition-colors"
                >
                    <LogOutIcon className="w-4 h-4" /> Logout
                </button>
            </div>
            
            {/* Tabs */}
            <div className="flex px-6 gap-6">
                <button 
                    onClick={() => { setActiveTab('principal'); setImgWarning(''); setImgError(false); }}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'principal' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <UserIcon className="w-4 h-4"/> Profil Kepala Sekolah
                </button>
                <button 
                    onClick={() => { setActiveTab('news'); setImgWarning(''); setImgError(false); }}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'news' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <NewspaperIcon className="w-4 h-4"/> Manajemen Berita
                </button>
            </div>
        </div>

        <div className="p-6 md:p-8">
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-2 animate-fade-in-up">
              <CheckBadgeIcon className="w-5 h-5" />
              {successMsg}
            </div>
          )}

          {/* TAB 1: PRINCIPAL DATA */}
          {activeTab === 'principal' && (
             <form onSubmit={handlePrincipalSubmit} className="space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Kepala Sekolah</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Jabatan</label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Isi Sambutan</label>
                    <textarea
                        rows={6}
                        value={data.message}
                        onChange={(e) => setData({ ...data, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 resize-none"
                    />
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <label className="block text-sm font-bold text-slate-700 mb-4 w-full">Foto Profil</label>
                    
                    {/* URL Input */}
                    <div className="w-full mb-4">
                        <div className="flex justify-between items-center mb-1">
                             <span className="text-xs text-slate-500">Link URL Gambar</span>
                             <button 
                               type="button"
                               onClick={() => setShowHelp(!showHelp)}
                               className="text-xs text-emerald-600 font-bold hover:underline"
                             >
                               {showHelp ? 'Tutup Bantuan' : 'Cara ambil link?'}
                             </button>
                        </div>
                        
                        {showHelp && (
                            <div className="mb-3 p-3 bg-indigo-50 text-indigo-900 text-xs rounded-lg border border-indigo-100 space-y-2 animate-fade-in-up">
                                <p><strong className="text-indigo-700">Rekomendasi (Google Drive):</strong><br/>Upload foto ke Google Drive &rarr; Klik Kanan &rarr; Share &rarr; General Access: "Anyone with the link" &rarr; Copy Link &rarr; Tempel disini.</p>
                                <p><strong className="text-indigo-700">Alternatif (Imgur):</strong><br/>Upload ke Imgur.com &rarr; Klik Kanan pada gambar &rarr; "Copy Image Address".</p>
                                <p className="text-amber-700 bg-amber-50 p-1 rounded border border-amber-100 mt-1"><strong>⚠️ Penting:</strong> Jangan pakai link dari Google Photos yang mengandung <code>authuser</code> atau <code>lh3.googleusercontent</code> karena akan kadaluarsa.</p>
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder="https://drive.google.com/..."
                            value={data.photoUrl}
                            onChange={(e) => handleImageInput(e.target.value, 'principal')}
                            className={`w-full px-4 py-3 rounded-lg bg-slate-50 border focus:outline-none focus:ring-2 text-sm ${imgWarning || imgError ? 'border-amber-400 focus:ring-amber-200' : 'border-slate-200 focus:ring-emerald-900/20'}`}
                        />
                         {imgWarning ? (
                            <p className="text-xs text-amber-600 mt-2 font-bold bg-amber-50 p-2 rounded border border-amber-100 leading-tight">{imgWarning}</p>
                        ) : null}
                        {imgError && !imgWarning && (
                            <p className="text-xs text-rose-600 mt-2 font-bold bg-rose-50 p-2 rounded border border-rose-100 leading-tight">Gagal memuat gambar. Pastikan link dapat diakses publik.</p>
                        )}
                    </div>

                    <div className="relative w-48 h-48 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden mb-6 group">
                    {data.photoUrl && !imgError ? (
                        <img 
                            src={data.photoUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                           {imgError ? (
                               <>
                                <span className="text-2xl mb-1">⚠️</span>
                                <span className="text-[10px] font-bold text-slate-500">Link Error</span>
                               </>
                           ) : (
                               <UserIcon className="w-16 h-16" />
                           )}
                        </div>
                    )}
                    </div>
                </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-emerald-900 text-white font-bold rounded-lg hover:bg-emerald-800 shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Simpan Perubahan'}
                </button>
                </div>
            </form>
          )}

          {/* TAB 2: NEWS MANAGEMENT */}
          {activeTab === 'news' && (
              <div className="animate-fade-in-up">
                  {/* Toggle Form/List */}
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900">
                          {isEditingNews ? (currentNews.id ? 'Edit Berita' : 'Tambah Berita Baru') : 'Daftar Berita'}
                      </h3>
                      {!isEditingNews && (
                          <button 
                            onClick={() => setIsEditingNews(true)}
                            className="px-4 py-2 bg-emerald-900 text-white text-sm font-bold rounded-lg hover:bg-emerald-800 flex items-center gap-2"
                          >
                              <PlusIcon className="w-4 h-4" /> Tambah Berita
                          </button>
                      )}
                      {isEditingNews && (
                           <button 
                           onClick={resetNewsForm}
                           className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 flex items-center gap-2"
                         >
                             <XIcon className="w-4 h-4" /> Batal
                         </button>
                      )}
                  </div>

                  {isEditingNews ? (
                      /* NEWS FORM */
                      <form onSubmit={handleNewsSubmit} className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <div className="md:col-span-2 space-y-4">
                                   <div>
                                       <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Berita</label>
                                       <input 
                                          type="text" 
                                          required
                                          value={currentNews.title}
                                          onChange={(e) => setCurrentNews({...currentNews, title: e.target.value})}
                                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                                       />
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                       <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori</label>
                                            <select 
                                                value={currentNews.category}
                                                onChange={(e) => setCurrentNews({...currentNews, category: e.target.value})}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                                            >
                                                <option value="NEWS">Berita Umum</option>
                                                <option value="EVENT">Agenda / Event</option>
                                                <option value="PRESTASI">Prestasi</option>
                                            </select>
                                       </div>
                                       <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal</label>
                                            <input 
                                                type="date"
                                                required
                                                value={currentNews.date}
                                                onChange={(e) => setCurrentNews({...currentNews, date: e.target.value})}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                                            />
                                       </div>
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Konten Berita</label>
                                       <textarea 
                                          rows={6}
                                          required
                                          value={currentNews.content}
                                          onChange={(e) => setCurrentNews({...currentNews, content: e.target.value})}
                                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                                       />
                                   </div>
                               </div>

                               <div className="space-y-4">
                                   <div>
                                       <div className="flex justify-between items-center mb-1">
                                            <span className="block text-xs font-bold text-slate-700 uppercase">Link Gambar Cover (URL)</span>
                                            <button 
                                                type="button"
                                                onClick={() => setShowHelp(!showHelp)}
                                                className="text-xs text-emerald-600 font-bold hover:underline"
                                            >
                                                {showHelp ? 'Tutup Bantuan' : 'Cara ambil link?'}
                                            </button>
                                       </div>

                                        {showHelp && (
                                            <div className="mb-3 p-3 bg-indigo-50 text-indigo-900 text-xs rounded-lg border border-indigo-100 space-y-2 animate-fade-in-up">
                                                <p><strong className="text-indigo-700">Rekomendasi (Google Drive):</strong><br/>Upload foto ke Google Drive &rarr; Klik Kanan &rarr; Share &rarr; General Access: "Anyone with the link" &rarr; Copy Link &rarr; Tempel disini.</p>
                                                <p><strong className="text-indigo-700">Alternatif (Imgur):</strong><br/>Upload ke Imgur.com &rarr; Klik Kanan pada gambar &rarr; "Copy Image Address".</p>
                                                <p className="text-amber-700 bg-amber-50 p-1 rounded border border-amber-100 mt-1"><strong>⚠️ Penting:</strong> Jangan pakai link dari Google Photos yang mengandung <code>authuser</code> atau <code>lh3.googleusercontent</code> karena akan kadaluarsa.</p>
                                            </div>
                                        )}

                                       <input
                                            type="text"
                                            placeholder="https://drive.google.com/..."
                                            value={currentNews.imageUrl}
                                            onChange={(e) => handleImageInput(e.target.value, 'news')}
                                            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${imgWarning || imgError ? 'border-amber-400 focus:ring-amber-200' : 'border-slate-200 focus:ring-emerald-900/20'}`}
                                       />
                                       {imgWarning && (
                                           <p className="text-xs text-amber-600 mt-2 font-bold bg-amber-50 p-2 rounded border border-amber-100 leading-tight">{imgWarning}</p>
                                       )}
                                       {imgError && !imgWarning && (
                                            <p className="text-xs text-rose-600 mt-2 font-bold bg-rose-50 p-2 rounded border border-rose-100 leading-tight">Gagal memuat gambar. Pastikan link dapat diakses publik.</p>
                                       )}
                                   </div>
                                   
                                   <div className="w-full aspect-video bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center overflow-hidden relative">
                                       {currentNews.imageUrl && !imgError ? (
                                           <img 
                                            src={currentNews.imageUrl} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover" 
                                            onError={() => setImgError(true)}
                                           />
                                       ) : (
                                           <div className="text-center text-slate-300 p-4">
                                               {imgError ? (
                                                   <>
                                                     <span className="text-2xl">⚠️</span>
                                                     <p className="text-xs font-bold text-slate-400 mt-1">Gagal memuat gambar</p>
                                                   </>
                                               ) : (
                                                   <>
                                                     <NewspaperIcon className="w-8 h-8 mx-auto mb-2" />
                                                     <span className="text-xs">Preview Gambar</span>
                                                   </>
                                               )}
                                           </div>
                                       )}
                                   </div>
                               </div>
                           </div>
                           <div className="flex justify-end pt-4 border-t border-slate-200">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-emerald-900 text-white font-bold rounded-lg hover:bg-emerald-800 shadow-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Simpan Berita'}
                                </button>
                           </div>
                      </form>
                  ) : (
                      /* NEWS LIST */
                      <div className="grid grid-cols-1 gap-4">
                          {newsList.length === 0 ? (
                              <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                                  <NewspaperIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                  <p>Belum ada berita yang dipublikasikan.</p>
                              </div>
                          ) : (
                              newsList.map((item) => (
                                  <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                                      <div className="w-full md:w-32 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                          {item.imageUrl ? (
                                              <img 
                                                src={item.imageUrl} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement?.classList.add('bg-slate-200');
                                                }}
                                              />
                                          ) : null}
                                          {/* Fallback Icon visible if img hidden or null */}
                                          <BookIcon className={`w-8 h-8 text-slate-300 ${item.imageUrl ? 'absolute z-[-1]' : ''}`} />
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{item.category}</span>
                                              <span className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString('id-ID')}</span>
                                          </div>
                                          <h4 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h4>
                                          <p className="text-sm text-slate-500 line-clamp-2">{item.content}</p>
                                      </div>
                                      <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                                          <button 
                                            onClick={() => handleEditNews(item)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                          >
                                              <EditIcon className="w-5 h-5" />
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteNews(item.id)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                          >
                                              <TrashIcon className="w-5 h-5" />
                                          </button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}