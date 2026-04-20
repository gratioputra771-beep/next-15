// pages/kelas.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Plus, BookOpen, Users, Edit2, X, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { kelasAPI, guruAPI } from '../lib/api';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function KelasPage() {
  const [kelasList, setKelasList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editKelas, setEditKelas] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nama: '', tingkat: 'X', jurusan: 'IPA', wali_kelas_id: '', tahun_ajaran: '2024/2025' });

  const load = async () => {
    setLoading(true);
    try {
      const [kelasRes, guruRes] = await Promise.all([kelasAPI.getAll(), guruAPI.getAll()]);
      setKelasList(kelasRes.data.data);
      setGuruList(guruRes.data.data);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ nama: '', tingkat: 'X', jurusan: 'IPA', wali_kelas_id: '', tahun_ajaran: '2024/2025' }); setEditKelas(null); setShowModal(true); };
  const openEdit = (k) => { setForm({ nama: k.nama, tingkat: k.tingkat, jurusan: k.jurusan || '', wali_kelas_id: k.wali_kelas_id || '', tahun_ajaran: k.tahun_ajaran }); setEditKelas(k); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editKelas) { await kelasAPI.update(editKelas.id, form); toast.success('Kelas diperbarui!'); }
      else { await kelasAPI.create(form); toast.success('Kelas ditambahkan!'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <Head><title>Data Kelas — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Data Kelas</h1>
            <p className="text-slate-500 text-sm mt-1">{kelasList.length} kelas aktif</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn-secondary btn-sm"><RefreshCw className="w-3.5 h-3.5" /></button>
            <button onClick={openAdd} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Tambah Kelas</button>
          </div>
        </div>

        {loading ? <div className="flex items-center justify-center h-48"><div className="spinner" /></div> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kelasList.map(k => (
              <div key={k.id} className="card-hover p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <button onClick={() => openEdit(k)} className="btn-ghost btn-sm p-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="font-bold text-slate-900 text-xl mb-1">{k.nama}</div>
                <div className="text-sm text-slate-500 mb-3">{k.tingkat} {k.jurusan} · {k.tahun_ajaran}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-blue-600">{k.jumlah_siswa}</span>
                  <span className="text-slate-400">siswa</span>
                </div>
                {k.wali_kelas_nama && (
                  <div className="mt-2 text-xs text-slate-500 truncate">Wali: {k.wali_kelas_nama}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{editKelas ? 'Edit Kelas' : 'Tambah Kelas'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost btn-sm p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="label">Nama Kelas *</label>
                <input className="input" placeholder="X-A, XI-IPA-1, dll" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Tingkat *</label>
                  <select className="select" value={form.tingkat} onChange={e => setForm({...form, tingkat: e.target.value})}>
                    <option value="X">X</option><option value="XI">XI</option><option value="XII">XII</option>
                  </select></div>
                <div><label className="label">Jurusan</label>
                  <select className="select" value={form.jurusan} onChange={e => setForm({...form, jurusan: e.target.value})}>
                    <option value="IPA">IPA</option><option value="IPS">IPS</option><option value="Bahasa">Bahasa</option><option value="Umum">Umum</option>
                  </select></div>
              </div>
              <div><label className="label">Tahun Ajaran *</label>
                <input className="input" placeholder="2024/2025" value={form.tahun_ajaran} onChange={e => setForm({...form, tahun_ajaran: e.target.value})} required /></div>
              <div><label className="label">Wali Kelas</label>
                <select className="select" value={form.wali_kelas_id} onChange={e => setForm({...form, wali_kelas_id: e.target.value})}>
                  <option value="">-- Pilih Wali Kelas --</option>
                  {guruList.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
                </select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? '...' : <><Save className="w-4 h-4" /> Simpan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
KelasPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
