import React, { useState, useEffect } from 'react';
import { PortalMode, MajorItem } from '../types';
import { BuildingIcon, GraduationCapIcon, BriefcaseIcon, ClipboardIcon, LoaderIcon, UserIcon, CheckBadgeIcon, PaletteIcon, WrenchIcon, ArrowRightIcon, BookIcon, MapIcon } from './ui/Icons';
import { databaseService, Registrant } from '../services/database';

interface SimpleContentProps {
  mode: PortalMode;
}

// Initial State for the Complex Form
const INITIAL_FORM_STATE = {
    // Basic & Major
    major: 'TKR', // Default changed to TKR per request priority
    uniformSize: 'M',
    
    // Section A
    name: '',
    gender: 'L',
    nisn: '',
    nik: '',
    kk: '',
    birthPlace: '',
    birthDate: '',
    aktaNo: '',
    religion: 'Islam',
    citizenship: 'WNI',
    country: '',
    
    // Section B
    address: '',
    rt: '',
    rw: '',
    dusun: '',
    kelurahan: '',
    kecamatan: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    residenceType: 'Bersama Orang Tua',
    transportMode: 'Jalan kaki',

    // New Fields
    childOrder: '',
    hasKIP: 'Tidak',

    // Data Ayah
    fatherName: '',
    fatherNik: '',
    fatherBirthYear: '',
    fatherEducation: 'SMA Sederajat',
    fatherJob: 'Wiraswasta',
    fatherIncome: 'Rp2.000.000 – Rp4.999.999',

    // Data Ibu
    motherName: '',
    motherNik: '',
    motherBirthYear: '',
    motherEducation: 'SMA Sederajat',
    motherJob: 'Tidak Bekerja',
    motherIncome: 'Tidak Berpenghasilan',
};

const SPECIAL_NEEDS_OPTIONS = [
    { code: 'A', label: 'Netra (A)' }, { code: 'B', label: 'Rungu (B)' },
    { code: 'C', label: 'Grahita Ringan (C)' }, { code: 'C1', label: 'Grahita Sedang (C1)' },
    { code: 'D', label: 'Daksa Ringan (D)' }, { code: 'D1', label: 'Daksa Sedang (D1)' },
    { code: 'E', label: 'Laras (E)' }, { code: 'F', label: 'Wicara (F)' },
    { code: 'G', label: 'Tuna Ganda (G)' }, { code: 'H', label: 'Hiperaktif (H)' },
    { code: 'I', label: 'Cerdas Istimewa (I)' }, { code: 'J', label: 'Bakat Istimewa (J)' },
    { code: 'K', label: 'Kesulitan Belajar (K)' }, { code: 'N', label: 'Narkoba (N)' },
    { code: 'O', label: 'Indigo (O)' }, { code: 'P', label: 'Down Syndrome (P)' },
    { code: 'Q', label: 'Autis (Q)' }
];

const EDUCATION_OPTIONS = ['Tidak Sekolah', 'Putus SD', 'SD Sederajat', 'SMP Sederajat', 'SMA Sederajat', 'D1', 'D2', 'D3', 'D4/S1', 'S2', 'S3'];
const JOB_OPTIONS = ['Tidak Bekerja', 'Nelayan', 'Petani', 'Peternak', 'PNS/TNI/POLRI', 'Karyawan Swasta', 'Pedagang Kecil', 'Pedagang Besar', 'Wiraswasta', 'Buruh', 'Pensiunan'];
const INCOME_OPTIONS = ['< Rp500.000', 'Rp500.000 – Rp999.999', 'Rp1.000.000 – Rp1.999.999', 'Rp2.000.000 – Rp4.999.999', '≥ Rp5.000.000', 'Tidak Berpenghasilan'];
const PARENT_SPECIAL_NEEDS_OPTIONS = ['Tidak', 'Netra', 'Rungu', 'Grahita Ringan', 'Grahita Sedang', 'Daksa Ringan', 'Daksa Sedang', 'Wicara', 'Tuna Ganda', 'Hiperaktif', 'Cerdas Istimewa', 'Bakat Istimewa', 'Kesulitan Belajar', 'Autis', 'Narkoba', 'Down Syndrome', 'Lainnya'];

