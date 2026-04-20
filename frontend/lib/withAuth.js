import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

/**
 * Higher-Order Component untuk proteksi halaman yang butuh login.
 * Gunakan: export default withAuth(MyPage)
 */
export function withAuth(Component) {
  function ProtectedPage(props) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-mesh">
          <div className="text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Memuat...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) return null;

    return <Component {...props} />;
  }

  ProtectedPage.getLayout = Component.getLayout;
  ProtectedPage.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return ProtectedPage;
}

/**
 * HOC untuk halaman yang hanya bisa diakses admin.
 */
export function withAdmin(Component) {
  function AdminPage(props) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) router.replace('/login');
        else if (user && !['admin', 'kepala_sekolah'].includes(user.jabatan)) {
          router.replace('/dashboard');
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading || !isAuthenticated) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );

    return <Component {...props} />;
  }

  AdminPage.getLayout = Component.getLayout;
  return AdminPage;
}
