import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}