export default function SimpleContent({ mode }: SimpleContentProps) {
  // PPDB State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [fatherSpecialNeeds, setFatherSpecialNeeds] = useState<string[]>([]);
  const [motherSpecialNeeds, setMotherSpecialNeeds] = useState<string[]>([]);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (code: string) => {
      setSpecialNeeds(prev => {
          if (prev.includes(code)) return prev.filter(c => c !== code);
          return [...prev, code];
      });
  };

  const handleFatherCheckboxChange = (option: string) => {
    setFatherSpecialNeeds(prev => {
        if (option === 'Tidak') {
            return ['Tidak'];
        }
        let newSelection = prev.filter(item => item !== 'Tidak');
        if (newSelection.includes(option)) {
            newSelection = newSelection.filter(item => item !== option);
        } else {
            newSelection = [...newSelection, option];
        }
        if (newSelection.length === 0) return ['Tidak'];
        return newSelection;
    });
  };

  const handleMotherCheckboxChange = (option: string) => {
    setMotherSpecialNeeds(prev => {
        if (option === 'Tidak') {
            return ['Tidak'];
        }
        let newSelection = prev.filter(item => item !== 'Tidak');
        if (newSelection.includes(option)) {
            newSelection = newSelection.filter(item => item !== option);
        } else {
            newSelection = [...newSelection, option];
        }
        if (newSelection.length === 0) return ['Tidak'];
        return newSelection;
    });
  };

  const getLocation = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  setFormData(prev => ({
                      ...prev,
                      latitude: position.coords.latitude.toString(),
                      longitude: position.coords.longitude.toString()
                  }));
              },
              (error) => alert('Gagal mengambil lokasi: ' + error.message)
          );
      } else {
          alert("Browser tidak mendukung Geolocation.");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        alert("Mohon lengkapi data utama (Nama Lengkap)");
        return;
    }

    setIsSubmitting(true);
    
    // Map State to Interface
    // @ts-ignore
    const finalData: Omit<Registrant, 'id' | 'timestamp'> = {
        ...formData,
        specialNeeds: specialNeeds,
        fatherSpecialNeeds: fatherSpecialNeeds.length === 0 ? ['Tidak'] : fatherSpecialNeeds,
        motherSpecialNeeds: motherSpecialNeeds.length === 0 ? ['Tidak'] : motherSpecialNeeds,
        // Ensure gender is mapped strictly
        gender: formData.gender as 'L' | 'P'
    };

    await databaseService.saveRegistrant(finalData);
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset form
    setFormData(INITIAL_FORM_STATE);
    setSpecialNeeds([]);
    setFatherSpecialNeeds([]);
    setMotherSpecialNeeds([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide success message after 3 seconds
    setTimeout(() => setIsSuccess(false), 5000);
  };

  // Helper for Major Theme
  const getMajorTheme = (theme: string) => {
    switch(theme) {
        case 'orange': return { gradient: 'from-orange-400 to-amber-400', iconColor: 'text-amber-100', text: 'text-orange-600' };
        case 'blue': return { gradient: 'from-blue-500 to-indigo-500', iconColor: 'text-blue-100', text: 'text-blue-700' };
        case 'purple': return { gradient: 'from-purple-500 to-pink-500', iconColor: 'text-purple-100', text: 'text-purple-700' };
        default: return { gradient: 'from-slate-700 to-slate-900', iconColor: 'text-slate-100', text: 'text-slate-700' };
    }
  };

  const getMajorIcon = (code: string) => {
      if (code === 'DKV') return <PaletteIcon className="w-16 h-16" />;
      if (code === 'TKR') return <WrenchIcon className="w-16 h-16" />;
      if (code === 'MPLB' || code === 'PERKANTORAN') return <BriefcaseIcon className="w-16 h-16" />;
      return <GraduationCapIcon className="w-16 h-16" />;
  };

  const getContent = () => {
    switch (mode) {
      case PortalMode.PROFILE:
        return {
          title: "Profil Sekolah",
          icon: <BuildingIcon className="w-8 h-8 text-emerald-900" />,
          content: (
            <div className="space-y-6 text-emerald-900">
              <div className="bg-white/60 p-6 rounded-xl border border-emerald-50">
                <h3 className="text-xl font-bold mb-2 text-emerald-800">Visi & Misi</h3>
                <p className="font-semibold mb-2">Visi:</p>
                <p className="mb-4 italic">"Menjadi SMK Unggul, Berkarakter, dan Berbasis Teknologi di Era Global."</p>
                <p className="font-semibold mb-2">Misi:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-emerald-800/80">
                  <li>Menyelenggarakan pendidikan berkualitas berbasis kompetensi.</li>
                  <li>Membentuk karakter siswa yang berakhlakul karimah.</li>
                  <li>Mengembangkan kerjasama dengan dunia usaha dan dunia industri.</li>
                  <li>Mengimplementasikan teknologi terkini dalam pembelajaran.</li>
                </ul>
              </div>
              <div className="bg-white/60 p-6 rounded-xl border border-emerald-50">
                <h3 className="text-xl font-bold mb-2 text-emerald-800">Sejarah Singkat</h3>
                <p className="leading-relaxed text-emerald-800/80">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {majors.map((major, idx) => {
                   const theme = getMajorTheme(major.colorTheme);
                   return (
                     <div key={idx} className="bg-white/80 rounded-2xl border border-emerald-50 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                       <div className={`h-32 bg-gradient-to-br ${theme.gradient} rounded-t-2xl flex items-center justify-center relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                          <div className={theme.iconColor}>
                                {major.logoUrl ? (
                                    <img src={major.logoUrl} className="w-16 h-16 object-contain filter drop-shadow-md" alt={major.code} onError={(e) => e.currentTarget.style.display='none'} />
                                ) : (
                                    getMajorIcon(major.code)
                                )}
                          </div>
                       </div>
                       <div className="p-6">
                           <h3 className="text-xl font-bold text-emerald-900 mb-2">{major.name}</h3>
                           <p className="text-emerald-700/70 text-sm leading-relaxed mb-4 line-clamp-3">
                              {major.description}
                           </p>
                           <div className="flex flex-wrap gap-2">
                             {major.skills.slice(0, 3).map((skill, i) => (
                               <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded">
                                 {skill}
                               </span>
                             ))}
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
             <div className="space-y-6 text-emerald-900">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-xl text-white shadow-lg">
                <h3 className="text-xl font-bold mb-2">Pusat Karir Siswa & Alumni</h3>
                <p className="opacity-90">
                  BKK SMK Mathalul Anwar menjembatani lulusan dengan dunia kerja melalui info lowongan, rekrutmen kampus, dan pelatihan siap kerja.
                </p>
              </div>
              
              <h3 className="text-lg font-bold text-emerald-800 mt-4">Mitra Industri Kami</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {['PT Astra Honda Motor', 'PT Telkom Indonesia', 'Bank BRI', 'Polytron', 'Mayora Group', 'Epson Indonesia', 'Alfamart', 'Indomaret'].map((pt, i) => (
                   <div key={i} className="bg-white p-4 rounded-lg border border-emerald-100 text-center text-sm font-semibold text-emerald-600 shadow-sm flex items-center justify-center h-16">
                     {pt}
                   </div>
                 ))}
              </div>

              <div className="bg-white/60 p-6 rounded-xl border border-emerald-50">
                <h3 className="text-lg font-bold mb-3 text-emerald-800">Info Lowongan Terbaru</h3>
                <ul className="space-y-3">
                   <li className="flex justify-between items-start pb-3 border-b border-emerald-100/50">
                      <div>
                        <div className="font-bold text-emerald-900">Operator Produksi</div>
                        <div className="text-xs text-emerald-600">PT Mayora Indah Tbk | Tangerang</div>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Baru</span>
                   </li>
                   <li className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-emerald-900">Staff Admin Gudang</div>
                        <div className="text-xs text-emerald-600">PT Alfaria Trijaya | Cikokol</div>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">1 Hari lalu</span>
                   </li>
                </ul>
              </div>
            </div>
          )
        };
      case PortalMode.PPDB:
        return {
          title: "Formulir Peserta Didik (F-PD)",
          icon: <ClipboardIcon className="w-8 h-8 text-emerald-900" />,
          content: (
             <div className="space-y-8 text-emerald-900 pb-10">
               {/* Header Info */}
               {!showAdmin && (
                 <div className="text-center space-y-2 border-b border-emerald-100 pb-6">
                    <h3 className="text-lg font-bold text-emerald-900 uppercase tracking-widest">Formulir Biodata Peserta Didik</h3>
                    <h2 className="text-2xl font-black text-emerald-800">SMK MATHLA’UL ANWAR BUARANJATI</h2>
                    <p className="text-emerald-600 font-medium">Tahun Pelajaran 2025–2026</p>
                 </div>
               )}

               {/* Toggle View Button */}
               <div className="flex justify-end">
                 <button 
                    onClick={() => setShowAdmin(!showAdmin)}
                    className="text-xs font-bold text-emerald-500 hover:text-emerald-800 underline transition-colors"
                 >
                   {showAdmin ? "Kembali ke Formulir" : "Akses Database Admin"}
                 </button>
               </div>

               {showAdmin ? (
                 /* DATABASE VIEW (ADMIN) */
                 <div className="bg-white rounded-xl shadow-lg border border-emerald-100 overflow-hidden">
                    <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
                      <h3 className="font-bold text-emerald-900">Database Pendaftar</h3>
                      <button onClick={loadRegistrants} className="p-2 hover:bg-emerald-200 rounded-lg transition-colors">
                        <span className="text-xs font-bold text-emerald-600">Refresh Data</span>
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      {isLoadingData ? (
                        <div className="p-12 flex justify-center text-emerald-900">
                          <LoaderIcon className="w-6 h-6 animate-spin" />
                        </div>
                      ) : registrants.length === 0 ? (
                        <div className="p-12 text-center text-emerald-400 text-sm">
                          Belum ada data masuk.
                        </div>
                      ) : (
                        <table className="w-full text-sm text-left">
                          <thead className="bg-emerald-50 text-emerald-600 font-bold uppercase text-xs">
                            <tr>
                              <th className="px-6 py-4 border-b border-emerald-100">Nama Lengkap</th>
                              <th className="px-6 py-4 border-b border-emerald-100">Jurusan</th>
                              <th className="px-6 py-4 border-b border-emerald-100">Nama Ayah</th>
                              <th className="px-6 py-4 border-b border-emerald-100">Nama Ibu</th>
                              <th className="px-6 py-4 border-b border-emerald-100">KIP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-50">
                            {registrants.map((reg) => (
                              <tr key={reg.id} className="hover:bg-emerald-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-emerald-900">{reg.name}</div>
                                    <div className="text-xs text-emerald-500">{reg.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                    ['DKV', 'TKJ'].includes(reg.major) ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                    reg.major === 'TKR' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    ['MPLB', 'AP', 'AK'].includes(reg.major) ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                    'bg-emerald-100 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {reg.major}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-emerald-800">{reg.fatherName || '-'}</td>
                                <td className="px-6 py-4 font-bold text-emerald-800">{reg.motherName || '-'}</td>
                                <td className="px-6 py-4">
                                   {reg.hasKIP === 'Ya' ? (
                                       <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded">KIP</span>
                                   ) : (
                                       <span className="text-[10px] text-slate-400">-</span>
                                   )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                 </div>
               ) : (
                 /* FORM VIEW */
                 <div className="max-w-4xl mx-auto">
                   
                   {isSuccess && (
                       <div className="mb-8 p-6 bg-emerald-100 border border-emerald-200 rounded-xl text-center animate-fade-in-up">
                          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                             <CheckBadgeIcon className="w-6 h-6" />
                          </div>
                          <h4 className="text-xl font-bold text-emerald-900">Pendaftaran Berhasil Terkirim!</h4>
                          <p className="text-emerald-700 text-sm mt-1">Data Anda telah kami terima. Silakan tunggu informasi selanjutnya via WhatsApp.</p>
                       </div>
                   )}

                   <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-xl shadow-emerald-100/50 border border-emerald-100">
                       
                       {/* 0. Basic Selection */}
                       <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 space-y-4">
                           <h4 className="font-bold text-lg text-emerald-900 flex items-center gap-2">
                               <GraduationCapIcon className="w-5 h-5" /> Jurusan yang Dipilih
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <select 
                                   name="major"
                                   value={formData.major}
                                   onChange={handleInputChange}
                                   className="w-full px-4 py-3 rounded-lg bg-white border border-emerald-200 focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900"
                               >
                                 <option value="TKR">Teknik Kendaraan Ringan (TKR)</option>
                                 <option value="TKJ">Teknik Komputer Jaringan (TKJ)</option>
                                 <option value="AK">Akuntansi (AK)</option>
                                 <option value="AP">Administrasi Perkantoran (AP/MPLB)</option>
                                 <option value="DKV">Desain Komunikasi Visual (DKV)</option>
                               </select>
                               
                               <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-emerald-700">Ukuran Seragam:</span>
                                    <div className="flex gap-2">
                                        {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                            <label key={size} className={`cursor-pointer px-3 py-2 rounded-lg border text-sm font-bold transition-all ${formData.uniformSize === size ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="uniformSize" 
                                                    value={size} 
                                                    checked={formData.uniformSize === size} 
                                                    onChange={handleInputChange} 
                                                    className="hidden"
                                                />
                                                {size}
                                            </label>
                                        ))}
                                    </div>
                               </div>
                           </div>
                       </div>

                       {/* A. DATA PRIBADI */}
                       <div className="space-y-6">
                           <h4 className="font-bold text-xl text-white bg-emerald-900 px-4 py-2 rounded-lg inline-block shadow-md">
                               A. DATA PRIBADI
                           </h4>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {/* Nama & Gender */}
                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Nama Lengkap</label>
                                   <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50" placeholder="Sesuai Ijazah" />
                               </div>
                               
                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Jenis Kelamin</label>
                                   <div className="flex gap-4">
                                       <label className="flex items-center gap-2 cursor-pointer">
                                           <input type="radio" name="gender" value="L" checked={formData.gender === 'L'} onChange={handleInputChange} className="w-4 h-4 text-emerald-600" /> 
                                           <span>Laki-laki</span>
                                       </label>
                                       <label className="flex items-center gap-2 cursor-pointer">
                                           <input type="radio" name="gender" value="P" checked={formData.gender === 'P'} onChange={handleInputChange} className="w-4 h-4 text-emerald-600" /> 
                                           <span>Perempuan</span>
                                       </label>
                                   </div>
                               </div>

                               {/* IDs */}
                               <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                   <div>
                                       <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">NISN</label>
                                       <input type="number" name="nisn" value={formData.nisn} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500" placeholder="Nomor Induk Siswa Nasional" />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">NIK / No. KITAS</label>
                                       <input type="number" name="nik" value={formData.nik} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500" placeholder="Nomor Induk Kependudukan" />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">No. Kartu Keluarga</label>
                                       <input type="number" name="kk" value={formData.kk} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500" placeholder="Nomor KK" />
                                   </div>
                               </div>

                               {/* Birth Info */}
                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Tempat Lahir</label>
                                   <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500" />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Tanggal Lahir</label>
                                   <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500" />
                               </div>
                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">No. Registrasi Akta Lahir</label>
                                   <input type="text" name="aktaNo" value={formData.aktaNo} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500" placeholder="Lihat di Akta Kelahiran" />
                               </div>

                               {/* Religion & Citizenship */}
                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Agama</label>
                                   <select name="religion" value={formData.religion} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300">
                                       {['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu', 'Lainnya'].map(r => <option key={r} value={r}>{r}</option>)}
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Kewarganegaraan</label>
                                   <div className="flex gap-4 mt-2">
                                       <label className="flex items-center gap-2 cursor-pointer">
                                           <input type="radio" name="citizenship" value="WNI" checked={formData.citizenship === 'WNI'} onChange={handleInputChange} /> WNI
                                       </label>
                                       <label className="flex items-center gap-2 cursor-pointer">
                                           <input type="radio" name="citizenship" value="WNA" checked={formData.citizenship === 'WNA'} onChange={handleInputChange} /> WNA
                                       </label>
                                   </div>
                                   {formData.citizenship === 'WNA' && (
                                       <input type="text" name="country" placeholder="Nama Negara" value={formData.country} onChange={handleInputChange} className="mt-2 w-full px-3 py-1 text-sm border-b border-slate-300 outline-none" />
                                   )}
                               </div>
                               
                               {/* Special Needs */}
                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-3">Berkebutuhan Khusus</label>
                                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                                       <label className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 hover:border-emerald-300 cursor-pointer">
                                           <input type="checkbox" checked={specialNeeds.length === 0} onChange={() => setSpecialNeeds([])} /> Tidak Ada
                                       </label>
                                       {SPECIAL_NEEDS_OPTIONS.map(opt => (
                                           <label key={opt.code} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 hover:border-emerald-300 cursor-pointer">
                                               <input 
                                                  type="checkbox" 
                                                  checked={specialNeeds.includes(opt.code)} 
                                                  onChange={() => handleCheckboxChange(opt.code)} 
                                                  disabled={specialNeeds.length === 0 && false} // Logic could be improved here
                                               />
                                               <span className="truncate" title={opt.label}>{opt.label}</span>
                                           </label>
                                       ))}
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* B. ALAMAT */}
                       <div className="space-y-6 pt-6 border-t-2 border-dashed border-emerald-100">
                           <h4 className="font-bold text-xl text-white bg-emerald-900 px-4 py-2 rounded-lg inline-block shadow-md">
                               B. ALAMAT TEMPAT TINGGAL
                           </h4>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Alamat Jalan</label>
                                   <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500" placeholder="Nama jalan, nomor rumah, gang..." />
                               </div>
                               
                               <div className="flex gap-4">
                                   <div className="flex-1">
                                       <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">RT</label>
                                       <input type="number" name="rt" value={formData.rt} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                                   </div>
                                   <div className="flex-1">
                                       <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">RW</label>
                                       <input type="number" name="rw" value={formData.rw} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                                   </div>
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Nama Dusun</label>
                                   <input type="text" name="dusun" value={formData.dusun} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                               </div>
                               
                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Kelurahan / Desa</label>
                                   <input type="text" name="kelurahan" value={formData.kelurahan} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Kecamatan</label>
                                   <input type="text" name="kecamatan" value={formData.kecamatan} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Kode Pos</label>
                                   <input type="number" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                               </div>
                               
                               {/* Geolocation */}
                               <div className="col-span-1 md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                   <div className="flex justify-between items-center mb-4">
                                       <label className="block text-xs font-bold text-emerald-800 uppercase">Titik Koordinat</label>
                                       <button type="button" onClick={getLocation} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-500 flex items-center gap-1">
                                           <MapIcon className="w-3 h-3" /> Ambil Lokasi Saat Ini
                                       </button>
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                       <div>
                                           <span className="text-[10px] text-slate-500 uppercase font-bold">Lintang (Latitude)</span>
                                           <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" placeholder="-6.xxxx" />
                                       </div>
                                       <div>
                                           <span className="text-[10px] text-slate-500 uppercase font-bold">Bujur (Longitude)</span>
                                           <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" placeholder="106.xxxx" />
                                       </div>
                                   </div>
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Tempat Tinggal</label>
                                   <select name="residenceType" value={formData.residenceType} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300">
                                       {['Bersama Orang Tua', 'Wali', 'Kos', 'Asrama', 'Panti Asuhan'].map(r => <option key={r} value={r}>{r}</option>)}
                                   </select>
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Moda Transportasi</label>
                                   <select name="transportMode" value={formData.transportMode} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm">
                                       {['Jalan kaki', 'Kendaraan pribadi', 'Angkutan umum', 'Jemputan sekolah', 'Kereta api', 'Ojek', 'Lainnya'].map(r => <option key={r} value={r}>{r}</option>)}
                                   </select>
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Anak ke- (sesuai KK)</label>
                                   <input type="number" name="childOrder" value={formData.childOrder} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="1, 2, 3..." />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Apakah Punya KIP?</label>
                                   <div className="flex gap-6 mt-3">
                                       <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded border border-slate-200 flex-1 hover:border-emerald-300">
                                           <input type="radio" name="hasKIP" value="Ya" checked={formData.hasKIP === 'Ya'} onChange={handleInputChange} className="w-4 h-4 text-emerald-600" /> 
                                           <span>Ya</span>
                                       </label>
                                       <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded border border-slate-200 flex-1 hover:border-emerald-300">
                                           <input type="radio" name="hasKIP" value="Tidak" checked={formData.hasKIP === 'Tidak'} onChange={handleInputChange} className="w-4 h-4 text-emerald-600" /> 
                                           <span>Tidak</span>
                                       </label>
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* DATA AYAH KANDUNG */}
                       <div className="space-y-6 pt-6 border-t-2 border-dashed border-emerald-100">
                           <h4 className="font-bold text-xl text-white bg-emerald-900 px-4 py-2 rounded-lg inline-block shadow-md">
                               DATA AYAH KANDUNG
                           </h4>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Nama Ayah Kandung</label>
                                   <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50" placeholder="Sesuai dokumen resmi" />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">NIK Ayah</label>
                                   <input type="number" name="fatherNik" value={formData.fatherNik} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Nomor Induk Kependudukan" />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Tahun Lahir</label>
                                   <input type="number" name="fatherBirthYear" value={formData.fatherBirthYear} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Contoh: 1975" />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Pendidikan</label>
                                   <select name="fatherEducation" value={formData.fatherEducation} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300">
                                       {EDUCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Pekerjaan</label>
                                   <select name="fatherJob" value={formData.fatherJob} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300">
                                       {JOB_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                               </div>

                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Penghasilan Bulanan</label>
                                   <select name="fatherIncome" value={formData.fatherIncome} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300">
                                       {INCOME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                               </div>

                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-3">Berkebutuhan Khusus</label>
                                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                                       {PARENT_SPECIAL_NEEDS_OPTIONS.map(opt => (
                                           <label key={opt} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 hover:border-emerald-300 cursor-pointer">
                                               <input 
                                                  type="checkbox" 
                                                  checked={fatherSpecialNeeds.includes(opt)} 
                                                  onChange={() => handleFatherCheckboxChange(opt)} 
                                               />
                                               <span className="truncate" title={opt}>{opt}</span>
                                           </label>
                                       ))}
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* DATA IBU KANDUNG */}
                       <div className="space-y-6 pt-6 border-t-2 border-dashed border-emerald-100">
                           <h4 className="font-bold text-xl text-white bg-emerald-900 px-4 py-2 rounded-lg inline-block shadow-md">
                               DATA IBU KANDUNG
                           </h4>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Nama Ibu Kandung</label>
                                   <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50" placeholder="Sesuai dokumen resmi" />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">NIK Ibu</label>
                                   <input type="number" name="motherNik" value={formData.motherNik} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Nomor Induk Kependudukan" />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Tahun Lahir</label>
                                   <input type="number" name="motherBirthYear" value={formData.motherBirthYear} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="Contoh: 1980" />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Pendidikan</label>
                                   <select name="motherEducation" value={formData.motherEducation} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300">
                                       {EDUCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Pekerjaan</label>
                                   <select name="motherJob" value={formData.motherJob} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300">
                                       {JOB_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                               </div>

                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Penghasilan Bulanan</label>
                                   <select name="motherIncome" value={formData.motherIncome} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300">
                                       {INCOME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                               </div>

                               <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-bold text-emerald-800 uppercase mb-3">Berkebutuhan Khusus</label>
                                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                                       {PARENT_SPECIAL_NEEDS_OPTIONS.map(opt => (
                                           <label key={opt} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 hover:border-emerald-300 cursor-pointer">
                                               <input 
                                                  type="checkbox" 
                                                  checked={motherSpecialNeeds.includes(opt)} 
                                                  onChange={() => handleMotherCheckboxChange(opt)} 
                                               />
                                               <span className="truncate" title={opt}>{opt}</span>
                                           </label>
                                       ))}
                                   </div>
                               </div>
                           </div>
                       </div>
                       
                       <div className="pt-6 border-t border-emerald-100">
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-4 bg-emerald-900 text-white font-black text-lg rounded-xl hover:bg-emerald-800 shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1"
                          >
                            {isSubmitting ? <LoaderIcon className="w-6 h-6 animate-spin" /> : "KIRIM FORMULIR PENDAFTARAN"}
                          </button>
                          <p className="text-center text-xs text-slate-500 mt-4">
                              Dengan mengirim formulir ini, saya menyatakan data yang diisi adalah benar dan dapat dipertanggungjawabkan.
                          </p>
                       </div>
                   </form>
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
       <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[2rem] shadow-xl shadow-emerald-100/50 overflow-hidden flex flex-col h-full">
         <div className="p-8 border-b border-white/50 bg-white/30 flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
              {data.icon}
            </div>
            <h2 className="text-3xl font-black text-emerald-900 tracking-tight">{data.title}</h2>
         </div>
         <div className="p-8 overflow-y-auto custom-scrollbar">
            {data.content}
         </div>
       </div>
    </div>
  );
}