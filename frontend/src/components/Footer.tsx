'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

import { BACKEND_URL } from '@/utils/api';

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<any>({
    businessName: 'BLS Painting Works',
    address: '45 Bluecoat Circle, Suite A, London, ON',
    phone: '+1 (555) 392-0192',
    whatsapp: '+15553920192',
    email: 'contact@blspaintingworks.com',
    copyrightText: '© 2026 BLS Painting Works. All rights reserved.',
    footerText: 'Transforming residential and commercial properties with state-of-the-art coatings, finishes, and painting skills.',
    businessHours: 'Mon - Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM, Sun: Closed'
  });

  // Skip showing public footer on admin pages
  if (pathname?.startsWith('/admin')) return null;

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/settings/website`)
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  return (
    <footer id="contact" className="bg-[#070b13] border-t border-white/5 pt-16 pb-8 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-xl text-white">{settings.businessName}</h3>
          <p className="text-sm leading-relaxed">{settings.footerText}</p>
          <div className="flex space-x-4 pt-2">
            <a
              href={`https://wa.me/${settings.whatsapp.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-lg transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-heading font-semibold text-lg text-white">Our Services</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/services" className="hover:text-secondary transition-colors">Interior Painting</a></li>
            <li><a href="/services" className="hover:text-secondary transition-colors">Exterior Painting</a></li>
            <li><a href="/services" className="hover:text-secondary transition-colors">Commercial Coatings</a></li>
            <li><a href="/services" className="hover:text-secondary transition-colors">Cabinet Refinishing</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-heading font-semibold text-lg text-white">Contact Info</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 text-accent shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-accent shrink-0" />
              <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">{settings.phone}</a>
            </li>
            <li className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-accent shrink-0" />
              <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">{settings.email}</a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-heading font-semibold text-lg text-white">Business Hours</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <Clock className="h-4 w-4 mr-2 text-accent shrink-0 mt-0.5" />
              <span>{settings.businessHours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600 flex flex-col md:flex-row items-center justify-between gap-4">
        <span>{settings.copyrightText}</span>
        <div className="flex space-x-6">
          <a href="/admin" className="hover:text-secondary transition-colors">CMS Login</a>
          <a href="/sitemap.xml" target="_blank" className="hover:text-secondary transition-colors">Sitemap</a>
          <a href="/robots.txt" target="_blank" className="hover:text-secondary transition-colors">Robots.txt</a>
        </div>
      </div>

      {/* Floating WhatsApp Action */}
      <a
        href={`https://wa.me/${settings.whatsapp.replace('+', '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </footer>
  );
}
