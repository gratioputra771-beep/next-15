import { useState, useEffect } from 'react';
import Head from 'next/head';
import { BarChart3, RefreshCw, Calendar, TrendingUp, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { laporanAPI, kelasAPI } from '../lib/api';
import DashboardLayout from '../components/layout/DashboardLayout';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background:'#1a2235', border:'1px solid rgba(255,255,255,0.1)' }}>
      <div className="font-semibold text-slate-300 mb-1">{label}</div>
      {payload.map((p,i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background:p.fill }}/>
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function LaporanPage() {
  const now = new Date();
  const [tab, setTab] = useState('rekapitulasi');
  const [kelas, setKelas] = useState([]);
  const [selKelas, setSelKelas] = useState('');
  const [bulan, setBulan] = useState(now.getMonth()+1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { kelasAPI.getAll().then(r=>setKelas(r.data.data)).catch(()=>{}); }, []);
  useEffect(() => { load(); }, [tab, bulan, tahun, selKelas]);

  const load = async () => {
    setLoading(true);
    try {
      if (tab==='rekapitulasi') { const r = await laporanAPI.rekapitulasi({bulan,tahun}); setData(r.data.data); }
      else if (tab==='kelas' && selKelas) { const r = await laporanAPI.byKelas(selKelas,{bulan,tahun}); setData(r.data.data); }
      else { setData(null); }
    } catch { toast.error('Gagal memuat laporan'); }
    finally { setLoading(false); }
  };

  const rows = Array.isArray(data) ? data : (data?.siswa||[]);
  const chartData = rows.map(r => ({
    name: (r.kelas||r.nama||'').split(' ')[0],
    Hadir:+r.hadir||0, Alpa:+r.alpa||0, Sakit:+r.sakit||0, Izin:+r.izin||0
  }));

  return (
    <>
      <Head><title>Laporan — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Laporan Absensi</h1>
            <p className="text-slate-500 text-sm mt-0.5">Rekapitulasi kehadiran siswa</p>
          </div>
          <button onClick={load} className="btn-ghost btn-sm"><RefreshCw className="w-3.5 h-3.5"/></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-5" style={{ background:'rgba(255,255,255,0.04)' }}>
          {[
            { id:'rekapitulasi', label:'Rekapitulasi', icon:TrendingUp },
            { id:'kelas',        label:'Per Kelas',    icon:BookOpen },
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab===t.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              style={ tab===t.id ? { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.08)' } : {} }>
              <t.icon className="w-3.5 h-3.5"/> {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 mb-5 flex gap-3 flex-wrap items-end">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600"/>
            <select className="select w-auto" value={bulan} onChange={e=>setBulan(+e.target.value)}>
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
            <select className="select w-auto" value={tahun} onChange={e=>setTahun(+e.target.value)}>
              {Array.from({length:5},(_,i)=>now.getFullYear()-i).map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {tab==='kelas' && (
            <select className="select flex-1 max-w-xs" value={selKelas} onChange={e=>setSelKelas(e.target.value)}>
              <option value="">-- Pilih Kelas --</option>
              {kelas.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          )}
        </div>

        {loading ? <div className="flex items-center justify-center h-48"><div className="spinner"/></div> : (
          <div className="space-y-4">
            {chartData.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-white text-sm mb-5">
                  {tab==='rekapitulasi' ? 'Perbandingan Kehadiran Per Kelas' : `Detail — ${data?.kelas?.nama||''}`}
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top:5, right:10, bottom:5, left:-20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="name" tick={{ fontSize:11, fill:'#4a5578' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:11, fill:'#4a5578' }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:'#8b9cc8' }}/>
                    <Bar dataKey="Hadir" fill="#10d98a" radius={[4,4,0,0]}/>
                    <Bar dataKey="Alpa"  fill="#f43f5e" radius={[4,4,0,0]}/>
                    <Bar dataKey="Sakit" fill="#f59e0b" radius={[4,4,0,0]}/>
                    <Bar dataKey="Izin"  fill="#3b82f6" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="card overflow-hidden">
              <div className="p-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="font-bold text-white text-sm">Detail Tabel</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <th className="table-head">{tab==='kelas'?'Nama Siswa':'Kelas'}</th>
                      <th className="table-head" style={{ color:'#10d98a' }}>Hadir</th>
                      <th className="table-head" style={{ color:'#f43f5e' }}>Alpa</th>
                      <th className="table-head" style={{ color:'#f59e0b' }}>Sakit</th>
                      <th className="table-head" style={{ color:'#3b82f6' }}>Izin</th>
                      <th className="table-head">% Hadir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r,i) => {
                      const total = (+r.hadir||0)+(+r.alpa||0)+(+r.sakit||0)+(+r.izin||0);
                      const pct = total>0 ? Math.round((r.hadir/total)*100) : 0;
                      const color = pct>=80?'#10d98a':pct>=60?'#f59e0b':'#f43f5e';
                      return (
                        <tr key={i} className="table-row">
                          <td className="table-cell font-semibold text-slate-200">{r.kelas||r.nama}</td>
                          <td className="table-cell font-bold" style={{ color:'#10d98a' }}>{r.hadir||0}</td>
                          <td className="table-cell font-bold" style={{ color:'#f43f5e' }}>{r.alpa||0}</td>
                          <td className="table-cell font-bold" style={{ color:'#f59e0b' }}>{r.sakit||0}</td>
                          <td className="table-cell font-bold" style={{ color:'#3b82f6' }}>{r.izin||0}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
                                <div className="h-full rounded-full" style={{ width:`${pct}%`, background:color }}/>
                              </div>
                              <span className="text-xs font-bold" style={{ color }}>{r.persen_hadir||pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {rows.length===0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-600 text-sm">Tidak ada data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
LaporanPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
