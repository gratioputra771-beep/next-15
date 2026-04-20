// Tambahkan item ini ke navItems di DashboardLayout.js
// Di dalam group "Absensi", tambahkan:
// { href: '/absensi/tampilkan-qr', icon: Monitor, label: 'Tampilkan QR' }

// navItems final yang lengkap:
const navItemsLengkap = [
  { href: '/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
  {
    label: 'Absensi',
    icon: 'ClipboardList',
    children: [
      { href: '/absensi/sesi',          icon: 'ScanLine',  label: 'Kelola Sesi' },
      { href: '/absensi/scan',          icon: 'QrCode',    label: 'Scan QR' },
      { href: '/absensi/tampilkan-qr',  icon: 'Monitor',   label: 'Tampilkan QR' },
      { href: '/absensi/manual',        icon: 'ClipboardList', label: 'Input Manual' },
    ]
  },
  { href: '/siswa',       icon: 'Users',         label: 'Data Siswa' },
  { href: '/kelas',       icon: 'BookOpen',      label: 'Data Kelas' },
  { href: '/guru',        icon: 'GraduationCap', label: 'Data Guru',   adminOnly: true },
  { href: '/laporan',     icon: 'BarChart3',     label: 'Laporan' },
  { href: '/pengaturan',  icon: 'Settings',      label: 'Pengaturan' },
];
