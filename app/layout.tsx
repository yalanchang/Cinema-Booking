import type { Metadata } from 'next';
import './globals.css';
import Footer from './components/Footer';
import Header from './components/header';
import { AuthProvider } from './contexts/AuthContext';




export const metadata: Metadata = {
  title: '電影訂票系統',
  description: '輕鬆預訂您喜愛的電影',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <AuthProvider>
          <Header />

          {children}
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}