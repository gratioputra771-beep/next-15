import Link from 'next/link';
import Head from 'next/head';
export default function NotFound() {
  return (
    <>
      <Head><title>404 — AbsensiQR</title></Head>
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background:'#0a0f1e' }}>
        <div className="text-center">
          <div className="text-8xl font-black mb-2 select-none" style={{ color:'rgba(16,217,138,0.1)' }}>404</div>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 -mt-10"
            style={{ background:'rgba(16,217,138,0.08)', border:'1px solid rgba(16,217,138,0.15)' }}>
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h1>
          <p className="text-slate-500 mb-6 text-sm">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
          <Link href="/dashboard">
            <button className="btn-primary">← Kembali ke Dashboard</button>
          </Link>
        </div>
      </div>
    </>
  );
}
