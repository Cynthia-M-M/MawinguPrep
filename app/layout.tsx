import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MawinguPrep – AZ-900 Exam Prep for African Developers',
  description:
    'An unofficial AI-powered Microsoft AZ-900 exam preparation tool built for African software developers. Practice with localized analogies and track your readiness.',
  keywords: ['AZ-900', 'Azure', 'exam prep', 'Africa', 'cloud computing', 'Microsoft certification'],
  openGraph: {
    title: 'MawinguPrep – AZ-900 Exam Prep',
    description: 'AI-powered Azure fundamentals prep with African context. Unofficial tool.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
