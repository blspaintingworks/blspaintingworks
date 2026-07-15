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
      default: site.businessName,
      template: `%s | ${site.businessName}`
    },
    description: 'Premium interior and exterior painting services for residential and commercial spaces.',
    metadataBase: new URL('http://localhost:3000'),
    icons: {
      icon: logo,
      shortcut: logo,
      apple: logo,
    },
    openGraph: {
      title: site.businessName,
      description: 'Premium painting contractors',
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
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
