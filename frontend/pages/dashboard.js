import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Users, BookOpen, CheckCircle, XCircle, TrendingUp, Clock, QrCode, ArrowUpRight, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { dashboardAPI } from '../lib/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const COLORS = ['#10d98a','#f43f5e','#f59e0b','#3b82f6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="font-semibold text-slate-300 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-semibold text-slate-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.get();
      setData(res.data.data);
    } catch { toast.error('Gagal memuat dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const stats = data?.stats;
  const hi = stats?.hari_ini;
  const trend = (data?.tren_mingguan || []).map(t => ({
    tgl: format(parseISO(t.tgl), 'EEE', { locale: id }),
    Hadir: +t.hadir||0, Alpa: +t.alpa||0, Sakit: +t.sakit||0, Izin: +t.izin||0,
  }));

  const pieData = hi ? [
    { name:'Hadir', value:+hi.hadir||0 },
    { name:'Alpa',  value:+hi.alpa||0  },
    { name:'Sakit', value:+hi.sakit||0 },
    { name:'Izin',  value:+hi.izin||0  },
  ] : [];

  const pctHadir = hi?.total > 0 ? Math.round((hi.hadir / hi.total) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" />
    </div>
  );

  return (
    <>
      <Head><title>Dashboard — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              Halo, {user?.nama?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
            </p>
          </div>
          <button onClick={load} className="btn-ghost btn-sm gap-1.5 text-slate-500">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>

        {/* Sesi Aktif Banner */}
        {data?.sesi_aktif?.length > 0 && (
          <div className="p-4 rounded-2xl animate-fade-up"
            style={{ background: 'linear-gradient(135deg, rgba(16,217,138,0.1), rgba(16,217,138,0.05))', border: '1px solid rgba(16,217,138,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Sesi Aktif Sekarang</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.sesi_aktif.map(s => (
                <Link key={s.id} href={`/absensi/sesi/${s.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div className="font-bold text-white text-sm">{s.nama_kelas}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.jam_buka}–{s.jam_tutup}
                        <span className="mx-1">·</span>
                        {s.sesi === 'masuk' ? '🏫 Masuk' : '🏠 Pulang'}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up stagger-1">
          {[
            { label:'Total Siswa',  value: stats?.total_siswa||0, icon: Users,        color:'#3b82f6', bg:'rgba(59,130,246,0.1)' },
            { label:'Total Kelas',  value: stats?.total_kelas||0, icon: BookOpen,     color:'#a855f7', bg:'rgba(168,85,247,0.1)' },
            { label:'Hadir Hari Ini', value: hi?.hadir||0,        icon: CheckCircle,  color:'#10d98a', bg:'rgba(16,217,138,0.1)', extra: pctHadir+'%' },
            { label:'Tidak Hadir',  value: (hi?.alpa||0)+(hi?.sakit||0)+(hi?.izin||0), icon: XCircle, color:'#f43f5e', bg:'rgba(244,63,94,0.1)' },
          ].map((s, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.bg }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                {s.extra && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: s.color, background: s.bg }}>
                    {s.extra}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-4 animate-fade-up stagger-2">
          {/* Trend chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-white text-sm">Tren Kehadiran 7 Hari</h3>
                <p className="text-xs text-slate-500 mt-0.5">Jumlah absensi per hari</p>
              </div>
              <Activity className="w-4 h-4 text-slate-600" />
            </div>
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={trend} margin={{ top:5, right:5, bottom:0, left:-25 }}>
                  <defs>
                    <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10d98a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10d98a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="tgl" tick={{ fontSize:11, fill:'#4a5578' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:11, fill:'#4a5578' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Hadir" stroke="#10d98a" strokeWidth={2} fill="url(#gH)" />
                  <Area type="monotone" dataKey="Alpa" stroke="#f43f5e" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-600 text-sm">Belum ada data</div>
            )}
          </div>

          {/* Pie chart */}
          <div className="card p-5">
            <h3 className="font-bold text-white text-sm mb-1">Absensi Hari Ini</h3>
            <p className="text-xs text-slate-500 mb-4">Distribusi kehadiran</p>
            {hi?.total > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                      {pieData.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {pieData.map((p,i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                      <span className="text-slate-500">{p.name}</span>
                      <span className="font-bold text-slate-300 ml-auto">{p.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-600 text-sm">Belum ada absensi</div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-2 gap-4 animate-fade-up stagger-3">
          {/* Rekap kelas */}
          <div className="card p-5">
            <h3 className="font-bold text-white text-sm mb-4">Rekap Kelas Hari Ini</h3>
            {data?.rekap_kelas?.length > 0 ? (
              <div className="space-y-3">
                {data.rekap_kelas.map((k,i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-14 flex-shrink-0">{k.kelas}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width:`${k.persen_hadir||0}%`, background: k.persen_hadir>=80 ? '#10d98a' : k.persen_hadir>=60 ? '#f59e0b' : '#f43f5e' }} />
                    </div>
                    <span className="text-xs font-bold w-10 text-right"
                      style={{ color: k.persen_hadir>=80 ? '#10d98a' : k.persen_hadir>=60 ? '#f59e0b' : '#f43f5e' }}>
                      {k.persen_hadir||0}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-600 text-sm text-center py-8">Belum ada data hari ini</div>
            )}
          </div>

          {/* Siswa alpa */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">Siswa Alpa Terbanyak</h3>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">Bulan ini</span>
            </div>
            {data?.siswa_alpa_terbanyak?.length > 0 ? (
              <div className="space-y-2.5">
                {data.siswa_alpa_terbanyak.map((s,i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0
                      ${i===0 ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-500'}`}>
                      {i+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-200 truncate">{s.nama}</div>
                      <div className="text-xs text-slate-600">{s.kelas}</div>
                    </div>
                    <div className="flex items-center gap-1" style={{ color: '#f43f5e' }}>
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs font-bold">{s.jumlah_alpa}x</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-600 text-sm text-center py-8">🎉 Tidak ada siswa alpa</div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up stagger-4">
          {[
            { href:'/absensi/sesi',   icon:Clock,          label:'Buat Sesi',    color:'#3b82f6' },
            { href:'/absensi/scan',   icon:QrCode,         label:'Scan QR',      color:'#10d98a' },
            { href:'/absensi/manual', icon:ClipboardList,  label:'Input Manual', color:'#f59e0b' },
            { href:'/laporan',        icon:BarChart3,       label:'Laporan',      color:'#a855f7' },
          ].map((a,i) => (
            <Link key={i} href={a.href}>
              <div className="card p-4 flex flex-col items-center gap-2.5 cursor-pointer hover:bg-white/[0.02] transition-all duration-200 hover:-translate-y-0.5 text-center group">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${a.color}18`, border: `1px solid ${a.color}25` }}>
                  <a.icon className="w-5 h-5" style={{ color: a.color }} />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

import { ClipboardList, BarChart3 } from 'lucide-react';
DashboardPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
