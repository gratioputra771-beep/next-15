// pages/index.js - redirect ke dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

export default function IndexPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isAuthenticated, isLoading, router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh">
      <div className="spinner" />
    </div>
  );
}
