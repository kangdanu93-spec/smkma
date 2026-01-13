import React, { useState, useEffect, useRef } from 'react';
import { databaseService } from '../services/database';
import { PrincipalData, NewsItem, MajorItem } from '../types';
import { UserIcon, CheckBadgeIcon, LoaderIcon, LockIcon, LogOutIcon, NewspaperIcon, PlusIcon, EditIcon, TrashIcon, XIcon, BookIcon, GraduationCapIcon, BuildingIcon, BoldIcon, ItalicIcon, UnderlineIcon, ListIcon, ListOrderedIcon, ImageIcon } from './ui/Icons';

// Helper to clean up URLs
const processImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
          return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
      }
  }
  return url;
};

// --- RICH TEXT EDITOR COMPONENT ---
interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Initialize content
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
             if (editorRef.current.innerText.trim() === '' && value === '') {
                 editorRef.current.innerHTML = '';
             } else if (value && editorRef.current.innerHTML === '') {
                 editorRef.current.innerHTML = value;
             }
        }
    }, []);

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className={`w-full rounded-lg border overflow-hidden bg-white transition-all ${isFocused ? 'border-emerald-500 ring-2 ring-emerald-900/10' : 'border-slate-200'}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('bold')} className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 rounded transition-colors" title="Bold">
                    <BoldIcon className="w-4 h-4" />
                </button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('italic')} className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 rounded transition-colors" title="Italic">
                    <ItalicIcon className="w-4 h-4" />
                </button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('underline')} className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 rounded transition-colors" title="Underline">
                    <UnderlineIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('insertUnorderedList')} className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 rounded transition-colors" title="Bullet List">
                    <ListIcon className="w-4 h-4" />
                </button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('insertOrderedList')} className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 rounded transition-colors" title="Numbered List">
                    <ListOrderedIcon className="w-4 h-4" />
                </button>
            </div>
            
            {/* Editable Area */}
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full p-4 min-h-[200px] outline-none prose prose-sm max-w-none text-slate-700 overflow-y-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                style={{ minHeight: '200px' }}
                dangerouslySetInnerHTML={{ __html: value }}
            />
            {(!value || value === '<br>') && (
                <div className="absolute top-[52px] left-4 text-slate-300 pointer-events-none text-sm">
                    {placeholder}
                </div>
            )}
        </div>
    );
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'principal' | 'news' | 'majors' | 'banner'>('principal');
  const [showHelp, setShowHelp] = useState(false);

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Principal & School Config Data State
  const [data, setData] = useState<PrincipalData>({
    name: '',
    title: '',
    message: '',
    photoUrl: '',
    schoolLogoUrl: ''
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

  // Majors Data State
  const [majorList, setMajorList] = useState<MajorItem[]>([]);
  const [isEditingMajor, setIsEditingMajor] = useState(false);
  const [currentMajor, setCurrentMajor] = useState<MajorItem>({
      id: '',
      code: '',
      name: '',
      description: '',
      logoUrl: '',
      colorTheme: 'slate',
      skills: [],
      careers: []
  });
  const [skillsString, setSkillsString] = useState('');
  const [careersString, setCareersString] = useState('');

  // Banner/Hero Images State
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [newHeroImage, setNewHeroImage] = useState('');

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
    // Load Principal & Config
    const result = await databaseService.getPrincipalData();
    if (result) {
      setData(result);
    } else {
        setData({
            name: 'Siti Komalia, S.Farm',
            title: 'Kepala Sekolah',
            message: 'Kami berkomitmen mencetak lulusan yang tidak hanya cerdas secara intelektual, namun juga matang secara emosional dan spiritual.',
            photoUrl: '',
            schoolLogoUrl: ''
        });
    }

    // Load News, Majors, and Hero Images
    await loadNews();
    await loadMajors();
    const heroes = await databaseService.getHeroImages();
    setHeroImages(heroes);
    
    setLoading(false);
  };

  const loadNews = async () => {
      const news = await databaseService.getNews();
      setNewsList(news);
  };

  const loadMajors = async () => {
      const majors = await databaseService.getMajors();
      setMajorList(majors);
  };

  // --- Image Input Handler ---
  const handleImageInput = (value: string, type: 'principal' | 'news' | 'major' | 'logo' | 'hero') => {
      setImgError(false); 
      const processed = processImageUrl(value);
      
      let warning = '';
      if (value.includes('photos.app.goo.gl')) {
          warning = '⚠️ Ini link album. Gunakan link langsung atau Google Drive.';
      } else if (value.includes('authuser=') || (value.includes('googleusercontent.com') && value.length > 50)) {
           warning = '⚠️ Link ini sementara (authuser). Gunakan Google Drive.';
      }

      setImgWarning(warning);

      if (type === 'principal') {
          setData({ ...data, photoUrl: processed });
      } else if (type === 'logo') {
          setData({ ...data, schoolLogoUrl: processed });
      } else if (type === 'news') {
          setCurrentNews({ ...currentNews, imageUrl: processed });
      } else if (type === 'major') {
          setCurrentMajor({ ...currentMajor, logoUrl: processed });
      } else if (type === 'hero') {
          setNewHeroImage(processed);
      }
  };

  // --- Principal Handlers ---

  const handlePrincipalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await databaseService.updatePrincipalData(data);
    if (success) {
      setSuccessMsg('Profil & Konfigurasi Sekolah berhasil diperbarui!');
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
      setImgWarning(''); setImgError(false); setShowHelp(false);
  };

  const handleEditNews = (item: NewsItem) => {
      setCurrentNews(item);
      setIsEditingNews(true);
      setImgWarning(''); setImgError(false);
  };

  const handleDeleteNews = async (id: string) => {
      if(confirm('Hapus berita ini?')) {
          setLoading(true);
          await databaseService.deleteNews(id);
          await loadNews();
          setLoading(false);
      }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      const success = await databaseService.saveNews(currentNews);
      if(success) {
          setSuccessMsg('Berita tersimpan!');
          setTimeout(() => setSuccessMsg(''), 3000);
          await loadNews();
          resetNewsForm();
      }
      setSaving(false);
  };

  // --- Major Handlers ---
  const resetMajorForm = () => {
    setCurrentMajor({
      id: '',
      code: '',
      name: '',
      description: '',
      logoUrl: '',
      colorTheme: 'slate',
      skills: [],
      careers: []
    });
    setSkillsString('');
    setCareersString('');
    setIsEditingMajor(false);
    setImgWarning(''); setImgError(false);
  };

  const handleEditMajor = (item: MajorItem) => {
    setCurrentMajor(item);
    setSkillsString(item.skills.join(', '));
    setCareersString(item.careers.join(', '));
    setIsEditingMajor(true);
    setImgWarning(''); setImgError(false);
  };

  const handleDeleteMajor = async (id: string) => {
    if(confirm('Hapus jurusan ini?')) {
      setLoading(true);
      await databaseService.deleteMajor(id);
      await loadMajors();
      setLoading(false);
    }
  };

  const handleMajorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const majorToSave: MajorItem = {
      ...currentMajor,
      skills: skillsString.split(',').map(s => s.trim()).filter(s => s),
      careers: careersString.split(',').map(s => s.trim()).filter(s => s),
    };

    const success = await databaseService.saveMajor(majorToSave);
    if(success) {
      setSuccessMsg('Data Jurusan tersimpan!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMajors();
      resetMajorForm();
    }
    setSaving(false);
  };

  // --- Banner/Hero Handlers ---
  const handleAddHeroImage = async () => {
      if (!newHeroImage) return;
      const updated = [...heroImages, newHeroImage];
      setHeroImages(updated);
      setNewHeroImage('');
      setImgWarning('');
      await databaseService.updateHeroImages(updated);
      setSuccessMsg('Banner berhasil ditambahkan!');
      setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteHeroImage = async (index: number) => {
      if(confirm('Hapus gambar banner ini?')) {
          const updated = heroImages.filter((_, i) => i !== index);
          setHeroImages(updated);
          await databaseService.updateHeroImages(updated);
      }
  };

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in-up">
           <div className="bg-slate-900 p-8 text-center">
             <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
               <LockIcon className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold text-white tracking-tight">Admin Login</h2>
           </div>
           
           <div className="p-8">
             {loginError && <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg font-medium text-center">{loginError}</div>}
             <form onSubmit={handleLogin} className="space-y-5">
               <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200" placeholder="Username" />
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200" placeholder="Password" />
               <button type="submit" className="w-full py-3.5 bg-emerald-900 text-white font-bold rounded-xl hover:bg-emerald-800 transition-all shadow-lg mt-4">Masuk</button>
             </form>
           </div>
        </div>
      </div>
    );
  }

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
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-bold transition-colors">
                    <LogOutIcon className="w-4 h-4" /> Logout
                </button>
            </div>
            
            <div className="flex px-6 gap-6 overflow-x-auto">
                <button onClick={() => setActiveTab('principal')} className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'principal' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-500'}`}>
                    <BuildingIcon className="w-4 h-4"/> Konfigurasi Sekolah
                </button>
                <button onClick={() => setActiveTab('banner')} className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'banner' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-500'}`}>
                    <ImageIcon className="w-4 h-4"/> Manajemen Banner
                </button>
                <button onClick={() => setActiveTab('news')} className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'news' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-500'}`}>
                    <NewspaperIcon className="w-4 h-4"/> Manajemen Berita
                </button>
                <button onClick={() => setActiveTab('majors')} className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'majors' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-500'}`}>
                    <GraduationCapIcon className="w-4 h-4"/> Manajemen Jurusan
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

          {/* TAB 1: PRINCIPAL & SCHOOL CONFIG DATA */}
          {activeTab === 'principal' && (
             <form onSubmit={handlePrincipalSubmit} className="space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Column 1: Principal Info */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Informasi Kepala Sekolah</h4>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                            <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Jabatan</label>
                            <input type="text" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Isi Sambutan</label>
                            <textarea rows={6} value={data.message} onChange={(e) => setData({ ...data, message: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 resize-none" />
                        </div>
                    </div>

                    {/* Column 2: Images & Config */}
                    <div className="space-y-8">
                        {/* School Logo Config */}
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 mb-4">Logo Sekolah (Header)</h4>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Link Gambar Logo</label>
                            <input type="text" placeholder="https://..." value={data.schoolLogoUrl || ''} onChange={(e) => handleImageInput(e.target.value, 'logo')} className="w-full px-4 py-3 mb-4 rounded-lg bg-slate-50 border border-slate-200" />
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden">
                                     {data.schoolLogoUrl ? (
                                         <img src={data.schoolLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                                     ) : (
                                         <span className="text-2xl font-bold text-emerald-900">M</span>
                                     )}
                                </div>
                                <span className="text-sm text-slate-500">Preview Tampilan Logo</span>
                            </div>
                        </div>

                        {/* Principal Photo */}
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 mb-4">Foto Kepala Sekolah</h4>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Link Foto (URL)</label>
                            <input type="text" placeholder="https://..." value={data.photoUrl} onChange={(e) => handleImageInput(e.target.value, 'principal')} className="w-full px-4 py-3 mb-4 rounded-lg bg-slate-50 border border-slate-200" />
                            <div className="flex justify-center">
                                <div className="relative w-40 h-40 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden">
                                    {data.photoUrl ? <img src={data.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300"><UserIcon className="w-16 h-16" /></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={saving} className="px-8 py-3 bg-emerald-900 text-white font-bold rounded-lg hover:bg-emerald-800 shadow-lg disabled:opacity-50 flex items-center gap-2">{saving ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Simpan Perubahan'}</button>
                </div>
            </form>
          )}

          {/* TAB 2: HERO / BANNER MANAGEMENT */}
          {activeTab === 'banner' && (
              <div className="animate-fade-in-up space-y-8">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-lg text-slate-800 mb-4">Tambah Gambar Banner</h4>
                      <div className="flex flex-col md:flex-row gap-4 items-start">
                          <div className="w-full flex-1">
                              <input 
                                  type="text" 
                                  placeholder="Masukkan URL Gambar (Google Drive / Direct Link)" 
                                  value={newHeroImage} 
                                  onChange={(e) => handleImageInput(e.target.value, 'hero')} 
                                  className="w-full px-4 py-3 rounded-lg border border-slate-200"
                              />
                              {imgWarning && <p className="text-xs text-amber-600 mt-1">{imgWarning}</p>}
                          </div>
                          <button onClick={handleAddHeroImage} disabled={!newHeroImage} className="px-6 py-3 bg-emerald-900 text-white font-bold rounded-lg hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap">
                              <PlusIcon className="w-5 h-5 inline mr-2" /> Tambah
                          </button>
                      </div>
                  </div>

                  <div>
                      <h4 className="font-bold text-lg text-slate-800 mb-4">Daftar Banner Aktif ({heroImages.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {heroImages.length === 0 ? (
                              <div className="col-span-2 text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                  Belum ada gambar banner kustom. Menggunakan gambar default.
                              </div>
                          ) : (
                              heroImages.map((img, idx) => (
                                  <div key={`${img}-${idx}`} className="group relative aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200 isolate">
                                      <img src={img} alt={`Banner ${idx}`} className="w-full h-full object-cover relative z-0" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                          <button 
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteHeroImage(idx);
                                              }}
                                              className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all cursor-pointer shadow-lg"
                                          >
                                              <TrashIcon className="w-4 h-4" /> Hapus
                                          </button>
                                      </div>
                                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded font-mono z-20">
                                          Slide #{idx + 1}
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          )}

          {/* TAB 3: NEWS MANAGEMENT */}
          {activeTab === 'news' && (
              <div className="animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900">{isEditingNews ? (currentNews.id ? 'Edit Berita' : 'Tambah Berita') : 'Daftar Berita'}</h3>
                      {!isEditingNews ? (
                          <button onClick={() => setIsEditingNews(true)} className="px-4 py-2 bg-emerald-900 text-white text-sm font-bold rounded-lg hover:bg-emerald-800 flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Tambah Berita</button>
                      ) : (
                           <button onClick={resetNewsForm} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 flex items-center gap-2"><XIcon className="w-4 h-4" /> Batal</button>
                      )}
                  </div>

                  {isEditingNews ? (
                      <form onSubmit={handleNewsSubmit} className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <div className="md:col-span-2 space-y-4">
                                   <input type="text" required placeholder="Judul Berita" value={currentNews.title} onChange={(e) => setCurrentNews({...currentNews, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                                   <div className="grid grid-cols-2 gap-4">
                                       <select value={currentNews.category} onChange={(e) => setCurrentNews({...currentNews, category: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200">
                                            <option value="NEWS">Berita Umum</option>
                                            <option value="EVENT">Agenda / Event</option>
                                            <option value="PRESTASI">Prestasi</option>
                                       </select>
                                       <input type="date" required value={currentNews.date} onChange={(e) => setCurrentNews({...currentNews, date: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                                   </div>
                                   
                                   {/* Rich Text Editor Replacement */}
                                   <div className="space-y-1">
                                       <label className="block text-xs font-bold text-slate-500 uppercase">Konten Berita</label>
                                       <RichTextEditor 
                                           value={currentNews.content} 
                                           onChange={(val) => setCurrentNews({...currentNews, content: val})} 
                                           placeholder="Tulis konten berita di sini..."
                                       />
                                   </div>

                               </div>
                               <div className="space-y-4">
                                   <input type="text" placeholder="Link Gambar Cover (URL)" value={currentNews.imageUrl} onChange={(e) => handleImageInput(e.target.value, 'news')} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm" />
                                   <div className="w-full aspect-video bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center overflow-hidden">
                                       {currentNews.imageUrl && !imgError ? <img src={currentNews.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setImgError(true)} /> : <div className="text-center text-slate-300"><NewspaperIcon className="w-8 h-8 mx-auto" /></div>}
                                   </div>
                               </div>
                           </div>
                           <div className="flex justify-end pt-4 border-t border-slate-200">
                                <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-900 text-white font-bold rounded-lg hover:bg-emerald-800 shadow-lg">{saving ? 'Menyimpan...' : 'Simpan Berita'}</button>
                           </div>
                      </form>
                  ) : (
                      <div className="grid grid-cols-1 gap-4">
                          {newsList.map((item) => (
                                  <div key={item.id} className="flex flex-col md:flex-row gap-6 p-5 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all group">
                                      <div className="w-full md:w-48 h-32 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
                                          {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><BookIcon className="w-8 h-8" /></div>}
                                           <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur text-[10px] font-bold uppercase rounded-full text-slate-800 shadow-sm border border-slate-100">{item.category}</div>
                                      </div>
                                      <div className="flex-1 flex flex-col">
                                          <div className="flex justify-between items-start">
                                              <h4 className="font-bold text-slate-900 text-lg mb-2 leading-snug">{item.title}</h4>
                                              <div className="flex gap-2 shrink-0 ml-4">
                                                  <button onClick={() => handleEditNews(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit"><EditIcon className="w-5 h-5" /></button>
                                                  <button onClick={() => handleDeleteNews(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus"><TrashIcon className="w-5 h-5" /></button>
                                              </div>
                                          </div>
                                          <p className="text-xs text-slate-400 mb-2 font-medium">{new Date(item.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                          <p className="text-sm text-slate-500 line-clamp-2">{item.content.replace(/<[^>]+>/g, '')}</p>
                                      </div>
                                  </div>
                              ))}
                      </div>
                  )}
              </div>
          )}

          {/* TAB 4: MAJORS MANAGEMENT */}
          {activeTab === 'majors' && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">{isEditingMajor ? 'Formulir Jurusan' : 'Daftar Jurusan'}</h3>
                {!isEditingMajor ? (
                  <button onClick={() => setIsEditingMajor(true)} className="px-4 py-2 bg-emerald-900 text-white text-sm font-bold rounded-lg hover:bg-emerald-800 flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Tambah Jurusan</button>
                ) : (
                  <button onClick={resetMajorForm} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 flex items-center gap-2"><XIcon className="w-4 h-4" /> Batal</button>
                )}
              </div>

              {isEditingMajor ? (
                <form onSubmit={handleMajorSubmit} className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" required placeholder="Kode (mis: DKV)" value={currentMajor.code} onChange={(e) => setCurrentMajor({...currentMajor, code: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                        <select value={currentMajor.colorTheme} onChange={(e) => setCurrentMajor({...currentMajor, colorTheme: e.target.value as any})} className="w-full px-4 py-2 rounded-lg border border-slate-200">
                          <option value="orange">Orange Theme</option>
                          <option value="blue">Blue Theme</option>
                          <option value="purple">Purple Theme</option>
                          <option value="emerald">Emerald Theme</option>
                          <option value="rose">Rose Theme</option>
                          <option value="slate">Slate Theme</option>
                        </select>
                      </div>
                      <input type="text" required placeholder="Nama Lengkap Jurusan" value={currentMajor.name} onChange={(e) => setCurrentMajor({...currentMajor, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                      <textarea rows={3} required placeholder="Deskripsi Singkat" value={currentMajor.description} onChange={(e) => setCurrentMajor({...currentMajor, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                      
                      {/* Logo Upload */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Link Logo Jurusan (Opsional)</label>
                        <input type="text" placeholder="https://..." value={currentMajor.logoUrl} onChange={(e) => handleImageInput(e.target.value, 'major')} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm" />
                        {imgWarning && <p className="text-xs text-amber-600 mt-1">{imgWarning}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kompetensi (Pisahkan dengan koma)</label>
                        <textarea rows={3} placeholder="Desain Grafis, Fotografi, ..." value={skillsString} onChange={(e) => setSkillsString(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prospek Karir (Pisahkan dengan koma)</label>
                        <textarea rows={3} placeholder="Graphic Designer, Video Editor, ..." value={careersString} onChange={(e) => setCareersString(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                      </div>
                      <div className="flex items-center gap-4 mt-2 bg-white p-3 rounded-lg border border-slate-200">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                             currentMajor.colorTheme === 'orange' ? 'from-orange-500 to-amber-500' :
                             currentMajor.colorTheme === 'blue' ? 'from-blue-600 to-indigo-600' :
                             currentMajor.colorTheme === 'purple' ? 'from-purple-600 to-fuchsia-600' :
                             currentMajor.colorTheme === 'emerald' ? 'from-emerald-600 to-teal-600' :
                             currentMajor.colorTheme === 'rose' ? 'from-rose-600 to-pink-600' :
                             'from-slate-700 to-slate-900'
                          }`}>
                            {currentMajor.logoUrl && !imgError ? (
                              <img src={currentMajor.logoUrl} className="w-10 h-10 object-contain" onError={() => setImgError(true)} />
                            ) : (
                              <span className="text-white font-bold text-xl">{currentMajor.code || '?'}</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">Preview Icon / Logo</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-200">
                    <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-900 text-white font-bold rounded-lg hover:bg-emerald-800 shadow-lg">{saving ? 'Menyimpan...' : 'Simpan Jurusan'}</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {majorList.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">Belum ada data jurusan.</div>
                  ) : (
                    majorList.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-sm bg-gradient-to-br ${
                             item.colorTheme === 'orange' ? 'from-orange-500 to-amber-500' :
                             item.colorTheme === 'blue' ? 'from-blue-600 to-indigo-600' :
                             item.colorTheme === 'purple' ? 'from-purple-600 to-fuchsia-600' :
                             item.colorTheme === 'emerald' ? 'from-emerald-600 to-teal-600' :
                             item.colorTheme === 'rose' ? 'from-rose-600 to-pink-600' :
                             'from-slate-700 to-slate-900'
                           }`}>
                             {item.logoUrl ? (
                               <img src={item.logoUrl} className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                             ) : item.code}
                           </div>
                           <div>
                             <h4 className="font-bold text-slate-900">{item.name}</h4>
                             <p className="text-xs text-slate-500">{item.code} - {item.skills.length} Kompetensi</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleEditMajor(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><EditIcon className="w-5 h-5" /></button>
                           <button onClick={() => handleDeleteMajor(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
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