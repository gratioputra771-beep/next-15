import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Plus, Clock, Eye, XCircle, RefreshCw, BookOpen, ChevronRight, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { sesiAPI, kelasAPI } from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function SesiPage() {
  const [sesiList, setSesiList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ kelas_id:'', tanggal:today, sesi:'masuk', jam_buka:'07:00', jam_tutup:'08:00', catatan:'' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sR, kR] = await Promise.all([sesiAPI.getAll({ tanggal: today }), kelasAPI.getAll()]);
      setSesiList(sR.data.data);
      setKelasList(kR.data.data);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await sesiAPI.create(form);
      toast.success('Sesi berhasil dibuat!');
      setShowModal(false); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
    finally { setSubmitting(false); }
  };

  const handleTutup = async (id, nama) => {
    if (!confirm(`Tutup sesi ${nama}? Siswa belum absen akan otomatis ALPA.`)) return;
    try {
      const res = await sesiAPI.tutup(id);
      toast.success(res.data.message); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
  };

  const statusColor = { aktif: '#10d98a', selesai: '#4a5578', dibatalkan: '#f43f5e' };

  return (
    <>
      <Head><title>Kelola Sesi — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Kelola Sesi Absensi</h1>
            <p className="text-slate-500 text-sm mt-0.5">{format(new Date(), "EEEE, dd MMMM yyyy", { locale:id })}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="btn-ghost btn-sm"><RefreshCw className="w-3.5 h-3.5" /></button>
            <button onClick={() => setShowModal(true)} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Buat Sesi</button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="spinner" /></div>
        ) : sesiList.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(16,217,138,0.08)', border: '1px solid rgba(16,217,138,0.15)' }}>
              <Clock className="w-8 h-8" style={{ color: '#10d98a' }} />
            </div>
            <h3 className="font-bold text-white mb-1">Belum ada sesi hari ini</h3>
            <p className="text-slate-500 text-sm mb-5">Buat sesi absensi untuk mulai mencatat kehadiran</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto"><Plus className="w-4 h-4" /> Buat Sesi Baru</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sesiList.map(sesi => {
              const pct = sesi.total_siswa > 0 ? Math.round(((sesi.hadir||0)/sesi.total_siswa)*100) : 0;
              return (
                <div key={sesi.id} className="card p-5 hover:border-white/10 transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-white text-lg">{sesi.nama_kelas}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{sesi.tingkat}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="badge text-[10px]" style={{
                        color: statusColor[sesi.status],
                        background: `${statusColor[sesi.status]}18`,
                        border: `1px solid ${statusColor[sesi.status]}25`
                      }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[sesi.status] }} />
                        {sesi.status}
                      </span>
                      <span className="badge text-[10px]" style={{
                        color: sesi.sesi==='masuk' ? '#3b82f6' : '#f59e0b',
                        background: sesi.sesi==='masuk' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                        border: `1px solid ${sesi.sesi==='masuk' ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)'}`
                      }}>
                        {sesi.sesi==='masuk' ? '🏫 Masuk' : '🏠 Pulang'}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    {sesi.jam_buka} – {sesi.jam_tutup}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-1.5 mb-4">
                    {[
                      { label:'Hadir', val:sesi.hadir||0, color:'#10d98a' },
                      { label:'Alpa',  val:sesi.alpa||0,  color:'#f43f5e' },
                      { label:'Sakit', val:sesi.sakit||0, color:'#f59e0b' },
                      { label:'Izin',  val:sesi.izin||0,  color:'#3b82f6' },
                    ].map((st,i) => (
                      <div key={i} className="text-center p-2 rounded-xl" style={{ background:'rgba(255,255,255,0.03)' }}>
                        <div className="text-base font-bold" style={{ color: st.color }}>{st.val}</div>
                        <div className="text-[10px] text-slate-600">{st.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width:`${pct}%`, background:'linear-gradient(90deg, #10d98a, #0ea572)' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                      <span>{sesi.hadir||0}/{sesi.total_siswa} hadir</span>
                      <span>{pct}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/absensi/sesi/${sesi.id}`} className="flex-1">
                      <button className="btn-secondary btn-sm w-full justify-center">
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                    </Link>
                    {sesi.status === 'aktif' && (
                      <button onClick={() => handleTutup(sesi.id, sesi.nama_kelas)} className="btn-danger btn-sm flex-1 justify-center">
                        <XCircle className="w-3.5 h-3.5" /> Tutup
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden animate-scale-in"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-bold text-white">Buat Sesi Absensi</h3>
              <p className="text-slate-500 text-sm mt-0.5">Isi detail sesi untuk kelas yang dipilih</p>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="label">Kelas *</label>
                <select className="select" value={form.kelas_id} onChange={e=>setForm({...form,kelas_id:e.target.value})} required>
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map(k=><option key={k.id} value={k.id}>{k.nama} — {k.tingkat} {k.jurusan}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tanggal *</label>
                  <input type="date" className="input" value={form.tanggal} onChange={e=>setForm({...form,tanggal:e.target.value})} required />
                </div>
                <div>
                  <label className="label">Sesi *</label>
                  <select className="select" value={form.sesi} onChange={e=>setForm({...form,sesi:e.target.value})}>
                    <option value="masuk">🏫 Masuk</option>
                    <option value="pulang">🏠 Pulang</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Jam Buka *</label>
                  <input type="time" className="input" value={form.jam_buka} onChange={e=>setForm({...form,jam_buka:e.target.value})} required />
                </div>
                <div>
                  <label className="label">Jam Tutup *</label>
                  <input type="time" className="input" value={form.jam_tutup} onChange={e=>setForm({...form,jam_tutup:e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="label">Catatan (opsional)</label>
                <input className="input" placeholder="Upacara, hari libur, dll..." value={form.catatan} onChange={e=>setForm({...form,catatan:e.target.value})} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={()=>setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <><span className="spinner-sm"/>Menyimpan...</> : <><Plus className="w-4 h-4"/>Buat Sesi</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
SesiPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
