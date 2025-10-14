import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import './globals.css';
import Footer from './components/Footer';
import Header from './components/header';
import SessionProvider from './components/SessionProvider';


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="zh-TW">
      <body>
      <SessionProvider session={session}>
      <Header />

          {children}
          </SessionProvider>
          <Footer />
      </body>
    </html>
  );
}