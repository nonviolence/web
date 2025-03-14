import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from './contexts/AuthContext';

export const metadata: Metadata = {
  title: '罗德岛终端',
  description: '与罗德岛干员对话的终端',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
