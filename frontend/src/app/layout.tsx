import type { Metadata } from 'next';
import './globals.css';

// Resilience helper to fetch theme/settings with local fallback
async function getThemeAndSettings() {
  const defaultTheme = {
    primaryColor: '#0f172a',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    fontSans: 'Inter',
    fontHeading: 'Outfit',
    logoUrl: '',
    faviconUrl: '',
    loaderUrl: '',
    buttonStyle: 'rounded-lg shadow-md hover:scale-105 transition-transform duration-200',
    animationsEnabled: true,
    isDarkMode: true
  };

  const defaultWebsite = {
    businessName: 'BLS Painting Works',
    copyrightText: '© 2026 BLS Painting Works. All rights reserved.',
    phone: '+1 (555) 392-0192',
    whatsapp: '+15553920192',
    email: 'contact@blspaintingworks.com'
  };

  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const [themeRes, siteRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/settings/theme`, { cache: 'no-store' }),
      fetch(`${BACKEND_URL}/api/settings/website`, { cache: 'no-store' })
    ]);
    
    if (themeRes.ok && siteRes.ok) {
      const theme = await themeRes.json();
      const site = await siteRes.json();
      return { theme, site };
    }
  } catch (error) {
    console.warn('Backend server connection not established yet. Using theme fallbacks.');
  }

  return { theme: defaultTheme, site: defaultWebsite };
}

export async function generateMetadata(): Promise<Metadata> {
  const { theme, site } = await getThemeAndSettings();
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const logo = theme.logoUrl ? `${BACKEND_URL}${theme.logoUrl}` : '/favicon.ico';
  return {
    title: {
      default: `${site.businessName} | Best Painting Services in Nalgonda, Telangana`,
      template: `%s | ${site.businessName}`
    },
    description: 'BLS Painting Works offers the best professional interior & exterior painting services in Nalgonda, Telangana, and surrounding districts. Top house painting contractors near you.',
    keywords: [
      'painter near me',
      'best painters in Telangana',
      'painters in Nalgonda',
      'painting services in Nalgonda',
      'house painters in Telangana',
      'BLS Painting Works Nalgonda',
      'wall painters Nalgonda',
      'professional painting contractors Telangana',
      'house painting services Nalgonda',
      'exterior painters Telangana'
    ],
    metadataBase: new URL('http://localhost:3000'),
    icons: {
      icon: logo,
      shortcut: logo,
      apple: logo,
    },
    openGraph: {
      title: `${site.businessName} | Best Painters in Nalgonda & Telangana`,
      description: 'Premium interior & exterior painting contractors serving Nalgonda, Telangana, and surrounding districts. Get a free quote today!',
      url: 'https://blspaintingworks.com',
      siteName: site.businessName,
      type: 'website'
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = await getThemeAndSettings();
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const logo = theme.logoUrl ? `${BACKEND_URL}${theme.logoUrl}` : '/favicon.ico';

  // Create style element injection to drive Tailwind configuration
  const cssVariables = `
    :root {
      --primary-color: ${theme.primaryColor};
      --secondary-color: ${theme.secondaryColor};
      --accent-color: ${theme.accentColor};
      --font-sans: '${theme.fontSans}', sans-serif;
      --font-heading: '${theme.fontHeading}', sans-serif;
    }
  `;

  // Local Business Schema JSON-LD for Local Search Engine Optimization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "BLS Painting Works",
    "alternateName": "BLS Painters Nalgonda",
    "description": "Professional house and commercial painting contractors in Nalgonda, Telangana. Rated the best painters in Telangana for interior, exterior, and texture wall coatings.",
    "url": "https://blspaintingworks.com",
    "logo": logo,
    "telephone": "+919505411273",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Nalgonda",
      "addressRegion": "Telangana",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "17.0575",
      "longitude": "79.2684"
    },
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Nalgonda"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Telangana"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Suryapet"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Yadadri Bhuvanagiri"
      }
    ],
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "08:00",
      "closes": "18:00"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={`https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap`} rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
        <link rel="icon" href={logo} />
        <link rel="shortcut icon" href={logo} />
        <link rel="apple-touch-icon" href={logo} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
