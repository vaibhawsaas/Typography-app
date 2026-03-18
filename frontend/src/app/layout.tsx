import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TypeMotion AI - Create Stunning Typography Videos',
  description: 'AI SaaS platform to generate animated typography videos from a simple script prompt.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground bg-black min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
