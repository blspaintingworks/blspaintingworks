'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (data) setBlogs(data.filter((b: any) => b.status === 'PUBLISHED'));
      })
      .catch(() => {});
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        {/* Banner */}
        <section className="bg-slate-50 border-y border-slate-100 py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900">Painting Blog</h1>
            <p className="text-slate-600">Expert tips, insights, and paint selection advice from professional contractors.</p>
          </div>
        </section>

        {/* Blogs List */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.length > 0 ? (
              blogs.map((b) => (
                <div key={b.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(b.featuredImageUrl)}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-accent uppercase tracking-wider">{b.category}</span>
                      <h3 className="font-heading font-bold text-lg text-slate-900 leading-snug">
                        {b.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{b.summary}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <span className="text-xs text-slate-500">
                        {new Date(b.publishedAt || b.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-bold text-secondary">
                        Read Article →
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 col-span-3">No blog posts published yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
