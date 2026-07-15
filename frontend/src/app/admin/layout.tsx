import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BLS CMS Admin Panel',
  description: 'Manage website content, leads, services, and search engine optimization settings.',
  robots: 'noindex, nofollow'
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans">
      {children}
    </div>
  );
}
