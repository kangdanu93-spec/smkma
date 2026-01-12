import React, { useState, useEffect } from 'react';
import { PortalMode, MajorItem } from '../types';
import { BuildingIcon, GraduationCapIcon, BriefcaseIcon, ClipboardIcon, LoaderIcon, UserIcon, CheckBadgeIcon, PaletteIcon, WrenchIcon, ArrowRightIcon, BookIcon } from './ui/Icons';
import { databaseService, Registrant } from '../services/database';

interface SimpleContentProps {
  mode: PortalMode;
}

export default function SimpleContent({ mode }: SimpleContentProps) {
  // PPDB State
  const [formData, setFormData] = useState({
    name: '',
    schoolOrigin: '',
    phone: '',
    major: 'DKV'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Majors State
  const [majors, setMajors] = useState<MajorItem[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(false);

  // Load data when entering specific modes
  useEffect(() => {
    if (showAdmin) {
      loadRegistrants();
    }
    if (mode === PortalMode.MAJORS) {
        loadMajors();
    }
  }, [showAdmin, mode]);

  const loadRegistrants = async () => {
    setIsLoadingData(true);
    const data = await databaseService.getRegistrants();
    setRegistrants(data);
    setIsLoadingData(false);
  };

  const loadMajors = async () => {
      setLoadingMajors(true);
      const data = await databaseService.getMajors();
      setMajors(data);
      setLoadingMajors(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.schoolOrigin || !formData.phone) return;

    setIsSubmitting(true);
    await databaseService.saveRegistrant(formData);
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset form
    setFormData({
      name: '',
      schoolOrigin: '',
      phone: '',
      major: 'DKV'
    });

    // Hide success message after 3 seconds
    setTimeout(() => setIsSuccess(false), 3000);
  };

  // Helper for Major Theme
  const getMajorTheme = (theme: string) => {
    switch(theme) {
        case 'orange': return { gradient: 'from-orange-500 to-amber-500', iconColor: 'text-amber-100', text: 'text-orange-600' };
        case 'blue': return { gradient: 'from-blue-600 to-indigo-600', iconColor: 'text-blue-100', text: 'text-blue-700' };
        case 'purple': return { gradient: 'from-purple-600 to-fuchsia-600', iconColor: 'text-purple-100', text: 'text-purple-700' };
        case 'emerald': return { gradient: 'from-emerald-600 to-teal-600', iconColor: 'text-emerald-100', text: 'text-emerald-700' };
        case 'rose': return { gradient: 'from-rose-600 to-pink-600', iconColor: 'text-rose-100', text: 'text-rose-700' };
        default: return { gradient: 'from-slate-700 to-slate-900', iconColor: 'text-slate-100', text: 'text-slate-700' };
    }
  };

  const getMajorIcon = (code: string) => {
      if (code === 'DKV') return <PaletteIcon className="w-16 h-16" />;
      if (code === 'TKR') return <WrenchIcon className="w-16 h-16" />;
      if (code === 'MPLB') return <BuildingIcon className="w-16 h-16" />;
      return <BookIcon className="w-16 h-16" />;
  };

  const getContent = () => {
    switch (mode) {
      case PortalMode.PROFILE:
        return {
          title: "Profil Sekolah",
          icon: <BuildingIcon className="w-8 h-8 text-emerald-900" />,
          content: (
            <div className="space-y-6 text-slate-800">
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
                <h3 className="text-xl font-bold mb-4 text-slate-900">Visi & Misi</h3>
                <div className="mb-6">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">Visi</span>
                  <p className="text-lg italic font-serif text-slate-700">"Menjadi SMK Unggul, Berkarakter, dan Berbasis Teknologi di Era Global."</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">Misi</span>
                  <ul className="list-disc list-inside space-y-2 ml-2 text-slate-600">
                    <li>Menyelenggarakan pendidikan berkualitas berbasis kompetensi.</li>
                    <li>Membentuk karakter siswa yang berakhlakul karimah.</li>
                    <li>Mengembangkan kerjasama dengan dunia usaha dan dunia industri.</li>
                    <li>Mengimplementasikan teknologi terkini dalam pembelajaran.</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-slate-900">Sejarah Singkat</h3>
                <p className="leading-relaxed text-slate-600">
                  SMK Mathalul Anwar Buaranjati didirikan pada tahun 2005 di bawah naungan Yayasan Mathalul Anwar. 
                  Sejak awal berdirinya, sekolah ini berkomitmen untuk mencetak lulusan yang siap kerja dan mandiri. 
                  Kini, SMK Mathalul Anwar telah berkembang menjadi salah satu sekolah kejuruan favorit dengan fasilitas lengkap dan berbasis teknologi digital.
                </p>
              </div>
            </div>
          )
        };
      case PortalMode.MAJORS:
        return {
          title: "Kompetensi Keahlian",
          icon: <GraduationCapIcon className="w-8 h-8 text-emerald-900" />,
          content: loadingMajors ? (
              <div className="flex justify-center p-12"><LoaderIcon className="w-8 h-8 animate-spin text-emerald-900" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-12">
               {majors.map((major, idx) => {
                   const theme = getMajorTheme(major.colorTheme);
                   return (
                     <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-all duration-500 group">
                       
                       {/* Logo & Header Section */}
                       <div className={`md:w-1/3 bg-gradient-to-br ${theme.gradient} p-8 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                          
                          {/* Logo Badge - Enlarged to w-32 h-32 */}
                          <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform duration-500 p-4">
                              <div className={theme.iconColor}>
                                {major.logoUrl ? (
                                    <img src={major.logoUrl} className="w-full h-full object-contain filter drop-shadow-md" alt={major.code} onError={(e) => e.currentTarget.style.display='none'} />
                                ) : (
                                    getMajorIcon(major.code)
                                )}
                              </div>
                          </div>
    
                          <h2 className="text-4xl font-black text-white tracking-tighter mb-1">{major.code}</h2>
                          <p className="text-white/80 text-sm font-medium uppercase tracking-widest">{major.name}</p>
                       </div>
    
                       {/* Content Section */}
                       <div className="md:w-2/3 p-8 md:p-10 flex flex-col">
                          <div className="mb-6">
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-800 transition-colors">{major.name}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                              {major.description}
                            </p>
                          </div>
    
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto">
                             <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kompetensi Utama</h4>
                                <ul className="space-y-2">
                                   {major.skills.map((skill, i) => (
                                     <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                       <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${theme.gradient}`}></div>
                                       {skill}
                                     </li>
                                   ))}
                                </ul>
                             </div>
                             <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Prospek Karir</h4>
                                <ul className="space-y-2">
                                   {major.careers.map((job, i) => (
                                     <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                                        {job}
                                     </li>
                                   ))}
                                </ul>
                             </div>
                          </div>
                       </div>
                     </div>
                   );
               })}
            </div>
          )
        };
      case PortalMode.BKK:
        return {
          title: "Bursa Kerja Khusus (BKK)",
          icon: <BriefcaseIcon className="w-8 h-8 text-emerald-900" />,
          content: (
             <div className="space-y-6 text-slate-800">
              <div className="bg-emerald-900 p-8 rounded-xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <h3 className="text-2xl font-bold mb-2 relative z-10">Pusat Karir & Alumni</h3>
                <p className="opacity-90 relative z-10 font-light">
                  Menjembatani lulusan terbaik dengan mitra industri terpercaya.
                </p>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mt-6 border-b border-slate-200 pb-2">Mitra Industri</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {['PT Astra Honda Motor', 'PT Telkom Indonesia', 'Bank BRI', 'Polytron', 'Mayora Group', 'Epson Indonesia', 'Alfamart', 'Indomaret'].map((pt, i) => (
                   <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 text-center text-xs font-bold text-slate-600 shadow-sm flex items-center justify-center h-14 hover:border-emerald-800 hover:text-emerald-900 transition-colors">
                     {pt}
                   </div>
                 ))}
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold mb-4 text-slate-900">Lowongan Pekerjaan</h3>
                <ul className="space-y-3">
                   <li className="flex justify-between items-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Operator Produksi</div>
                        <div className="text-xs text-slate-500 mt-1">PT Mayora Indah Tbk | Tangerang</div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">BARU</span>
                   </li>
                   <li className="flex justify-between items-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Staff Admin Gudang</div>
                        <div className="text-xs text-slate-500 mt-1">PT Alfaria Trijaya | Cikokol</div>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">1 HARI LALU</span>
                   </li>
                </ul>
              </div>
            </div>
          )
        };
      case PortalMode.PPDB:
        return {
          title: "Pendaftaran Siswa Baru",
          icon: <ClipboardIcon className="w-8 h-8 text-emerald-900" />,
          content: (
             <div className="space-y-8 text-slate-800 pb-10">
               {/* Banner Promo */}
               {!showAdmin && (
                 <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                   <div>
                     <h3 className="text-lg font-bold text-amber-800">Gelombang 1 Telah Dibuka!</h3>
                     <p className="text-amber-700/80 text-sm mt-1">Dapatkan potongan Dana Sumbangan Pendidikan (DSP) sebesar 50%.</p>
                   </div>
                   <div className="flex gap-2 text-xs font-bold shrink-0">
                     <div className="bg-amber-100 px-3 py-1.5 rounded text-amber-800 border border-amber-200">Quota: 150</div>
                   </div>
                 </div>
               )}

               {/* Toggle View Button */}
               <div className="flex justify-end">
                 <button 
                    onClick={() => setShowAdmin(!showAdmin)}
                    className="text-xs font-bold text-slate-500 hover:text-emerald-800 underline transition-colors"
                 >
                   {showAdmin ? "Kembali ke Formulir" : "Akses Admin PPDB"}
                 </button>
               </div>

               {showAdmin ? (
                 /* DATABASE VIEW (ADMIN) */
                 <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">Database Pendaftar</h3>
                      <button onClick={loadRegistrants} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        <span className="text-xs font-bold text-slate-600">Refresh Data</span>
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      {isLoadingData ? (
                        <div className="p-12 flex justify-center text-emerald-900">
                          <LoaderIcon className="w-6 h-6 animate-spin" />
                        </div>
                      ) : registrants.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm">
                          Belum ada data masuk.
                        </div>
                      ) : (
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-xs">
                            <tr>
                              <th className="px-6 py-4 border-b border-slate-200">Tanggal</th>
                              <th className="px-6 py-4 border-b border-slate-200">Nama</th>
                              <th className="px-6 py-4 border-b border-slate-200">Asal Sekolah</th>
                              <th className="px-6 py-4 border-b border-slate-200">Jurusan</th>
                              <th className="px-6 py-4 border-b border-slate-200">Kontak</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {registrants.map((reg) => (
                              <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-500 text-xs">
                                  {new Date(reg.timestamp).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900">{reg.name}</td>
                                <td className="px-6 py-4 text-slate-600">{reg.schoolOrigin}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                    reg.major === 'DKV' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                    reg.major === 'TKR' ? 'bg-slate-800 text-white border-slate-800' :
                                    'bg-slate-600 text-white border-slate-600'
                                  }`}>
                                    {reg.major}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{reg.phone}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                 </div>
               ) : (
                 /* FORM VIEW */
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {/* Form */}
                   <div className="md:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                     {isSuccess && (
                       <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center text-center p-6 animate-fade-in-up">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                             <CheckBadgeIcon className="w-8 h-8" />
                          </div>
                          <h4 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil</h4>
                          <p className="text-slate-500 mt-2 text-sm">Data Anda telah tersimpan aman.<br/>Tim kami akan segera menghubungi Anda.</p>
                       </div>
                     )}

                     <h4 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                       <UserIcon className="w-5 h-5 text-emerald-900" /> Formulir Online
                     </h4>
                     
                     <form onSubmit={handleSubmit} className="space-y-5">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Nama Lengkap</label>
                           <input 
                              type="text" 
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all placeholder-slate-400"
                              placeholder="Contoh: Ahmad Fauzi"
                           />
                         </div>

                         <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Nomor WhatsApp</label>
                           <input 
                              type="tel" 
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all placeholder-slate-400"
                              placeholder="0812xxxx"
                           />
                         </div>
                       </div>

                       <div>
                         <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Asal Sekolah</label>
                         <input 
                            type="text" 
                            name="schoolOrigin"
                            value={formData.schoolOrigin}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all placeholder-slate-400"
                            placeholder="Contoh: SMP Negeri 1 Rajeg"
                         />
                       </div>

                       <div>
                         <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Minat Jurusan</label>
                         <div className="relative">
                            <select 
                                name="major"
                                value={formData.major}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all text-slate-900 cursor-pointer appearance-none"
                            >
                              <option value="DKV">Desain Komunikasi Visual (DKV)</option>
                              <option value="TKR">Teknik Kendaraan Ringan (TKR)</option>
                              <option value="MPLB">Manajemen Perkantoran (MPLB)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                         </div>
                       </div>

                       <div className="pt-2">
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-emerald-900 text-white font-bold rounded-lg hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? <LoaderIcon className="w-5 h-5 animate-spin" /> : "Kirim Pendaftaran"}
                          </button>
                       </div>
                     </form>
                   </div>

                   {/* Info Sidebar */}
                   <div className="space-y-6">
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                       <h4 className="font-bold text-slate-900 mb-3 text-sm">Persyaratan</h4>
                       <ul className="list-disc list-inside text-xs space-y-2 text-slate-600 leading-relaxed">
                         <li>Lulusan SMP/MTs sederajat</li>
                         <li>Usia maksimal 21 tahun</li>
                         <li>Sehat jasmani dan rohani</li>
                         <li>Berkelakuan baik</li>
                       </ul>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                       <h4 className="font-bold text-slate-900 mb-3 text-sm">Dokumen</h4>
                       <ul className="list-disc list-inside text-xs space-y-2 text-slate-600 leading-relaxed">
                         <li>Fotokopi Ijazah / SKL (2 lbr)</li>
                         <li>Fotokopi Kartu Keluarga (2 lbr)</li>
                         <li>Fotokopi Akta Kelahiran (2 lbr)</li>
                         <li>Pas Foto 3x4 (4 lembar)</li>
                       </ul>
                     </div>
                   </div>
                 </div>
               )}
             </div>
          )
        };
      default:
        return { title: "", icon: null, content: null };
    }
  };

  const data = getContent();

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8">
       <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
         <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
            <div className="w-14 h-14 bg-emerald-900 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
              {data.icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{data.title}</h2>
         </div>
         <div className="p-8 overflow-y-auto custom-scrollbar">
            {data.content}
         </div>
       </div>
    </div>
  );
}