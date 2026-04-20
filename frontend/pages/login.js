import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, QrCode, Shield, BarChart3 } from 'lucide-react';
import { authAPI } from '../lib/api';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      toast.success(`Selamat datang, ${res.data.user.nama.split(' ')[0]}!`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email atau password salah');
    } finally { setLoading(false); }
  };

  const fillDemo = (email) => setForm({ email, password: 'admin123' });

  return (
    <>
      <Head><title>Login — AbsensiQR</title></Head>
      <div className="min-h-screen bg-bg flex">

        {/* Left — Branding */}
        <div className="hidden lg:flex w-[480px] flex-shrink-0 flex-col relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d1b2e 0%, #0a1628 50%, #061020 100%)' }}>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'linear-gradient(rgba(16,217,138,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,217,138,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Glow orbs */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,217,138,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />

          <div className="relative z-10 flex flex-col h-full p-12">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10d98a, #0ea572)', boxShadow: '0 0 20px rgba(16,217,138,0.3)' }}>
                <QrCode className="w-5 h-5 text-slate-900" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">AbsensiQR</span>
            </div>

            {/* Center content */}
            <div className="mb-auto pt-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: 'rgba(16,217,138,0.1)', border: '1px solid rgba(16,217,138,0.2)', color: '#10d98a' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Absensi Digital
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Absensi Lebih<br />
                <span style={{ color: '#10d98a' }}>Cerdas & Aman</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed mb-10">
                QR Code dinamis yang berubah setiap sesi — mencegah titip absen dan memastikan kehadiran yang akurat.
              </p>

              <div className="space-y-3">
                {[
                  { icon: QrCode, title: 'QR Dinamis Anti-Titip', desc: 'Token berubah setiap 30 menit otomatis' },
                  { icon: Shield, title: 'Keamanan Berlapis', desc: 'JWT + HMAC encryption pada setiap QR' },
                  { icon: BarChart3, title: 'Laporan Real-time', desc: 'Rekap kehadiran langsung tersedia' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(16,217,138,0.1)' }}>
                      <f.icon className="w-4 h-4" style={{ color: '#10d98a' }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{f.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-slate-600 text-xs">© 2025 AbsensiQR</div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md animate-fade-up">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10d98a, #0ea572)' }}>
                <QrCode className="w-4 h-4 text-slate-900" />
              </div>
              <span className="font-bold text-white">AbsensiQR</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Masuk ke Akun</h2>
              <p className="text-slate-500 text-sm">Gunakan email dan password dari admin sekolah</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="guru@sekolah.sch.id"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input pr-11"
                    placeholder="••••••••" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
                {loading
                  ? <><span className="spinner-sm" /> Memproses...</>
                  : <><span>Masuk</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Demo Akun</p>
              <div className="space-y-2">
                {[
                  { label: 'Admin', email: 'admin@sekolah.sch.id' },
                  { label: 'Guru', email: 'budi@sekolah.sch.id' },
                ].map(a => (
                  <button key={a.email} type="button" onClick={() => fillDemo(a.email)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-white/5 transition-colors group">
                    <span>
                      <span className="font-semibold text-slate-400 group-hover:text-slate-300">{a.label}: </span>
                      <span className="text-slate-500 group-hover:text-slate-400 font-mono">{a.email}</span>
                    </span>
                    <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold">ISI →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
