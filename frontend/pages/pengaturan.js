import { useState } from 'react';
import Head from 'next/head';
import { Key, User, Save, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';

export default function PengaturanPage() {
  const user = useAuthStore(s => s.user);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ password_lama:'', password_baru:'', konfirmasi:'' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password_baru !== form.konfirmasi) { toast.error('Konfirmasi password tidak cocok'); return; }
    if (form.password_baru.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ password_lama:form.password_lama, password_baru:form.password_baru });
      toast.success('Password berhasil diubah!');
      setForm({ password_lama:'', password_baru:'', konfirmasi:'' });
    } catch (err) { toast.error(err.response?.data?.message||'Gagal'); }
    finally { setSaving(false); }
  };

  const JABATAN_COLOR = { admin:'#f43f5e', kepala_sekolah:'#a855f7', wali_kelas:'#3b82f6', guru:'#10d98a' };

  return (
    <>
      <Head><title>Pengaturan — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Pengaturan</h1>
          <p className="text-slate-500 text-sm mt-0.5">Kelola profil dan keamanan akun</p>
        </div>

        {/* Profile card */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-slate-500"/>
            <h3 className="font-bold text-white text-sm">Profil Akun</h3>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900 text-xl font-black flex-shrink-0"
              style={{ background:'linear-gradient(135deg, #10d98a, #3b82f6)' }}>
              {user?.nama?.[0]}
            </div>
            <div>
              <div className="font-bold text-white">{user?.nama}</div>
              <div className="text-slate-500 text-sm">{user?.email}</div>
              <span className="badge text-[10px] mt-1.5 capitalize"
                style={{ color:JABATAN_COLOR[user?.jabatan]||'#8b9cc8', background:`${JABATAN_COLOR[user?.jabatan]||'#8b9cc8'}18`, border:`1px solid ${JABATAN_COLOR[user?.jabatan]||'#8b9cc8'}25` }}>
                {user?.jabatan?.replace('_',' ')}
              </span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label:'NIP', value:user?.nip||'—' },
              { label:'No. HP', value:user?.no_hp||'—' },
            ].map((f,i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{f.label}</div>
                <div className="text-sm font-semibold text-slate-300">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Change password */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Key className="w-4 h-4 text-slate-500"/>
            <h3 className="font-bold text-white text-sm">Ubah Password</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Password Lama</label>
              <div className="relative">
                <input type={showOld?'text':'password'} className="input pr-11" value={form.password_lama}
                  onChange={e=>setForm({...form,password_lama:e.target.value})} required/>
                <button type="button" onClick={()=>setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 p-1">
                  {showOld?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Password Baru (min. 6 karakter)</label>
              <div className="relative">
                <input type={showNew?'text':'password'} className="input pr-11" value={form.password_baru}
                  onChange={e=>setForm({...form,password_baru:e.target.value})} required/>
                <button type="button" onClick={()=>setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 p-1">
                  {showNew?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Konfirmasi Password</label>
              <input type="password" className="input" value={form.konfirmasi}
                onChange={e=>setForm({...form,konfirmasi:e.target.value})} required/>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving?'...':<><Save className="w-4 h-4"/>Ubah Password</>}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="card p-4 text-center" style={{ background:'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
            <Shield className="w-3.5 h-3.5"/>
            AbsensiQR v1.0.0 — Sistem Absensi Digital Berbasis QR
          </div>
        </div>
      </div>
    </>
  );
}
PengaturanPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
