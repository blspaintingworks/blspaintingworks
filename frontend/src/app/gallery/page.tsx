'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { BACKEND_URL } from '@/utils/api';

export default function GalleryPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (data) setProjects(data);
      })
      .catch(() => {});
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      return `${BACKEND_URL}${url}`;
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
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900">Project Gallery</h1>
            <p className="text-slate-600">Browse our recently completed premium painting and coating masterpieces.</p>
          </div>
        </section>

        {/* Gallery grid */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <div key={proj.id} className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(proj.afterImageUrl)}
                      alt={proj.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-2">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-full">{proj.albumName}</span>
                    <h3 className="font-heading font-bold text-xl text-slate-900 pt-1">{proj.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{proj.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 col-span-3">No projects configured in gallery yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
