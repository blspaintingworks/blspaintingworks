'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BACKEND_URL } from '@/utils/api';
import { Star, Volume2 } from 'lucide-react';

function ReviewsWidget({ htmlCode }: { htmlCode: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !htmlCode) return;
    containerRef.current.innerHTML = '';
    const parserDiv = document.createElement('div');
    parserDiv.className = 'w-full';
    parserDiv.innerHTML = htmlCode;

    const scripts = Array.from(parserDiv.querySelectorAll('script'));
    scripts.forEach(script => {
      script.parentNode?.removeChild(script);
    });

    containerRef.current.appendChild(parserDiv);

    scripts.forEach(script => {
      const newScript = document.createElement('script');
      Array.from(script.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = script.textContent;
      containerRef.current?.appendChild(newScript);
    });
  }, [htmlCode]);

  return <div ref={containerRef} className="w-full flex justify-center min-h-[150px] transition-all" />;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [website, setWebsite] = useState<any>(null);

  useEffect(() => {
    // Fetch testimonials
    fetch(`${BACKEND_URL}/api/testimonials`)
      .then(res => res.json())
      .then(data => {
        if (data) setTestimonials(data.filter((t: any) => t.isApproved));
      })
      .catch(() => {});

    // Fetch website settings for the Elfsight review widget code
    fetch(`${BACKEND_URL}/api/settings/website`)
      .then(res => res.json())
      .then(data => {
        if (data) setWebsite(data);
      })
      .catch(() => {});
  }, []);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const isTelugu = /[\u0c00-\u0c7f]/.test(text);
      if (isTelugu) {
        utterance.lang = 'te-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Your browser does not support read-aloud voice output.');
    }
  };

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
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900">Client Reviews</h1>
            <p className="text-slate-600">See what our home and office clients in town and surroundings say about us.</p>
          </div>
        </section>

        {/* Testimonials List */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          {website?.reviewsWidgetCode ? (
            <ReviewsWidget htmlCode={website.reviewsWidgetCode} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.length > 0 ? (
                testimonials.map((t) => (
                  <div key={t.id} className="bg-white border border-slate-200 p-8 rounded-2xl relative flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="space-y-4">
                      {/* Stars & Speak button */}
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-1">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                          ))}
                        </div>
                        <button
                          onClick={() => speakText(t.content)}
                          className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-secondary/10 hover:border-secondary/20 hover:text-secondary rounded-lg text-slate-400 transition-all flex items-center space-x-1"
                          title="Read Aloud (వినిపించు)"
                        >
                          <Volume2 className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-secondary">Listen</span>
                        </button>
                      </div>
                      <p className="text-slate-700 italic leading-relaxed text-sm">"{t.content}"</p>
                    </div>

                    <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
                      {t.customerPhotoUrl ? (
                        <img src={getImageUrl(t.customerPhotoUrl)} alt={t.customerName} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg">
                          {t.customerName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{t.customerName}</h4>
                        <p className="text-slate-400 text-xs">{t.customerRole}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 col-span-3">No reviews loaded yet.</p>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
