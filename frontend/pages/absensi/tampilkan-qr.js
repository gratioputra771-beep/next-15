import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RefreshCw, Download, Printer, ChevronLeft, ChevronRight, QrCode, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { qrAPI, kelasAPI } from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function TampilkanQRPage() {
  const router = useRouter();
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mode, setMode] = useState('grid'); // grid | slideshow
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const timerRef = useRef(null);

  useEffect(() => {
    kelasAPI.getAll().then(r => setKelasList(r.data.data)).catch(() => {});
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (qrList.length > 0) {
      clearInterval(timerRef.current);
      setTimeLeft(30 * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { loadQR(selectedKelas); return 30 * 60; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [qrList.length]);

  const loadQR = async (kelasId) => {
    if (!kelasId) return;
    setLoading(true);
    try {
      const res = await qrAPI.getKelasQR(kelasId);
      setQrList(res.data.data);
      setCurrentIdx(0);
      toast.success(`QR untuk ${res.data.data.length} siswa dimuat`);
    } catch { toast.error('Gagal memuat QR'); }
    finally { setLoading(false); }
  };

  const handleKelasChange = (id) => {
    setSelectedKelas(id);
    setQrList([]);
    loadQR(id);
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      const res = await qrAPI.getKelasQR(selectedKelas);
      setQrList(res.data.data);
      setTimeLeft(30 * 60);
      toast.success('QR diperbarui!');
    } catch { toast.error('Gagal'); }
    finally { setLoading(false); }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const current = qrList[currentIdx];

  return (
    <>
      <Head><title>Tampilkan QR — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tampilkan QR Siswa</h1>
            <p className="text-slate-500 text-sm mt-1">Tampilkan atau proyeksikan QR code untuk siswa scan</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {qrList.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-700 text-sm font-semibold">
                <Clock className="w-4 h-4" />
                Refresh: {formatTime(timeLeft)}
              </div>
            )}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
              {['grid', 'slideshow'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${mode === m ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                  {m === 'grid' ? '⊞ Grid' : '▶ Slideshow'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="card p-4 mb-5 flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="label">Pilih Kelas</label>
            <select className="select" value={selectedKelas} onChange={e => handleKelasChange(e.target.value)}>
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama} ({k.tingkat})</option>)}
            </select>
          </div>
          {qrList.length > 0 && (
            <button onClick={refreshAll} disabled={loading} className="btn-secondary">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh QR
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="spinner mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Memuat QR...</p>
            </div>
          </div>
        )}

        {/* GRID MODE */}
        {!loading && mode === 'grid' && qrList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {qrList.map((s, i) => (
              <div key={s.siswa_id} className="card p-4 text-center hover:shadow-card-hover transition-all">
                {s.qr_image ? (
                  <img src={s.qr_image} alt={s.nama} className="w-full aspect-square rounded-xl mb-3 border-2 border-slate-100" />
                ) : (
                  <div className="w-full aspect-square bg-slate-100 rounded-xl mb-3 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <div className="font-semibold text-slate-800 text-xs leading-tight truncate">{s.nama}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{s.nis}</div>
                <div className={`text-[10px] mt-1 font-semibold ${s.jenis_kelamin === 'L' ? 'text-blue-500' : 'text-pink-500'}`}>
                  {s.jenis_kelamin === 'L' ? '♂ L' : '♀ P'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SLIDESHOW MODE */}
        {!loading && mode === 'slideshow' && qrList.length > 0 && current && (
          <div className="flex flex-col items-center">
            <div className="card p-8 w-full max-w-sm text-center shadow-2xl">
              <div className="mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold ${current.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                  {current.nama[0]}
                </div>
                <div className="text-xl font-bold text-slate-900">{current.nama}</div>
                <div className="text-slate-400 text-sm font-mono mt-1">{current.nis}</div>
              </div>

              {current.qr_image ? (
                <img
                  src={current.qr_image}
                  alt={current.nama}
                  className="w-64 h-64 rounded-2xl mx-auto border-4 border-slate-100 shadow-lg"
                />
              ) : (
                <div className="w-64 h-64 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-slate-300" />
                </div>
              )}

              <p className="text-xs text-amber-600 mt-4 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> QR berganti otomatis setiap 30 menit
              </p>

              <div className="text-xs text-slate-400 mt-1">{currentIdx + 1} dari {qrList.length}</div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="btn-secondary disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" /> Sebelumnya
              </button>
              <div className="flex gap-1">
                {qrList.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentIdx ? 'bg-blue-600 w-4' : 'bg-slate-300'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentIdx(i => Math.min(qrList.length - 1, i + 1))}
                disabled={currentIdx === qrList.length - 1}
                className="btn-secondary disabled:opacity-40"
              >
                Berikutnya <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {!loading && !selectedKelas && (
          <div className="card p-12 text-center">
            <QrCode className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-600">Pilih kelas untuk menampilkan QR</h3>
            <p className="text-slate-400 text-sm mt-1">QR code akan ditampilkan untuk semua siswa aktif di kelas tersebut</p>
          </div>
        )}
      </div>
    </>
  );
}

TampilkanQRPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
