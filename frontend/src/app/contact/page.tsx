'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BACKEND_URL } from '@/utils/api';

export default function ContactPage() {
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    selectedServices: [] as string[]
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);

  const translateToTelugu = (name: string, phone: string, services: string[], englishMsg: string) => {
    const serviceTranslationMap: Record<string, string> = {
      'Interior Painting': 'ఇంటీరియర్ పెయింటింగ్ (Interior Painting)',
      'Exterior Painting': 'ఎక్స్‌టీరియర్ పెయింటింగ్ (Exterior Painting)',
      'Commercial Painting': 'కమర్షియల్ పెయింటింగ్ (Commercial Painting)',
      'Color Consultation': 'రంగుల ఎంపిక సహాయం (Color Consultation)',
      'Deck & Fence Coating': 'డెక్ మరియు ఫెన్స్ కోటింగ్ (Deck & Fence Coating)',
      'Residential Painting': 'ఇంటి పెయింటింగ్ (Residential Painting)',
      'Apartment Painting': 'అపార్ట్‌మెంట్ పెయింటింగ్ (Apartment Painting)',
      'Villa Painting': 'విల్లా పెయింటింగ్ (Villa Painting)',
      'Wall Putty': 'గోడ పుట్టి పని (Wall Putty)',
      'Crack Repair': 'గోడ పగుళ్ల మరమ్మత్తు (Crack Repair)',
      'Texture Finishes': 'టెక్స్チャー ఫినిషింగ్స్ (Texture Finishes)',
      'Repainting': 'రి-పెయింటింగ్ (Repainting)',
      'Metal Painting': 'మెటల్ పెయింటింగ్ (Metal Painting)',
      'Spray Wood Polishing': 'వుడ్ పాలిషింగ్ (Spray Wood Polishing)'
    };

    const teluguServices = services.map(s => serviceTranslationMap[s] || s).join(', ');
    let translatedMsg = englishMsg || 'సందేశం లేదు (No details)';

    const dictionary: Record<string, string> = {
      'home': 'ఇల్లు (home)',
      'house': 'ఇల్లు (house)',
      'room': 'గది (room)',
      'rooms': 'గదులు (rooms)',
      'wall': 'గోడ (wall)',
      'walls': 'గోడలు (walls)',
      'painting': 'పెయింటింగ్ (painting)',
      'paint': 'రంగు (paint)',
      'leakage': 'లీకేజీ (leakage)',
      'leak': 'లీక్ (leak)',
      'repair': 'మరమ్మత్తు (repair)',
      'cost': 'ఖర్చు (cost)',
      'price': 'ధర (price)',
      'budget': 'బడ్జెట్ (budget)',
      'water': 'నీరు (water)',
      'dampness': 'తేమ (dampness)',
      'wood': 'చెక్క (wood)',
      'door': 'తలుపు (door)',
      'window': 'కిటికీ (window)',
      'kitchen': 'వంటగది (kitchen)',
      'hall': 'హాలు (hall)',
      'bedroom': 'బెడ్‌రూమ్ (bedroom)'
    };

    Object.keys(dictionary).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      translatedMsg = translatedMsg.replace(regex, dictionary[key]);
    });

    return `*నమస్తే అండి.*\n\n` +
           `👤 *పేరు (Name):* ${name}\n` +
           `📞 *ఫోన్ నెంబర్ (Phone):* ${phone}\n` +
           `🎨 *కావలసిన పనులు (Services Needed):* ${teluguServices}\n` +
           `📝 *సందేశం/వివరాలు (Message):* ${translatedMsg}`;
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;

    setSubmittingLead(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/quote-requests/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          email: leadForm.email || 'no-email@blspainting.com',
          phone: leadForm.phone,
          services: leadForm.selectedServices,
          message: leadForm.message
        })
      });

      if (res.ok) {
        setLeadSubmitted(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        // Translate to Telugu and redirect to WhatsApp
        const teluguMsg = translateToTelugu(leadForm.name, leadForm.phone, leadForm.selectedServices, leadForm.message);
        const fatherPhone = '919505411273';
        const whatsappUrl = `https://wa.me/${fatherPhone}?text=${encodeURIComponent(teluguMsg)}`;
        window.open(whatsappUrl, '_blank');

        setLeadForm({ name: '', email: '', phone: '', message: '', selectedServices: [] });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingLead(false);
    }
  };

  const toggleServiceSelection = (title: string) => {
    if (leadForm.selectedServices.includes(title)) {
      setLeadForm({
        ...leadForm,
        selectedServices: leadForm.selectedServices.filter(s => s !== title)
      });
    } else {
      setLeadForm({
        ...leadForm,
        selectedServices: [...leadForm.selectedServices, title]
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        {/* Banner */}
        <section className="bg-slate-50 border-y border-slate-100 py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900">Contact Us & Get a Quote</h1>
            <p className="text-slate-600">Send us your project details, and we will prepare a customized cost estimate.</p>
          </div>
        </section>

        {/* Form Container */}
        <section className="py-16 px-6 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl space-y-8">
            <div className="space-y-4 text-center">
              <h2 className="font-heading font-bold text-2xl text-slate-900">Let's Discuss Your Project</h2>
              <p className="text-slate-500 text-sm">Select the services needed and input your contact details below.</p>
            </div>

            {/* Selectable Services checkboxes */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase text-center">Select Services Needed</label>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Interior Painting', 'Exterior Painting', 'Commercial Painting', 'Color Consultation', 'Deck & Fence Coating'].map((srv) => {
                  const isSelected = leadForm.selectedServices.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => toggleServiceSelection(srv)}
                      className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${isSelected ? 'bg-secondary border-secondary text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {srv}
                    </button>
                  );
                })}
              </div>
            </div>

            {leadSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-slate-900">Proposal Request Sent!</h3>
                <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. We have logged your request and our project manager will contact you shortly.
                </p>
                <button
                  onClick={() => setLeadSubmitted(false)}
                  className="mt-6 px-6 py-2.5 bg-secondary text-white font-bold text-xs rounded-lg shadow hover:bg-opacity-95"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Project Details / Message</label>
                  <textarea
                    rows={4}
                    value={leadForm.message}
                    onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary resize-none"
                    placeholder="Describe surface condition, room dimensions, color selections, etc..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLead}
                  className="w-full py-4 bg-secondary disabled:bg-secondary/50 text-white font-bold rounded-xl shadow-lg shadow-secondary/15 flex items-center justify-center space-x-2 hover:scale-102 transition-transform"
                >
                  <span>{submittingLead ? 'Submitting...' : 'Request Free Consultation'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
