import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardList,
  QrCode, BarChart3, Settings, LogOut, Menu, X, Bell, ChevronDown,
  ScanLine, Monitor, School, ChevronRight
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  {
    label: 'Absensi', icon: ClipboardList,
    children: [
      { href: '/absensi/sesi',         icon: ScanLine,       label: 'Kelola Sesi' },
      { href: '/absensi/scan',         icon: QrCode,         label: 'Scan QR' },
      { href: '/absensi/tampilkan-qr', icon: Monitor,        label: 'Tampilkan QR' },
      { href: '/absensi/manual',       icon: ClipboardList,  label: 'Input Manual' },
    ]
  },
  { href: '/siswa',      icon: Users,         label: 'Data Siswa' },
  { href: '/kelas',      icon: BookOpen,      label: 'Data Kelas' },
  { href: '/guru',       icon: GraduationCap, label: 'Data Guru', adminOnly: true },
  { href: '/laporan',    icon: BarChart3,     label: 'Laporan' },
  { href: '/pengaturan', icon: Settings,      label: 'Pengaturan' },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({ Absensi: true });

  useEffect(() => { setSidebarOpen(false); }, [router.pathname]);

  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');
  const isGroupActive = (children) => children?.some(c => isActive(c.href));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #10d98a, #0ea572)', boxShadow: '0 0 16px rgba(16,217,138,0.25)' }}>
          <School className="w-4 h-4 text-slate-900" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">AbsensiQR</div>
          <div className="text-[10px] text-slate-500">Sistem Absensi Digital</div>
        </div>
      </div>

      {/* Divider */}
      <div className="divider mx-3 mb-3" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4 no-scrollbar">
        {NAV.map((item, i) => {
          if (item.adminOnly && !['admin','kepala_sekolah'].includes(user?.jabatan)) return null;

          if (item.children) {
            const isOpen = openGroups[item.label];
            const groupActive = isGroupActive(item.children);
            return (
              <div key={i}>
                <button onClick={() => setOpenGroups(p => ({...p, [item.label]: !p[item.label]}))}
                  className={`nav-link w-full justify-between ${groupActive ? 'text-slate-200' : ''}`}>
                  <span className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="mt-0.5 ml-4 pl-3 border-l border-white/[0.06] space-y-0.5">
                    {item.children.map(child => (
                      <Link key={child.href} href={child.href}>
                        <span className={`nav-link text-xs py-2 ${isActive(child.href) ? 'active' : ''}`}>
                          <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                          {child.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link key={i} href={item.href}>
              <span className={`nav-link ${isActive(item.href) ? 'active' : ''}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 divider">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-slate-900"
            style={{ background: 'linear-gradient(135deg, #10d98a, #3b82f6)' }}>
            {user?.nama?.[0] || 'G'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.nama}</div>
            <div className="text-[10px] text-slate-500 capitalize">{user?.jabatan?.replace('_',' ')}</div>
          </div>
          <button onClick={logout} className="btn-icon w-7 h-7 text-slate-600 hover:text-rose-400" title="Keluar">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 xl:w-60 flex-shrink-0 flex-col"
        style={{ background: '#0d1520', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 flex flex-col shadow-2xl"
            style={{ background: '#0d1520', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 btn-icon">
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 flex-shrink-0"
          style={{ background: '#0d1520', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden btn-icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block text-xs text-slate-600 font-mono">
              {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-icon relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => router.push('/pengaturan')}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900"
                style={{ background: 'linear-gradient(135deg, #10d98a, #3b82f6)' }}>
                {user?.nama?.[0]}
              </div>
              <span className="text-xs font-medium text-slate-400 max-w-[100px] truncate">{user?.nama}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
