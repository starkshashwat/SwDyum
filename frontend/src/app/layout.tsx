import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategories, getActiveAnnouncements } from '@/actions/content';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Swadyum - Premium Taste',
  description: 'Swadyum Premium E-commerce',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch headless dynamic data for the global layout directly from PostgreSQL
  const categories = await getCategories();
  const announcements = await getActiveAnnouncements();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {announcements.length > 0 && (
          <div className="w-full bg-amber-600 text-white text-center py-2 text-sm font-medium">
            {announcements[0].message}
          </div>
        )}
        <Header categories={categories} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
