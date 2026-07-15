'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Home, Briefcase, Paintbrush, Building, Wrench, Sparkles, AlertCircle, Image } from 'lucide-react';
import { BACKEND_URL } from '@/utils/api';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          const enabledServices = data.filter((s: any) => s.isEnabled);
          setServices(enabledServices);
          if (enabledServices.length > 0) {
            setSelectedService(enabledServices[0]);
          }
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

  const getAdditionalImages = (service: any) => {
    if (!service || !service.imageUrlsJson) return [];
    try {
      return JSON.parse(service.imageUrlsJson);
    } catch (e) {
      return [];
    }
  };

  const renderServiceIcon = (name: string) => {
    switch (name) {
      case 'Home': return <Home className="h-6 w-6 text-secondary" />;
      case 'Briefcase': return <Briefcase className="h-6 w-6 text-secondary" />;
      case 'Building': return <Building className="h-6 w-6 text-secondary" />;
      case 'Wrench': return <Wrench className="h-6 w-6 text-secondary" />;
      case 'Sparkles': return <Sparkles className="h-6 w-6 text-secondary" />;
      default: return <Paintbrush className="h-6 w-6 text-secondary" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        {/* Banner */}
        <section className="bg-white border-b border-slate-200 py-16 px-6 text-center shadow-sm">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900">Our Professional Services</h1>
            <p className="text-slate-500">Premium home and commercial painting solutions tailored for Nalgonda and surroundings.</p>
          </div>
        </section>

        {/* Master Detail Section */}
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Master list (Left column - span 5) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase px-1">Select A Service</h3>
              <div className="space-y-3">
                {services.map((item) => {
                  const isSelected = selectedService?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedService(item)}
                      className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center justify-between group ${isSelected ? 'bg-white border-secondary shadow-md scale-101 ring-1 ring-secondary' : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${isSelected ? 'bg-secondary/5 text-secondary' : 'bg-slate-100 text-slate-500'}`}>
                          {renderServiceIcon(item.iconName)}
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-base text-slate-800">{item.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-[280px]">{item.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail elaboration view (Right column - span 7) */}
            <div className="lg:col-span-7">
              {selectedService ? (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-8 space-y-6">
                  {/* Main Image */}
                  <div className="relative h-80 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50">
                    <img
                      src={getImageUrl(selectedService.imageUrl)}
                      alt={selectedService.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-bold text-accent shadow-sm uppercase tracking-wider">
                      {selectedService.pricing || 'Free Quote'}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-4">
                    <h2 className="font-heading font-extrabold text-3xl text-slate-900">{selectedService.title}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{selectedService.content}</p>
                  </div>

                  {/* Additional Controlled Images */}
                  {getAdditionalImages(selectedService).length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center space-x-1.5">
                        <Image className="h-3.5 w-3.5" />
                        <span>Service Project Showcase</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {getAdditionalImages(selectedService).map((imgUrl: string, index: number) => (
                          <div key={index} className="h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group relative">
                            <img
                              src={getImageUrl(imgUrl)}
                              alt={`${selectedService.title} gallery ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Action */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Interested in this service?</span>
                    <a
                      href="/contact"
                      className="px-6 py-3 bg-secondary text-white font-bold rounded-lg shadow hover:bg-opacity-95 transition-transform"
                    >
                      Get A Free Quote
                    </a>
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 shadow-sm">
                  <AlertCircle className="h-10 w-10 text-slate-300" />
                  <p className="font-medium text-sm">Select a service from the left list to view details.</p>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
