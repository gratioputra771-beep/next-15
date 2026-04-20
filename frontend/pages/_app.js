import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => { init(); }, [init]);

  const getLayout = Component.getLayout || ((page) => page);
  return (
    <>
      {getLayout(<Component {...pageProps} />)}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </>
  );
}
