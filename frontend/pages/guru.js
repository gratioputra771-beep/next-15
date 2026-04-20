import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Plus, GraduationCap, Edit2, X, Save, RefreshCw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { guruAPI } from '../lib/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';

const JABATAN_BADGE = {
  admin: 'bg-red-100 text-red-700',
  kepala_sekolah: 'bg-purple-100 text-purple-700',
  wali_kelas: 'bg-blue-100 text-blue-700',
  guru: 'bg-slate-100 text-slate-600',
};

export default function GuruPage() {
  const user = useAuthStore(s => s.user);
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGuru, setEditGuru] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nama: '', nip: '', email: '', password: '', no_hp: '', jabatan: 'guru' });

  const load = async () => {
    setLoading(true);
    try { const res = await guruAPI.getAll(); setGuruList(res.data.data); }
    catch { toast.error('Gagal memuat data guru'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ nama: '', nip: '', email: '', password: '', no_hp: '', jabatan: 'guru' }); setEditGuru(null); setShowModal(true); };
  const openEdit = (g) => { setForm({ nama: g.nama, nip: g.nip || '', email: g.email, password: '', no_hp: g.no_hp || '', jabatan: g.jabatan }); setEditGuru(g); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editGuru) { await guruAPI.update(editGuru.id, form); toast.success('Data guru diperbarui!'); }
      else { await guruAPI.create(form); toast.success('Guru berhasil ditambahkan!'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
    finally { setSubmitting(false); }
  };

  if (!['admin', 'kepala_sekolah'].includes(user?.jabatan)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Akses ditolak. Halaman ini khusus admin.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>Data Guru — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Data Guru</h1>
            <p className="text-slate-500 text-sm mt-1">{guruList.length} guru/staff terdaftar</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn-secondary btn-sm"><RefreshCw className="w-3.5 h-3.5" /></button>
            <button onClick={openAdd} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Tambah Guru</button>
          </div>
        </div>

        {loading ? <div className="flex items-center justify-center h-48"><div className="spinner" /></div> : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-head">Guru</th>
                  <th className="table-head hidden sm:table-cell">NIP</th>
                  <th className="table-head hidden md:table-cell">Email</th>
                  <th className="table-head">Jabatan</th>
                  <th className="table-head">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {guruList.map(g => (
                  <tr key={g.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {g.nama[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{g.nama}</div>
                          <div className="text-xs text-slate-400 md:hidden">{g.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell font-mono text-xs text-slate-500">{g.nip || '—'}</td>
                    <td className="table-cell hidden md:table-cell text-slate-500 text-xs">{g.email}</td>
                    <td className="table-cell">
                      <span className={`badge capitalize ${JABATAN_BADGE[g.jabatan] || 'badge-belum'}`}>
                        {g.jabatan?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button onClick={() => openEdit(g)} className="btn-ghost btn-sm p-1.5"><Edit2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{editGuru ? 'Edit Data Guru' : 'Tambah Guru'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost btn-sm p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="label">Nama Lengkap *</label>
                <input className="input" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">NIP</label>
                  <input className="input" value={form.nip} onChange={e => setForm({...form, nip: e.target.value})} /></div>
                <div><label className="label">No. HP</label>
                  <input className="input" value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} /></div>
              </div>
              <div><label className="label">Email *</label>
                <input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required readOnly={!!editGuru} /></div>
              {!editGuru && (
                <div><label className="label">Password *</label>
                  <input type="password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} /></div>
              )}
              <div><label className="label">Jabatan</label>
                <select className="select" value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})}>
                  <option value="guru">Guru</option>
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="kepala_sekolah">Kepala Sekolah</option>
                  <option value="admin">Admin</option>
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
GuruPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
