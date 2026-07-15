'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BACKEND_URL } from '@/utils/api';
import { Paintbrush, Menu, X, Phone, ShieldCheck } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<any>({
    businessName: 'BLS Painting Works',
    phone: '+91 9505411273'
  });
  const [theme, setTheme] = useState<any>({ logoUrl: '' });

  // Skip showing public header on admin pages
  if (pathname?.startsWith('/admin')) return null;

  useEffect(() => {
    // Fetch settings for business name
    fetch(`${BACKEND_URL}/api/settings/website`)
      .then(res => res.json())
      .then(data => {
        if (data && data.businessName) setSettings(data);
      })
      .catch(() => {});

    // Fetch theme logo
    fetch(`${BACKEND_URL}/api/settings/theme`)
      .then(res => res.json())
      .then(data => {
        if (data && data.logoUrl) setTheme(data);
      })
      .catch(() => {});

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Gallery', href: '/#gallery' },
    { name: 'Services', href: '/#services' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'FAQ', href: '/#faq' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3 shadow-md' : 'bg-white/60 backdrop-blur-sm border-b border-slate-100 py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 font-heading font-bold text-2xl text-slate-900">
          {theme.logoUrl ? (
            <img src={`http://localhost:5000${theme.logoUrl}`} alt={settings.businessName} className="h-10 object-contain max-w-[180px]" />
          ) : (
            <>
              <div className="p-2 bg-gradient-to-tr from-secondary to-accent rounded-lg shadow-sm">
                <Paintbrush className="h-6 w-6 text-white animate-pulse" />
              </div>
              <span>{settings.businessName}</span>
            </>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-8 font-semibold text-sm text-slate-600">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="nav-link text-slate-600 hover:text-secondary transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Phone className="h-4 w-4 mr-1 text-accent" />
            {settings.phone}
          </a>
          <a
            href="#quote"
            className="px-5 py-2 bg-secondary text-white text-sm font-semibold rounded-lg shadow-md hover:bg-opacity-95 hover:scale-105 transition-all duration-200"
          >
            Get Free Quote
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {isOpen && (
        <div className="md:hidden glass absolute top-full left-0 w-full p-6 shadow-xl border-t border-slate-100 flex flex-col space-y-4 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-slate-700 hover:text-secondary text-base font-semibold transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-4">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center text-sm font-semibold text-slate-700"
            >
              <Phone className="h-4 w-4 mr-2 text-accent" />
              {settings.phone}
            </a>
            <a
              href="#quote"
              onClick={() => setIsOpen(false)}
              className="px-5 py-3 bg-secondary text-white text-center font-semibold rounded-lg shadow-md hover:bg-opacity-95"
            >
              Get Free Quote
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
