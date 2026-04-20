import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ClipboardList, Save, CheckCircle, XCircle, AlertCircle, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { absensiAPI, sesiAPI, kelasAPI } from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ManualAbsensiPage() {
  const [kelasList, setKelasList] = useState([]);
  const [sesiList, setSesiList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSesi, setSelectedSesi] = useState('');
  const [sesiData, setSesiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalKet, setModalKet] = useState(null);

  useEffect(() => { kelasAPI.getAll().then(r => setKelasList(r.data.data)).catch(() => {}); }, []);
  useEffect(() => { if (selectedKelas) loadSesi(selectedKelas); }, [selectedKelas]);
  useEffect(() => { if (selectedSesi) loadSesiData(selectedSesi); }, [selectedSesi]);

  const loadSesi = async (kelasId) => {
    try {
      const res = await sesiAPI.getAll({ kelas_id: kelasId, tanggal: new Date().toISOString().split('T')[0] });
      setSesiList(res.data.data);
    } catch {}
  };

  const loadSesiData = async (sesiId) => {
    setLoading(true);
    try {
      const res = await absensiAPI.getBySesi(sesiId);
      setSesiData(res.data.data);
    } catch { toast.error('Gagal memuat data sesi'); }
    finally { setLoading(false); }
  };

  const handleStatus = (siswa, status) => {
    if (['sakit', 'izin'].includes(status)) {
      setModalKet({ siswa, status, keterangan: siswa.keterangan || '' });
    } else {
      simpan(siswa.id, status, null);
    }
  };

  const simpan = async (siswaId, status, keterangan) => {
    try {
      await absensiAPI.manual({ siswa_id: siswaId, sesi_absensi_id: parseInt(selectedSesi), status, keterangan });
      setSesiData(prev => ({
        ...prev,
        siswa: prev.siswa.map(s => s.id === siswaId ? { ...s, status, keterangan, metode: 'manual' } : s)
      }));
      toast.success('Absensi disimpan');
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
  };

  const filtered = (sesiData?.siswa || []).filter(s =>
    !search || s.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Input Absensi Manual — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Input Absensi Manual</h1>
          <p className="text-slate-500 text-sm mt-1">Input status kehadiran untuk siswa yang tidak bisa scan QR</p>
        </div>

        <div className="card p-4 mb-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Pilih Kelas</label>
              <select className="select" value={selectedKelas} onChange={e => { setSelectedKelas(e.target.value); setSelectedSesi(''); setSesiData(null); }}>
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select></div>
            <div><label className="label">Pilih Sesi</label>
              <select className="select" value={selectedSesi} onChange={e => setSelectedSesi(e.target.value)} disabled={!selectedKelas}>
                <option value="">-- Pilih Sesi --</option>
                {sesiList.map(s => <option key={s.id} value={s.id}>{s.sesi === 'masuk' ? '🏫 Masuk' : '🏠 Pulang'} — {s.jam_buka}–{s.jam_tutup} ({s.status})</option>)}
              </select></div>
          </div>
        </div>

        {loading && <div className="flex items-center justify-center h-32"><div className="spinner" /></div>}

        {sesiData && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Hadir', val: sesiData.summary.hadir, cls: 'text-emerald-600 bg-emerald-50' },
                { label: 'Alpa',  val: sesiData.summary.alpa,  cls: 'text-red-600 bg-red-50' },
                { label: 'Sakit', val: sesiData.summary.sakit, cls: 'text-amber-600 bg-amber-50' },
                { label: 'Izin',  val: sesiData.summary.izin,  cls: 'text-blue-600 bg-blue-50' },
              ].map((s, i) => (
                <div key={i} className={`${s.cls} rounded-2xl p-3 text-center`}>
                  <div className={`text-2xl font-bold`}>{s.val}</div>
                  <div className="text-xs opacity-70">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input className="input pl-9" placeholder="Cari nama siswa..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {filtered.map((siswa, i) => (
                  <div key={siswa.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="text-slate-300 text-xs w-5 flex-shrink-0">{i+1}</div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${siswa.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {siswa.nama[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate">{siswa.nama}</div>
                      {siswa.keterangan && <div className="text-xs text-slate-400 truncate">{siswa.keterangan}</div>}
                    </div>
                    {siswa.metode === 'qr' && <span className="text-xs text-blue-500 font-medium hidden sm:block">QR ✓</span>}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {[
                        { s: 'hadir', icon: CheckCircle, cls: 'hover:bg-emerald-100 hover:text-emerald-700', active: 'bg-emerald-500 text-white' },
                        { s: 'alpa', icon: XCircle, cls: 'hover:bg-red-100 hover:text-red-700', active: 'bg-red-500 text-white' },
                        { s: 'sakit', icon: AlertCircle, cls: 'hover:bg-amber-100 hover:text-amber-700', active: 'bg-amber-500 text-white' },
                        { s: 'izin', icon: Clock, cls: 'hover:bg-blue-100 hover:text-blue-700', active: 'bg-blue-500 text-white' },
                      ].map(opt => (
                        <button
                          key={opt.s}
                          onClick={() => handleStatus(siswa, opt.s)}
                          title={opt.s.charAt(0).toUpperCase() + opt.s.slice(1)}
                          className={`p-1.5 rounded-lg transition-all text-slate-400 ${siswa.status === opt.s ? opt.active : opt.cls}`}
                        >
                          <opt.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal keterangan */}
      {modalKet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {modalKet.status === 'sakit' ? '🤒 Keterangan Sakit' : '📝 Keterangan Izin'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{modalKet.siswa.nama}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">{modalKet.status === 'sakit' ? 'Sakit apa?' : 'Izin untuk apa?'} *</label>
                <textarea className="input resize-none" rows={3}
                  placeholder={modalKet.status === 'sakit' ? 'Demam, flu, sakit kepala...' : 'Acara keluarga, keperluan mendesak...'}
                  value={modalKet.keterangan}
                  onChange={e => setModalKet({...modalKet, keterangan: e.target.value})}
                  autoFocus />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModalKet(null)} className="btn-secondary flex-1">Batal</button>
                <button
                  disabled={!modalKet.keterangan.trim()}
                  onClick={() => { simpan(modalKet.siswa.id, modalKet.status, modalKet.keterangan); setModalKet(null); }}
                  className="btn-primary flex-1"
                >
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
ManualAbsensiPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
