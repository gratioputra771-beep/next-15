import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Plus, Search, QrCode, Edit2, X, Save, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { siswaAPI, kelasAPI, qrAPI } from '../lib/api';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function SiswaPage() {
  const [list, setList] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);
  const LIMIT = 20;

  const def = { nis:'',nisn:'',nama:'',kelas_id:'',jenis_kelamin:'L',tanggal_lahir:'',alamat:'',no_hp:'',email:'',nama_orang_tua:'',no_hp_orang_tua:'' };
  const [form, setForm] = useState(def);

  useEffect(() => { kelasAPI.getAll().then(r=>setKelas(r.data.data)).catch(()=>{}); }, []);
  useEffect(() => { load(); }, [search, filterKelas, page]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await siswaAPI.getAll({ search, kelas_id:filterKelas, page, limit:LIMIT });
      setList(res.data.data);
      setTotal(res.data.pagination?.total || res.data.data.length);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(def); setEditItem(null); setShowModal(true); };
  const openEdit = (s) => {
    setForm({ nis:s.nis,nisn:s.nisn||'',nama:s.nama,kelas_id:s.kelas_id,jenis_kelamin:s.jenis_kelamin,
      tanggal_lahir:s.tanggal_lahir?.split('T')[0]||'',alamat:s.alamat||'',no_hp:s.no_hp||'',
      email:s.email||'',nama_orang_tua:s.nama_orang_tua||'',no_hp_orang_tua:s.no_hp_orang_tua||'' });
    setEditItem(s); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      editItem ? await siswaAPI.update(editItem.id, form) : await siswaAPI.create(form);
      toast.success(editItem ? 'Data diperbarui!' : 'Siswa ditambahkan!');
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message||'Gagal'); }
    finally { setSubmitting(false); }
  };

  const showQR = async (siswa) => {
    setLoadingQR(true);
    setQrModal({ nama:siswa.nama, nis:siswa.nis, kelas:siswa.nama_kelas, qr_image:null });
    try {
      const res = await qrAPI.getSiswaQR(siswa.id);
      setQrModal(res.data.data);
    } catch { toast.error('Gagal memuat QR'); setQrModal(null); }
    finally { setLoadingQR(false); }
  };

  const totalPages = Math.ceil(total/LIMIT);

  return (
    <>
      <Head><title>Data Siswa — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Data Siswa</h1>
            <p className="text-slate-500 text-sm mt-0.5">{total} siswa terdaftar</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn-ghost btn-sm"><RefreshCw className="w-3.5 h-3.5"/></button>
            <button onClick={openAdd} className="btn-primary btn-sm"><Plus className="w-4 h-4"/> Tambah</button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-4 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"/>
            <input className="input pl-9" placeholder="Cari nama atau NIS..." value={search}
              onChange={e=>{setSearch(e.target.value);setPage(1);}} />
          </div>
          <select className="select w-auto min-w-36" value={filterKelas} onChange={e=>{setFilterKelas(e.target.value);setPage(1);}}>
            <option value="">Semua Kelas</option>
            {kelas.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? <div className="flex items-center justify-center h-48"><div className="spinner"/></div>
          : list.length===0 ? (
            <div className="text-center py-16 text-slate-600">Tidak ada data siswa</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <th className="table-head">Siswa</th>
                    <th className="table-head hidden sm:table-cell">NIS</th>
                    <th className="table-head">Kelas</th>
                    <th className="table-head hidden lg:table-cell">Orang Tua</th>
                    <th className="table-head text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(s => (
                    <tr key={s.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background:s.jenis_kelamin==='L'?'rgba(59,130,246,0.15)':'rgba(236,72,153,0.15)',
                                     color:s.jenis_kelamin==='L'?'#3b82f6':'#ec4899' }}>
                            {s.nama[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 text-sm">{s.nama}</div>
                            <div className="text-xs text-slate-600">{s.jenis_kelamin==='L'?'Laki-laki':'Perempuan'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell font-mono text-xs text-slate-500">{s.nis}</td>
                      <td className="table-cell">
                        <span className="badge text-[10px]" style={{ background:'rgba(99,102,241,0.1)', color:'#6366f1', border:'1px solid rgba(99,102,241,0.2)' }}>
                          {s.nama_kelas}
                        </span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <div className="text-xs">
                          <div className="text-slate-400 font-medium">{s.nama_orang_tua||'—'}</div>
                          <div className="text-slate-600">{s.no_hp_orang_tua||''}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={()=>showQR(s)} className="btn-icon w-8 h-8" title="Lihat QR">
                            <QrCode className="w-3.5 h-3.5"/>
                          </button>
                          <button onClick={()=>openEdit(s)} className="btn-icon w-8 h-8" title="Edit">
                            <Edit2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs text-slate-500">Halaman {page} dari {totalPages}</span>
              <div className="flex gap-1">
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="btn-ghost btn-sm p-1.5 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="btn-ghost btn-sm p-1.5 disabled:opacity-30">
                  <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}>
          <div className="w-full max-w-2xl rounded-2xl my-4 animate-scale-in"
            style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-5 flex items-center justify-between" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-bold text-white">{editItem?'Edit Siswa':'Tambah Siswa'}</h3>
              <button onClick={()=>setShowModal(false)} className="btn-icon w-8 h-8"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">NIS *</label><input className="input" value={form.nis} onChange={e=>setForm({...form,nis:e.target.value})} required readOnly={!!editItem}/></div>
                <div><label className="label">NISN</label><input className="input" value={form.nisn} onChange={e=>setForm({...form,nisn:e.target.value})}/></div>
                <div className="sm:col-span-2"><label className="label">Nama Lengkap *</label><input className="input" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} required/></div>
                <div>
                  <label className="label">Kelas *</label>
                  <select className="select" value={form.kelas_id} onChange={e=>setForm({...form,kelas_id:e.target.value})} required>
                    <option value="">-- Pilih --</option>
                    {kelas.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Jenis Kelamin *</label>
                  <select className="select" value={form.jenis_kelamin} onChange={e=>setForm({...form,jenis_kelamin:e.target.value})}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div><label className="label">Tanggal Lahir</label><input type="date" className="input" value={form.tanggal_lahir} onChange={e=>setForm({...form,tanggal_lahir:e.target.value})}/></div>
                <div><label className="label">No. HP</label><input className="input" value={form.no_hp} onChange={e=>setForm({...form,no_hp:e.target.value})}/></div>
                <div><label className="label">Nama Orang Tua</label><input className="input" value={form.nama_orang_tua} onChange={e=>setForm({...form,nama_orang_tua:e.target.value})}/></div>
                <div><label className="label">HP Orang Tua</label><input className="input" value={form.no_hp_orang_tua} onChange={e=>setForm({...form,no_hp_orang_tua:e.target.value})}/></div>
                <div className="sm:col-span-2"><label className="label">Alamat</label><textarea className="textarea" rows={2} value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})}/></div>
              </div>
              <div className="flex gap-3 mt-5 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" onClick={()=>setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting?'...':<><Save className="w-4 h-4"/>{editItem?'Perbarui':'Simpan'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.8)', backdropFilter:'blur(12px)' }}>
          <div className="w-full max-w-xs rounded-2xl overflow-hidden animate-scale-in"
            style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-6 text-center" style={{ background:'linear-gradient(135deg, rgba(16,217,138,0.08), rgba(16,217,138,0.03))' }}>
              <div className="text-base font-bold text-white">{qrModal.nama}</div>
              <div className="text-xs text-slate-500 mt-0.5">{qrModal.kelas} · {qrModal.nis}</div>
            </div>
            <div className="p-6 text-center">
              {loadingQR || !qrModal.qr_image ? (
                <div className="w-48 h-48 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div className="spinner"/>
                </div>
              ) : (
                <img src={qrModal.qr_image} alt="QR" className="w-48 h-48 rounded-2xl mx-auto"
                  style={{ border:'2px solid rgba(255,255,255,0.06)' }} />
              )}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>
                QR berubah setiap 30 menit
              </div>
              <button onClick={()=>setQrModal(null)} className="btn-secondary w-full mt-4">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
SiswaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
