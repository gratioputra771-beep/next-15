import { Html, Head, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0a0f1e" />
        <meta name="description" content="Sistem Absensi Digital Berbasis QR Code" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
