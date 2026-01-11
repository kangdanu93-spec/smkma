import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/database';
import { PrincipalData } from '../types';
import { UserIcon, CheckBadgeIcon, LoaderIcon, LockIcon, LogOutIcon } from './ui/Icons';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data State
  const [data, setData] = useState<PrincipalData>({
    name: '',
    title: '',
    message: '',
    photoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Check session storage on mount
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
    setAuthLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Simple hardcoded auth (for demo purposes)
    if (username === 'admin' && password === 'smkma@2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      loadData();
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

  const loadData = async () => {
    setLoading(true);
    const result = await databaseService.getPrincipalData();
    if (result) {
      setData(result);
      if (result.photoUrl) setPreviewUrl(result.photoUrl);
    } else {
        // Default values if DB is empty
        setData({
            name: 'Siti Komalia, S.Farm',
            title: 'Kepala Sekolah',
            message: 'Kami berkomitmen mencetak lulusan yang tidak hanya cerdas secara intelektual, namun juga matang secara emosional dan spiritual. Teknologi adalah alat, karakter adalah kunci.',
            photoUrl: ''
        });
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    let finalPhotoUrl = data.photoUrl;

    if (photoFile) {
      const uploadedUrl = await databaseService.uploadPrincipalPhoto(photoFile);
      if (uploadedUrl) {
        finalPhotoUrl = uploadedUrl;
      }
    }

    const updatedData: PrincipalData = {
      ...data,
      photoUrl: finalPhotoUrl
    };

    const success = await databaseService.updatePrincipalData(updatedData);
    if (success) {
      setSuccessMsg('Data berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setData(updatedData);
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
  if (loading) return <div className="flex justify-center items-center h-full"><LoaderIcon className="w-8 h-8 animate-spin text-emerald-900" /></div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
              <p className="text-sm text-slate-500">Edit Sambutan & Profil Kepala Sekolah</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-bold transition-colors"
          >
            <LogOutIcon className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="p-8">
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="relative w-48 h-48 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden mb-6 group">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <UserIcon className="w-16 h-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                    <span className="text-white font-bold text-sm">Ganti Foto</span>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50"
                >
                  Pilih Foto Baru
                </button>
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
        </div>
      </div>
    </div>
  );
}