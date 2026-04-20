import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { QrCode, CheckCircle, XCircle, AlertCircle, Camera, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { qrAPI, sesiAPI, kelasAPI } from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const SCAN_STATES = { IDLE: 'idle', SCANNING: 'scanning', SUCCESS: 'success', ERROR: 'error' };

export default function ScanQRPage() {
  const [kelasOptions, setKelasOptions] = useState([]);
  const [sesiOptions, setSesiOptions] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSesi, setSelectedSesi] = useState('');
  const [scanState, setScanState] = useState(SCAN_STATES.IDLE);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadKelas();
    return () => stopScanner();
  }, []);

  useEffect(() => {
    if (selectedKelas) loadSesi(selectedKelas);
  }, [selectedKelas]);

  const loadKelas = async () => {
    try {
      const res = await kelasAPI.getAll();
      setKelasOptions(res.data.data);
    } catch {}
  };

  const loadSesi = async (kelasId) => {
    try {
      const res = await sesiAPI.getAktif({ kelas_id: kelasId });
      setSesiOptions(res.data.data);
      if (res.data.data.length === 1) setSelectedSesi(String(res.data.data[0].id));
    } catch {}
  };

  const startScanner = () => {
    if (!selectedSesi) { toast.error('Pilih sesi absensi terlebih dahulu'); return; }
    if (scannerRef.current) return;

    setScannerStarted(true);
    setScanState(SCAN_STATES.SCANNING);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      }, false);

      scanner.render(handleScanSuccess, handleScanError);
      scannerRef.current = scanner;
    }, 300);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScannerStarted(false);
    setScanState(SCAN_STATES.IDLE);
  };

  const handleScanSuccess = async (decodedText) => {
    if (cooldown) return;
    setCooldown(true);

    try {
      const res = await qrAPI.scan({ token: decodedText, sesi_absensi_id: parseInt(selectedSesi) });
      const siswa = res.data.data;

      setScanResult(siswa);
      setScanState(SCAN_STATES.SUCCESS);
      setScanError('');
      toast.success(`✅ ${siswa.nama} — ${siswa.sesi === 'masuk' ? 'Masuk' : 'Pulang'}`);

      setRecentScans(prev => [{
        ...siswa,
        jam: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'hadir'
      }, ...prev.slice(0, 9)]);

    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memproses QR';
      setScanError(msg);
      setScanState(SCAN_STATES.ERROR);
      toast.error(msg);
    }

    // Reset after 3 seconds
    setTimeout(() => {
      setScanState(SCAN_STATES.SCANNING);
      setScanResult(null);
      setScanError('');
      setCooldown(false);
    }, 3000);

    setTimeout(() => setCooldown(false), 3000);
  };

  const handleScanError = () => {}; // Silent

  return (
    <>
      <Head><title>Scan QR Absensi — AbsensiQR</title></Head>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Scan QR Absensi</h1>
          <p className="text-slate-500 text-sm mt-1">Arahkan kamera ke QR code siswa untuk mencatat kehadiran</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Scanner panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sesi selector */}
            <div className="card p-4 space-y-3">
              <h3 className="font-semibold text-slate-700 text-sm">Pilih Sesi Absensi</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Kelas</label>
                  <select className="select" value={selectedKelas} onChange={e => { setSelectedKelas(e.target.value); setSelectedSesi(''); }}>
                    <option value="">-- Pilih Kelas --</option>
                    {kelasOptions.map(k => (
                      <option key={k.id} value={k.id}>{k.nama} ({k.tingkat})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Sesi</label>
                  <select className="select" value={selectedSesi} onChange={e => setSelectedSesi(e.target.value)} disabled={!selectedKelas}>
                    <option value="">-- Pilih Sesi --</option>
                    {sesiOptions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.sesi === 'masuk' ? '🏫 Masuk' : '🏠 Pulang'} — {s.jam_buka}–{s.jam_tutup}
                      </option>
                    ))}
                  </select>
                  {selectedKelas && sesiOptions.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ Tidak ada sesi aktif untuk kelas ini</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!scannerStarted ? (
                  <button onClick={startScanner} disabled={!selectedSesi} className="btn-success flex-1">
                    <Camera className="w-4 h-4" /> Mulai Kamera
                  </button>
                ) : (
                  <button onClick={stopScanner} className="btn-danger flex-1">
                    <XCircle className="w-4 h-4" /> Stop Kamera
                  </button>
                )}
              </div>
            </div>

            {/* Scanner area */}
            <div className="card overflow-hidden">
              <div className="relative bg-slate-900 min-h-[320px] flex items-center justify-center">
                {!scannerStarted && (
                  <div className="text-center p-8">
                    <div className="w-24 h-24 border-4 border-dashed border-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-12 h-12 text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm">Pilih sesi dan tekan "Mulai Kamera"<br/>untuk memindai QR code siswa</p>
                  </div>
                )}

                {/* Scan feedback overlay */}
                {scannerStarted && scanState === SCAN_STATES.SUCCESS && scanResult && (
                  <div className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center z-10 text-white p-6 text-center">
                    <CheckCircle className="w-16 h-16 mb-3 animate-bounce-in" />
                    <div className="text-2xl font-bold">{scanResult.nama}</div>
                    <div className="text-emerald-100 text-sm">{scanResult.kelas} · {scanResult.nis}</div>
                    <div className="mt-3 bg-white/20 rounded-xl px-4 py-2">
                      <span className="font-semibold">
                        {scanResult.sesi === 'masuk' ? '🏫 Absen Masuk' : '🏠 Absen Pulang'}
                      </span>
                      <span className="block text-xs text-emerald-100 mt-0.5">{new Date(scanResult.jam_absen).toLocaleTimeString('id-ID')}</span>
                    </div>
                  </div>
                )}

                {scannerStarted && scanState === SCAN_STATES.ERROR && (
                  <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center z-10 text-white p-6 text-center">
                    <XCircle className="w-16 h-16 mb-3" />
                    <div className="text-lg font-bold">QR Tidak Valid</div>
                    <div className="text-red-100 text-sm mt-1 max-w-xs">{scanError}</div>
                  </div>
                )}

                <div id="qr-reader" className={`w-full ${!scannerStarted ? 'hidden' : ''}`} />
              </div>
            </div>

            {/* Scanner indicator */}
            {scannerStarted && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 font-medium">Kamera aktif — arahkan ke QR code siswa</span>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stats */}
            <div className="card p-4">
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Sesi Ini</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Hadir', value: recentScans.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Scan', value: recentScans.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent scans */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700 text-sm">Riwayat Scan</h3>
                {recentScans.length > 0 && (
                  <button onClick={() => setRecentScans([])} className="text-xs text-slate-400 hover:text-slate-600">
                    Bersihkan
                  </button>
                )}
              </div>
              {recentScans.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <QrCode className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Belum ada scan</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentScans.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{s.nama}</div>
                        <div className="text-xs text-slate-400">{s.kelas} · {s.jam}</div>
                      </div>
                      <span className="badge-hadir text-xs">✓</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ScanQRPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
