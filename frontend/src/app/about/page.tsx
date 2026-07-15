'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { BACKEND_URL } from '@/utils/api';

export default function AboutPage() {
  const [about, setAbout] = useState<any>({
    title: 'Crafting Beautiful Spaces',
    story: 'At BLS Painting Works, painting is more than just applying color; it is an art of reviving properties. Over two decades, our crew has refined our processes to combine high-performance materials with immaculate attention to detail, serving our local town and surroundings.',
    experienceYears: '20+',
    mission: 'To deliver superior painting solutions that protect and beautify our clients properties, exceeding their service expectations.',
    vision: 'To be the most trusted, innovative, and recommended painting service provider in the region.',
    values: ['Quality Craftsmanship', 'Customer Integrity', 'Eco-Friendly Practices', 'Timely Execution'],
    photoUrl: '/uploads/general/BLS teamowner.png'
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/page-content`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          const aboutSec = data.find((s: any) => s.sectionName === 'about');
          if (aboutSec) setAbout(JSON.parse(aboutSec.contentJson));
        }
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
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900">About BLS Painting Works</h1>
            <p className="text-slate-600">Dedicated craftsmanship and premium coatings built to stand the test of time.</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 shadow-xl bg-slate-50">
            <img
              src={getImageUrl(about.photoUrl)}
              alt="BLS Team/Owner"
              className="w-full h-auto max-h-[500px] object-contain mx-auto"
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-widest text-secondary uppercase">Our Story</span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">{about.title}</h2>
              <p className="text-slate-600 leading-relaxed">{about.story}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-slate-800 text-lg">Our Mission</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{about.mission}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-slate-800 text-lg">Our Vision</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{about.vision}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
