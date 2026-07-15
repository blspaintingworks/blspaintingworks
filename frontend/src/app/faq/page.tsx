'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronDown } from 'lucide-react';
import { BACKEND_URL } from '@/utils/api';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/faqs`)
      .then(res => res.json())
      .then(data => {
        if (data) setFaqs(data.filter((f: any) => f.isEnabled));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        {/* Banner */}
        <section className="bg-slate-50 border-y border-slate-100 py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900">Frequently Asked Questions</h1>
            <p className="text-slate-600">Find quick answers about our processes, timelines, materials, and quotation estimates.</p>
          </div>
        </section>

        {/* Accordions */}
        <section className="py-16 px-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.length > 0 ? (
              faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-50/50"
                    >
                      <span className="font-heading font-bold text-slate-800 text-sm sm:text-base">{faq.question}</span>
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-secondary' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/30">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-500">No questions loaded yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
