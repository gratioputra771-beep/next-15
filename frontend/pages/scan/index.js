import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { CheckCircle, XCircle, QrCode, School } from 'lucide-react';
import { qrAPI, sesiAPI } from '../../lib/api';

/**
 * Halaman PUBLIK untuk scan QR oleh siswa (tidak perlu login).
 * URL: /scan/[kelasId] atau /scan/public
 *
 * Cara penggunaan:
 * - Guru menampilkan link/QR ke halaman ini di papan tulis
 * - Siswa buka di HP masing-masing → kamera aktif → scan QR mereka
 */
export default function PublicScanPage() {
  const [sesiAktif, setSesiAktif] = useState([]);
  const [selectedSesi, setSelectedSesi] = useState('');
  const [scanState, setScanState] = useState('idle'); // idle | scanning | success | error
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const [scannerRef, setScannerRef] = useState(null);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    loadSesi();
    return () => stopScanner();
  }, []);

  const loadSesi = async () => {
    try {
      const res = await sesiAPI.getAktif({});
      setSesiAktif(res.data.data);
      if (res.data.data.length === 1) setSelectedSesi(String(res.data.data[0].id));
    } catch {}
  };

  const startScanner = () => {
    if (!selectedSesi) return;
    setScanState('scanning');

    const scanner = new Html5QrcodeScanner('public-qr-reader', {
      fps: 10,
      qrbox: { width: 280, height: 280 },
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    }, false);

    scanner.render(handleSuccess, () => {});
    setScannerRef(scanner);
  };

  const stopScanner = () => {
    if (scannerRef) {
      try { scannerRef.clear(); } catch {}
      setScannerRef(null);
    }
    setScanState('idle');
  };

  const handleSuccess = async (text) => {
    if (cooldown) return;
    setCooldown(true);

    try {
      const res = await qrAPI.scan({ token: text, sesi_absensi_id: parseInt(selectedSesi) });
      setResult(res.data.data);
      setScanState('success');
      setErrMsg('');

      // Auto reset setelah 4 detik
      setTimeout(() => {
        setScanState('scanning');
        setResult(null);
        setCooldown(false);
      }, 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'QR tidak valid';
      setErrMsg(msg);
      setScanState('error');

      setTimeout(() => {
        setScanState('scanning');
        setErrMsg('');
        setCooldown(false);
      }, 3000);
    }
  };

  return (
    <>
      <Head>
        <title>Scan Absensi — AbsensiQR</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex flex-col items-center justify-start p-4 pb-10">
        {/* Header */}
        <div className="w-full max-w-sm mt-6 mb-6 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
            <School className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Scan Absensi</h1>
          <p className="text-blue-200 text-sm mt-1">Arahkan kamera ke QR code Anda</p>
        </div>

        {/* Sesi selector */}
        {sesiAktif.length > 1 && (
          <div className="w-full max-w-sm mb-4">
            <select
              className="w-full px-4 py-3 rounded-2xl border-0 bg-white/10 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm font-medium"
              value={selectedSesi}
              onChange={e => setSelectedSesi(e.target.value)}
            >
              <option value="" className="text-slate-800">-- Pilih Sesi --</option>
              {sesiAktif.map(s => (
                <option key={s.id} value={s.id} className="text-slate-800">
                  {s.nama_kelas} — {s.sesi === 'masuk' ? 'Masuk' : 'Pulang'} ({s.jam_buka}–{s.jam_tutup})
                </option>
              ))}
            </select>
          </div>
        )}

        {sesiAktif.length === 0 && (
          <div className="w-full max-w-sm bg-white/10 rounded-2xl p-6 text-center border border-white/20 mb-4">
            <p className="text-white font-semibold">Tidak ada sesi absensi aktif saat ini</p>
            <p className="text-blue-200 text-sm mt-1">Hubungi guru untuk membuka sesi absensi</p>
          </div>
        )}

        {/* Scanner area */}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            {/* Scanner atau status */}
            <div className="relative min-h-[340px] bg-slate-900 flex items-center justify-center">
              {scanState === 'idle' && (
                <div className="text-center p-8">
                  <div className="w-28 h-28 border-4 border-dashed border-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <QrCode className="w-14 h-14 text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-sm">Tekan tombol di bawah untuk<br/>mengaktifkan kamera</p>
                </div>
              )}

              {(scanState === 'scanning' || scanState === 'success' || scanState === 'error') && (
                <div id="public-qr-reader" className="w-full" />
              )}

              {/* Success overlay */}
              {scanState === 'success' && result && (
                <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white p-6 text-center z-10">
                  <CheckCircle className="w-20 h-20 mb-4 animate-bounce-in" />
                  <div className="text-2xl font-bold mb-1">{result.nama}</div>
                  <div className="text-emerald-100 text-sm mb-3">{result.kelas}</div>
                  <div className="bg-white/20 rounded-2xl px-5 py-3">
                    <div className="font-bold text-lg">
                      {result.sesi === 'masuk' ? '🏫 Absen Masuk' : '🏠 Absen Pulang'}
                    </div>
                    <div className="text-emerald-100 text-sm mt-1">
                      {new Date(result.jam_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-emerald-100 text-xs mt-4">✅ Kehadiran berhasil dicatat</div>
                </div>
              )}

              {/* Error overlay */}
              {scanState === 'error' && (
                <div className="absolute inset-0 bg-red-500 flex flex-col items-center justify-center text-white p-6 text-center z-10">
                  <XCircle className="w-20 h-20 mb-4" />
                  <div className="text-xl font-bold mb-2">Gagal</div>
                  <div className="text-red-100 text-sm max-w-xs leading-relaxed">{errMsg}</div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-5 space-y-3">
              {scanState === 'idle' ? (
                <button
                  onClick={startScanner}
                  disabled={!selectedSesi && sesiAktif.length > 0}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-base disabled:opacity-50"
                >
                  <QrCode className="w-5 h-5" /> Aktifkan Kamera
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all active:scale-95"
                >
                  Stop Kamera
                </button>
              )}

              {scanState === 'scanning' && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Kamera aktif — scan QR Anda
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mt-5 text-center text-blue-200 text-xs space-y-1">
            <p>QR code Anda bersifat unik dan berubah setiap sesi</p>
            <p>Jangan bagikan QR Anda ke teman</p>
          </div>
        </div>
      </div>
    </>
  );
}
