import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Search, Clock, QrCode, CheckCircle, XCircle, AlertCircle, Save, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { absensiAPI } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const STATUS = {
  hadir: { label:'Hadir',  color:'#10d98a', bg:'rgba(16,217,138,0.1)',  Icon: CheckCircle },
  alpa:  { label:'Alpa',   color:'#f43f5e', bg:'rgba(244,63,94,0.1)',   Icon: XCircle },
  sakit: { label:'Sakit',  color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  Icon: AlertCircle },
  izin:  { label:'Izin',   color:'#3b82f6', bg:'rgba(59,130,246,0.1)',  Icon: Clock },
};

export default function DetailSesiPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState({});
  const [modal, setModal] = useState(null);

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await absensiAPI.getBySesi(id);
      setData(res.data.data);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  const handleStatus = (siswa, status) => {
    if (['sakit','izin'].includes(status)) {
      setModal({ siswa, status, keterangan: siswa.keterangan||'' });
    } else { simpan(siswa.id, status, null); }
  };

  const simpan = async (siswaId, status, keterangan) => {
    setSaving(p=>({...p,[siswaId]:true}));
    try {
      await absensiAPI.manual({ siswa_id:siswaId, sesi_absensi_id:parseInt(id), status, keterangan });
      setData(p => ({
        ...p,
        siswa: p.siswa.map(s => s.id===siswaId ? {...s, status, keterangan, metode:'manual'} : s),
        summary: recalc(p.siswa.map(s => s.id===siswaId ? {...s, status} : s))
      }));
      toast.success('Tersimpan');
    } catch (err) { toast.error(err.response?.data?.message||'Gagal'); }
    finally { setSaving(p=>({...p,[siswaId]:false})); }
  };

  const recalc = (list) => ({
    total: list.length,
    hadir: list.filter(s=>s.status==='hadir').length,
    alpa:  list.filter(s=>s.status==='alpa').length,
    sakit: list.filter(s=>s.status==='sakit').length,
    izin:  list.filter(s=>s.status==='izin').length,
    belum: list.filter(s=>!s.status).length,
  });

  const filtered = (data?.siswa||[]).filter(s =>
    !search || s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search)
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"/></div>;
  if (!data) return null;
  const { sesi, summary } = data;

  return (
    <>
      <Head><title>Detail Sesi — {sesi.nama_kelas}</title></Head>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <Link href="/absensi/sesi">
            <button className="btn-ghost btn-sm mt-1"><ArrowLeft className="w-4 h-4"/></button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">{sesi.nama_kelas}</h1>
              <span className="badge text-[10px]" style={{
                color: sesi.sesi==='masuk'?'#3b82f6':'#f59e0b',
                background: sesi.sesi==='masuk'?'rgba(59,130,246,0.1)':'rgba(245,158,11,0.1)',
                border: `1px solid ${sesi.sesi==='masuk'?'rgba(59,130,246,0.2)':'rgba(245,158,11,0.2)'}`
              }}>
                {sesi.sesi==='masuk'?'🏫 Masuk':'🏠 Pulang'}
              </span>
              <span className="badge text-[10px]" style={{
                color: sesi.status==='aktif'?'#10d98a':'#4a5578',
                background: sesi.status==='aktif'?'rgba(16,217,138,0.1)':'rgba(255,255,255,0.03)',
                border: `1px solid ${sesi.status==='aktif'?'rgba(16,217,138,0.2)':'rgba(255,255,255,0.06)'}`
              }}>
                {sesi.status}
              </span>
            </div>
            <div className="text-slate-500 text-xs mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{sesi.jam_buka}–{sesi.jam_tutup}</span>
              <span>📅 {new Date(sesi.tanggal).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
            </div>
          </div>
          <button onClick={load} className="btn-ghost btn-sm"><RefreshCw className="w-3.5 h-3.5"/></button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-5">
          {[
            { label:'Total', val:summary.total, color:'#8b9cc8', bg:'rgba(139,156,200,0.08)' },
            { label:'Hadir', val:summary.hadir, color:'#10d98a', bg:'rgba(16,217,138,0.08)' },
            { label:'Alpa',  val:summary.alpa,  color:'#f43f5e', bg:'rgba(244,63,94,0.08)' },
            { label:'Sakit', val:summary.sakit, color:'#f59e0b', bg:'rgba(245,158,11,0.08)' },
            { label:'Izin',  val:summary.izin,  color:'#3b82f6', bg:'rgba(59,130,246,0.08)' },
          ].map((s,i) => (
            <div key={i} className="card p-4 text-center" style={{ background: s.bg, borderColor: `${s.color}15` }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="card p-4 mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Progres Absensi</span>
            <span>{summary.total-summary.belum}/{summary.total} sudah diisi</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex" style={{ background:'rgba(255,255,255,0.04)' }}>
            {summary.total > 0 && [
              { v:summary.hadir, c:'#10d98a' },
              { v:summary.sakit, c:'#f59e0b' },
              { v:summary.izin,  c:'#3b82f6' },
              { v:summary.alpa,  c:'#f43f5e' },
            ].map((s,i) => s.v>0 && (
              <div key={i} className="h-full transition-all duration-700"
                style={{ width:`${(s.v/summary.total)*100}%`, background:s.c }} />
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="p-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input className="input pl-9" placeholder="Cari nama atau NIS..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <th className="table-head w-10">#</th>
                  <th className="table-head">Siswa</th>
                  <th className="table-head hidden sm:table-cell">NIS</th>
                  <th className="table-head hidden md:table-cell">Jam</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((siswa, idx) => {
                  const meta = STATUS[siswa.status];
                  return (
                    <tr key={siswa.id} className="table-row">
                      <td className="table-cell text-slate-600 text-xs">{idx+1}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: siswa.jenis_kelamin==='L' ? 'rgba(59,130,246,0.15)' : 'rgba(236,72,153,0.15)',
                                     color: siswa.jenis_kelamin==='L' ? '#3b82f6' : '#ec4899' }}>
                            {siswa.nama[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 text-sm">{siswa.nama}</div>
                            <div className="text-xs text-slate-600 sm:hidden">{siswa.nis}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell font-mono text-xs text-slate-500">{siswa.nis}</td>
                      <td className="table-cell hidden md:table-cell text-xs text-slate-500">
                        {siswa.jam_absen
                          ? new Date(siswa.jam_absen).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})
                          : siswa.metode==='qr' ? <span className="flex items-center gap-1 text-blue-400"><QrCode className="w-3 h-3"/>QR</span> : '—'}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {meta && <meta.Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: meta.color }} />}
                          <select
                            className="text-xs font-semibold bg-transparent border-0 cursor-pointer outline-none"
                            style={{ color: meta?.color || '#4a5578' }}
                            value={siswa.status||''}
                            onChange={e=>handleStatus(siswa, e.target.value)}
                            disabled={saving[siswa.id] || sesi.status==='selesai'}
                          >
                            <option value="" disabled style={{background:'#1a2235',color:'#8b9cc8'}}>-- Pilih --</option>
                            {Object.entries(STATUS).map(([k,v]) => (
                              <option key={k} value={k} style={{background:'#1a2235',color:v.color}}>{v.label}</option>
                            ))}
                          </select>
                          {saving[siswa.id] && <span className="spinner-sm" />}
                        </div>
                      </td>
                      <td className="table-cell">
                        {siswa.keterangan
                          ? <span className="text-xs text-slate-500 max-w-[140px] truncate block" title={siswa.keterangan}>{siswa.keterangan}</span>
                          : <span className="text-slate-700 text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal keterangan */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-2xl animate-scale-in"
            style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-5" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-bold text-white">
                {modal.status==='sakit' ? '🤒 Keterangan Sakit' : '📝 Keterangan Izin'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">{modal.siswa.nama}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">{modal.status==='sakit' ? 'Sakit apa?' : 'Izin untuk apa?'} *</label>
                <textarea className="textarea" rows={3}
                  placeholder={modal.status==='sakit' ? 'Demam, flu, sakit kepala...' : 'Acara keluarga, keperluan mendesak...'}
                  value={modal.keterangan}
                  onChange={e=>setModal({...modal,keterangan:e.target.value})}
                  autoFocus />
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setModal(null)} className="btn-secondary flex-1">Batal</button>
                <button
                  disabled={!modal.keterangan.trim()}
                  onClick={()=>{ simpan(modal.siswa.id,modal.status,modal.keterangan); setModal(null); }}
                  className="btn-primary flex-1">
                  <Save className="w-4 h-4"/> Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
DetailSesiPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
