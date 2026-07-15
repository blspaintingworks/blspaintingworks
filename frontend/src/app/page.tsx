'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Home, Paintbrush, Briefcase, ChevronDown, Check, Star, 
  MapPin, Calendar, User, ArrowRight, Clock, MessageSquare,
  Sparkles, CheckCircle2, ChevronRight, X, Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BACKEND_URL } from '@/utils/api';

function ReviewsWidget({ htmlCode }: { htmlCode: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !htmlCode) return;
    
    // Clear container
    containerRef.current.innerHTML = '';

    // Create a wrapper div to parse HTML string safely
    const parserDiv = document.createElement('div');
    parserDiv.className = 'w-full';
    parserDiv.innerHTML = htmlCode;

    // Separate script elements
    const scripts = Array.from(parserDiv.querySelectorAll('script'));
    scripts.forEach(script => {
      script.parentNode?.removeChild(script);
    });

    // Append standard HTML container layout first
    containerRef.current.appendChild(parserDiv);

    // Create and append scripts directly to active DOM to force execution
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

export default function PublicHomepage() {
  // Load data states
  const [hero, setHero] = useState<any>({
    headline: 'Professional Painting Works For Homes & Offices',
    subheading: 'Premium finishes, neat lines, and flawless surfaces that stand the test of time. Serving our community for over 20 years.',
    heroImageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=1200',
    ctaPrimaryText: 'Request A Free Quote',
    ctaPrimaryUrl: '#quote',
    ctaSecondaryText: 'Explore Projects',
    ctaSecondaryUrl: '#gallery',
    badges: ['20+ Years Experience', 'Licensed & Insured', 'Eco-friendly Paints']
  });

  const [about, setAbout] = useState<any>({
    title: 'Crafting Beautiful Spaces',
    story: 'At BLS Painting Works, painting is more than just applying color; it is an art of reviving properties. Over two decades, we have refined our processes to combine high-performance materials with immaculate attention to detail.',
    experienceYears: '20+',
    mission: 'To deliver superior painting solutions that protect and beautify our clients properties, exceeding their service expectations.',
    vision: 'To be the most trusted, innovative, and recommended painting service provider in the region.',
    values: ['Quality Craftsmanship', 'Customer Integrity', 'Eco-Friendly Practices', 'Timely Execution'],
    photoUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600'
  });

  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [googleReviews, setGoogleReviews] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [website, setWebsite] = useState<any>(null);
  const [popup, setPopup] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [sectionsOrder, setSectionsOrder] = useState<string[]>([
    'hero', 'about', 'gallery', 'services', 'testimonials', 'faq', 'contact'
  ]);

  const [loading, setLoading] = useState(true);

  // Lead form state
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    selectedServices: [] as string[]
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);

  // Accordion active FAQ index
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Before & After comparison state
  const [beforeAfterHover, setBeforeAfterHover] = useState(50); // percentage slider
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.getBoundingClientRect().width);
      }
    };
    // Defer slightly to ensure layout is ready
    const timer = setTimeout(handleResize, 200);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [projects]);

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setBeforeAfterHover(percentage);
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/public/homepage`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.pageContents && data.pageContents.length > 0) {
            const sorted = [...data.pageContents].sort((a, b) => a.orderIndex - b.orderIndex);
            const newOrder = sorted.filter(s => s.isEnabled).map(s => s.sectionName);
            if (newOrder.length > 0) setSectionsOrder(newOrder);

            const heroSec = data.pageContents.find((s: any) => s.sectionName === 'hero');
            if (heroSec) setHero(JSON.parse(heroSec.contentJson));

            const aboutSec = data.pageContents.find((s: any) => s.sectionName === 'about');
            if (aboutSec) setAbout(JSON.parse(aboutSec.contentJson));
          }

          if (data.services) setServices(data.services);
          if (data.projects) setProjects(data.projects);
          if (data.testimonials) setTestimonials(data.testimonials);
          if (data.googleReviews) setGoogleReviews(data.googleReviews);
          if (data.faqs) setFaqs(data.faqs);
          if (data.blogs) setBlogs(data.blogs);
          if (data.website) setWebsite(data.website);

          if (data.popups && data.popups.length > 0) {
            const active = data.popups.find((p: any) => p.isEnabled);
            if (active) {
              setPopup(active);
              setTimeout(() => {
                setShowPopup(true);
              }, 2000);
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load homepage data:', err))
      .finally(() => setLoading(false));
  }, []);

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
      'Texture Finishes': 'టెక్స్చర్ ఫినిషింగ్స్ (Texture Finishes)',
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

        // Generate Telugu translation and redirect to WhatsApp
        const teluguMsg = translateToTelugu(leadForm.name, leadForm.phone, leadForm.selectedServices, leadForm.message);
        const fatherPhone = '919505411273'; // Father's default WhatsApp contact
        const whatsappUrl = `https://wa.me/${fatherPhone}?text=${encodeURIComponent(teluguMsg)}`;
        
        // Open WhatsApp in a new tab so customer sends it directly
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

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      return `${BACKEND_URL}${url}`;
    }
    return url;
  };

  // Helper to map Lucide names dynamically
  const renderServiceIcon = (name: string) => {
    switch (name) {
      case 'Home': return <Home className="h-8 w-8 text-secondary" />;
      case 'Briefcase': return <Briefcase className="h-8 w-8 text-secondary" />;
      default: return <Paintbrush className="h-8 w-8 text-secondary" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-slate-200 border-t-secondary rounded-full animate-spin"></div>
          <Paintbrush className="h-6 w-6 text-accent animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-xl text-slate-800 animate-pulse">BLS Painting Works</h2>
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Premium Experience...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <main className="flex-grow pt-16 bg-white text-slate-900 paintbrush-hover">
        {sectionsOrder.map((sectionName) => {
          switch (sectionName) {
            case 'hero':
              return (
                <section key="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
                  {/* Subtle glowing highlights */}
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

                  <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-secondary/5 border border-secondary/10 rounded-full text-xs font-semibold text-secondary">
                        <Sparkles className="h-4 w-4 animate-spin-slow" />
                        <span>Master Craftsmen Painting Works</span>
                      </div>
                      
                      <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-slate-900 leading-tight">
                        {hero.headline}
                      </h1>
                      
                      <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
                        {hero.subheading}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <a
                          href={hero.ctaPrimaryUrl}
                          className="px-8 py-4 bg-secondary text-white font-bold rounded-xl shadow-lg shadow-secondary/15 hover:scale-105 transition-all duration-300"
                        >
                          {hero.ctaPrimaryText}
                        </a>
                        <a
                          href={hero.ctaSecondaryUrl}
                          className="px-8 py-4 bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-200 transition-all duration-300"
                        >
                          {hero.ctaSecondaryText}
                        </a>
                      </div>

                      {/* Trust Badges */}
                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                        {hero.badges && hero.badges.map((badge: string, idx: number) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                            <span className="text-sm font-semibold text-slate-700">{badge}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      {/* Image frame */}
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 shadow-xl bg-slate-50">
                        <img
                          src={getImageUrl(hero.heroImageUrl)}
                          alt="BLS Painting Hero"
                          className="w-full h-auto max-h-[500px] object-contain mx-auto hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -bottom-6 -left-6 bg-accent text-white px-6 py-4 rounded-xl shadow-xl font-bold flex items-center space-x-3">
                        <span className="text-3xl font-extrabold">20+</span>
                        <span className="text-xs uppercase tracking-wider leading-tight">Years of<br />Excellence</span>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'about':
              return (
                <section key="about" id="about" className="py-24 px-6 border-t border-slate-100 bg-white">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative">
                      <div className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-xl bg-slate-50">
                        <img
                          src={getImageUrl(about.photoUrl)}
                          alt="BLS Team/Owner"
                          className="w-full h-auto max-h-[500px] object-contain mx-auto"
                        />
                      </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-8">
                      <div className="space-y-4">
                        <span className="text-xs font-bold tracking-widest text-secondary uppercase">About Company</span>
                        <h2 className="font-heading font-bold text-3xl sm:text-5xl text-slate-900">{about.title}</h2>
                        <p className="text-slate-600 leading-relaxed">{about.story}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 glass rounded-xl space-y-2">
                          <h4 className="font-heading font-semibold text-slate-900">Our Mission</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{about.mission}</p>
                        </div>
                        <div className="p-5 glass rounded-xl space-y-2">
                          <h4 className="font-heading font-semibold text-slate-900">Core Values</h4>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {about.values && about.values.map((v: string, idx: number) => (
                              <li key={idx} className="flex items-center">
                                <Check className="h-3 w-3 mr-1 text-accent" />
                                {v}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'services':
              return (
                <section key="services" id="services" className="py-24 px-6 bg-slate-50 border-t border-slate-100">
                  <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                      <span className="text-xs font-bold tracking-widest text-secondary uppercase">What We Offer</span>
                      <h2 className="font-heading font-bold text-3xl sm:text-5xl text-slate-900">Exceptional Service Offerings</h2>
                      <p className="text-slate-600 text-sm">We provide tailored surface coating and painting solutions for various styles and budgets.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {services.length > 0 ? (
                        services.map((item) => (
                          <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-secondary/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                            <div className="relative h-48 overflow-hidden bg-slate-100">
                              <img
                                src={getImageUrl(item.imageUrl)}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute top-4 left-4 p-2.5 glass rounded-xl">
                                {renderServiceIcon(item.iconName)}
                              </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col justify-between">
                              <div className="space-y-3">
                                <h3 className="font-heading font-bold text-xl text-slate-900">{item.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                              </div>
                              <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
                                <span className="text-xs font-bold text-accent uppercase tracking-wider">{item.pricing}</span>
                                <a href="#quote" className="text-xs font-bold text-secondary hover:text-slate-900 flex items-center group-hover:translate-x-1 transition-transform">
                                  Learn More <ChevronRight className="h-4 w-4 ml-0.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-500 col-span-3">No services configured yet.</p>
                      )}
                    </div>
                  </div>
                </section>
              );

            case 'gallery':
              return (
                <section key="gallery" id="gallery" className="py-24 px-6 border-t border-slate-100 bg-white">
                  <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                      <span className="text-xs font-bold tracking-widest text-secondary uppercase">Our Portfolio</span>
                      <h2 className="font-heading font-bold text-3xl sm:text-5xl text-slate-900">Visual Proof of Quality</h2>
                      <p className="text-slate-600 text-sm">Slide to view actual before & after results, or browse through some of our featured projects.</p>
                    </div>

                    {/* Before & After Interactive Slider */}
                    {projects.length > 0 && projects[0].beforeImageUrl && projects[0].afterImageUrl && (
                      <div className="max-w-3xl mx-auto space-y-4">
                        <h3 className="text-center font-heading font-bold text-xl text-slate-900">Before & After Showcase</h3>
                        <div 
                          ref={sliderRef}
                          className="relative aspect-[4/3] md:aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 select-none cursor-ew-resize shadow-md bg-slate-100"
                          onMouseMove={(e) => handleSliderMove(e.clientX)}
                          onTouchMove={(e) => {
                            if (e.touches[0]) {
                              handleSliderMove(e.touches[0].clientX);
                            }
                          }}
                        >
                          {/* After image (base) */}
                          <img 
                            src={getImageUrl(projects[0].afterImageUrl)} 
                            alt="After Finish"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-white z-10">
                            AFTER
                          </div>

                          {/* Before image (overlay) */}
                          <div 
                            className="absolute inset-y-0 left-0 overflow-hidden z-10"
                            style={{ width: `${beforeAfterHover}%` }}
                          >
                            <img 
                              src={getImageUrl(projects[0].beforeImageUrl)} 
                              alt="Before Preparation"
                              className="absolute inset-y-0 left-0 h-full object-cover max-w-none"
                              style={{ width: `${sliderWidth}px` }}
                            />
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-white z-10">
                              BEFORE
                            </div>
                          </div>

                          {/* Splitter bar */}
                          <div 
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
                            style={{ left: `${beforeAfterHover}%` }}
                          >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-slate-800 rounded-full shadow-xl flex items-center justify-center font-bold text-sm">
                              ↔
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-xs text-slate-500">Move mouse or drag on touch screen to compare prep state vs. final look</p>
                      </div>
                    )}

                    {/* Project Albums List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {projects.map((proj) => (
                        <div key={proj.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden group shadow-sm">
                          <div className="relative h-64 overflow-hidden bg-slate-100">
                            <img
                              src={getImageUrl(proj.afterImageUrl || proj.beforeImageUrl)}
                              alt={proj.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold">
                              {proj.albumName}
                            </span>
                          </div>
                          <div className="p-5 space-y-3">
                            <h4 className="font-heading font-bold text-lg text-slate-900">{proj.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                              <div className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-accent" />
                                {proj.location}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1 text-accent" />
                                {proj.projectDate}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

              const combinedReviews = [
                ...testimonials.map((t: any) => ({
                  id: t.id,
                  name: t.customerName,
                  role: t.customerRole,
                  photoUrl: t.customerPhotoUrl,
                  content: t.content,
                  rating: t.rating,
                  isGoogle: false
                })),
                ...googleReviews.map((g: any) => ({
                  id: g.id,
                  name: g.reviewerName,
                  role: g.reviewDate || 'Google Reviewer',
                  photoUrl: g.reviewerPhotoUrl,
                  content: g.content,
                  rating: g.rating,
                  isGoogle: true
                }))
              ];

              return (
                <section key="testimonials" id="testimonials" className="py-24 px-6 bg-slate-50 border-t border-slate-100">
                  <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                      <span className="text-xs font-bold tracking-widest text-secondary uppercase">Testimonials</span>
                      <h2 className="font-heading font-bold text-3xl sm:text-5xl text-slate-900">Loved by Our Clients</h2>
                      <p className="text-slate-600 text-sm">We take pride in our service quality. Read actual client feedback.</p>
                    </div>

                    {website?.reviewsWidgetCode ? (
                      <ReviewsWidget htmlCode={website.reviewsWidgetCode} />
                    ) : (
                      <div className="flex flex-wrap justify-center gap-8">
                        {combinedReviews
                          .filter((r: any) => r.rating >= 4)
                          .map((r) => (
                            <div key={r.id} className="w-full max-w-[380px] bg-white border border-slate-200 p-8 rounded-2xl relative flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex space-x-1">
                                    {Array.from({ length: r.rating }).map((_, i) => (
                                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                                    ))}
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => speakText(r.content)}
                                      className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-secondary/10 hover:border-secondary/20 hover:text-secondary rounded-lg text-slate-400 transition-all flex items-center space-x-1"
                                      title="Read Aloud (వినిపించు)"
                                    >
                                      <Volume2 className="h-4 w-4" />
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-secondary">Listen</span>
                                    </button>
                                    {r.isGoogle && (
                                      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" title="Google Review">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-700 italic leading-relaxed text-sm">"{r.content}"</p>
                              </div>

                              <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
                                {r.photoUrl ? (
                                  <img src={r.isGoogle ? r.photoUrl : getImageUrl(r.photoUrl)} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg">
                                    {r.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">{r.name}</h4>
                                  <p className="text-xs text-slate-500">{r.role}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </section>
              );

            case 'faq':
              return (
                <section key="faq" id="faq" className="py-24 px-6 border-t border-slate-100 bg-white">
                  <div className="max-w-3xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                      <span className="text-xs font-bold tracking-widest text-secondary uppercase">Questions</span>
                      <h2 className="font-heading font-bold text-3xl sm:text-5xl text-slate-900">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-4">
                      {faqs.map((faq, index) => {
                        const isOpen = activeFaq === index;
                        return (
                          <div key={faq.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 shadow-sm">
                            <button
                              onClick={() => setActiveFaq(isOpen ? null : index)}
                              className="w-full p-6 text-left flex items-center justify-between font-heading font-semibold text-slate-900 hover:text-secondary transition-colors"
                            >
                              <span>{faq.question}</span>
                              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-secondary' : ''}`} />
                            </button>
                            {isOpen && (
                              <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-slideDown">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );



            case 'contact':
              return (
                <section key="contact" id="contact" className="py-24 px-6 border-t border-slate-100 bg-[#f8fafc] relative">
                  <div id="quote" className="absolute -top-20" />
                  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <span className="text-xs font-bold tracking-widest text-secondary uppercase">Quick Quote</span>
                        <h2 className="font-heading font-bold text-3xl sm:text-5xl text-slate-900">Let's Discuss Your Project</h2>
                        <p className="text-slate-600 leading-relaxed text-sm">
                          Submit your details and service requirements. Our team will prepare a customized proposal and reach out to schedule a consultation within 24 hours.
                        </p>
                      </div>

                      {/* Selectable Services checkboxes */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase">Select Services Needed</label>
                        <div className="flex flex-wrap gap-3">
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
                    </div>

                    <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl">
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
                          <div className="grid grid-cols-2 gap-4">
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
                                placeholder="(555) 000-0000"
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
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>

      <Footer />

      {/* Promotional Modal Popup */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white max-w-md w-full p-8 rounded-2xl shadow-2xl border border-slate-200 text-center space-y-6">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent mb-2">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>

            <h3 className="font-heading font-bold text-2xl text-slate-900">{popup.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{popup.content}</p>

            {popup.ctaText && (
              <a
                href={popup.ctaUrl}
                onClick={() => setShowPopup(false)}
                className="block w-full py-3 bg-accent hover:bg-opacity-95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
              >
                {popup.ctaText}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
