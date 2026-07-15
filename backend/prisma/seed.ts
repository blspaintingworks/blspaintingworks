import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding BLS Painting Works database...');

  // Clean old records to prevent duplicate leftover mock content
  await prisma.project.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.googleReview.deleteMany({});
  await prisma.mediaFile.deleteMany({});
  const adminEmail = 'admin@blspainting.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  let adminUser;
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    adminUser = await prisma.user.create({
      data: {
        name: 'BLS Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('Created default admin: admin@blspainting.com / admin123');
  } else {
    adminUser = existingAdmin;
    console.log('Admin already exists.');
  }

  // 2. Create Default Theme Settings
  const theme = await prisma.themeSettings.upsert({
    where: { id: 'default' },
    update: {
      primaryColor: '#0f172a',      // Slate text
      secondaryColor: '#2563eb',    // Professional royal blue
      accentColor: '#ea580c',       // Muted construction orange
      logoUrl: '/uploads/general/logo.png',
      faviconUrl: '/uploads/general/logo.png',
      isDarkMode: false
    },
    create: {
      id: 'default',
      primaryColor: '#0f172a',      // Slate text
      secondaryColor: '#2563eb',    // Professional royal blue
      accentColor: '#ea580c',       // Muted construction orange
      fontSans: 'Inter',
      fontHeading: 'Outfit',
      logoUrl: '/uploads/general/logo.png',
      faviconUrl: '/uploads/general/logo.png',
      loaderUrl: '',
      buttonStyle: 'rounded-lg shadow-md hover:scale-105 transition-transform duration-200',
      animationsEnabled: true,
      isDarkMode: false
    }
  });
  console.log('Upserted default theme settings.');

  // 3. Create Default Website Settings
  const settings = await prisma.websiteSettings.upsert({
    where: { id: 'default' },
    update: {
      businessName: 'BLS Painting Works',
      phone: '+91 9505411273, +91 9441992253',
      whatsapp: '+919505411273',
      email: 'blspaintingworks@gmail.com'
    },
    create: {
      id: 'default',
      businessName: 'BLS Painting Works',
      address: 'Town & Surrounding Districts, AP, India',
      phone: '+91 9505411273, +91 9441992253',
      whatsapp: '+919505411273',
      email: 'blspaintingworks@gmail.com',
      gstNumber: 'GST-981273981-BLS',
      copyrightText: '© 2026 BLS Painting Works. All rights reserved.',
      footerText: 'Transforming residential and commercial properties with state-of-the-art coatings, finishes, and master painting skills.',
      googleMapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d186884.28859942767!2d-81.3957545934661!3d42.98695029013063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882ef20ea88d9b0b%3A0x28f7d8c558c4e430!2sLondon%2C%20ON!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca',
      businessHours: 'Mon - Sat: 8:00 AM - 6:00 PM, Sun: Closed',
      socialLinks: JSON.stringify({
        facebook: 'https://facebook.com/blspainting',
        instagram: 'https://instagram.com/blspainting',
        twitter: 'https://twitter.com/blspainting',
        linkedin: 'https://linkedin.com/company/blspainting'
      })
    }
  });
  console.log('Upserted default website settings.');

  // 4. Create Homepage Sections
  const sections = [
    {
      pageName: 'homepage',
      sectionName: 'hero',
      orderIndex: 0,
      contentJson: JSON.stringify({
        headline: 'Master Painting Solutions for Fine Homes & Estates',
        subheading: 'Led by a well-known master painting contractor in town and surroundings. We deliver immaculate finishes, razor-sharp lines, and premium coatings built to last.',
        heroImageUrl: '/uploads/general/BLS Painting Hero.png',
        backgroundVideoUrl: '',
        ctaPrimaryText: 'Request A Free Quote',
        ctaPrimaryUrl: '#quote',
        ctaSecondaryText: 'Explore Projects',
        ctaSecondaryUrl: '#gallery',
        badges: ['20+ Years Experience', 'Family Owned & Operated', 'Master Craftsmen']
      }),
      isEnabled: true
    },
    {
      pageName: 'homepage',
      sectionName: 'about',
      orderIndex: 1,
      contentJson: JSON.stringify({
        title: 'Crafting Beautiful Spaces',
        story: 'At BLS Painting Works, painting is more than just applying color; it is an art of reviving properties. Over two decades, our crew has refined our processes to combine high-performance materials with immaculate attention to detail, serving our local town and surroundings.',
        experienceYears: '20+',
        mission: 'To deliver superior painting solutions that protect and beautify our clients properties, exceeding their service expectations.',
        vision: 'To be the most trusted, innovative, and recommended painting service provider in the region.',
        values: ['Quality Craftsmanship', 'Customer Integrity', 'Eco-Friendly Practices', 'Timely Execution'],
        photoUrl: '/uploads/general/BLS teamowner.png'
      }),
      isEnabled: true
    },
    {
      pageName: 'homepage',
      sectionName: 'gallery',
      orderIndex: 2,
      contentJson: '{}',
      isEnabled: true
    },
    {
      pageName: 'homepage',
      sectionName: 'services',
      orderIndex: 3,
      contentJson: '{}',
      isEnabled: true
    },
    {
      pageName: 'homepage',
      sectionName: 'testimonials',
      orderIndex: 4,
      contentJson: '{}',
      isEnabled: true
    },
    {
      pageName: 'homepage',
      sectionName: 'faq',
      orderIndex: 5,
      contentJson: '{}',
      isEnabled: true
    },
    {
      pageName: 'homepage',
      sectionName: 'blog',
      orderIndex: 6,
      contentJson: '{}',
      isEnabled: true
    },
    {
      pageName: 'homepage',
      sectionName: 'contact',
      orderIndex: 7,
      contentJson: '{}',
      isEnabled: true
    }
  ];

  for (const s of sections) {
    const existing = await prisma.pageContent.findFirst({
      where: { pageName: s.pageName, sectionName: s.sectionName }
    });
    if (existing) {
      await prisma.pageContent.update({
        where: { id: existing.id },
        data: s
      });
    } else {
      await prisma.pageContent.create({ data: s });
    }
  }
  console.log('Seeded homepage section content.');

  // 5. Create Default Services
  const services = [
    {
      title: 'Interior Painting',
      slug: 'interior-painting',
      description: 'Transform your indoor spaces with smooth finishes, vibrant colors, and professional craftsmanship that enhances the beauty of your home or workplace.',
      content: 'We deliver smooth interior wall coatings, ceiling designs, crack fixes, primer layers, and wood polishing. Our clean, professional team protects your furniture and floors.',
      imageUrl: '/uploads/general/IMG_20210901_165041.jpg',
      imageUrlsJson: '["/uploads/general/IMG_20210901_165041.jpg", "/uploads/general/IMG_20210901_165021.jpg"]',
      iconName: 'Home',
      pricing: 'Free Estimate',
      isEnabled: true,
      orderIndex: 0,
      seoTitle: 'Interior Painting Services | BLS Painting Works',
      seoMetaDesc: 'Flawless interior wall painting and cabinet coatings.'
    },
    {
      title: 'Exterior Painting',
      slug: 'exterior-painting',
      description: 'Protect and enhance your property\'s exterior with durable, weather-resistant painting solutions designed to withstand changing conditions.',
      content: 'Exterior walls demand durable coatings. We scrape, repair cracks, pressure wash, apply putty and primer, and coat using advanced weather-proof paints.',
      imageUrl: '/uploads/general/IMG_20250520_092632.jpg',
      imageUrlsJson: '["/uploads/general/IMG_20250520_092632.jpg", "/uploads/general/IMG_20250520_092628.jpg"]',
      iconName: 'Paintbrush',
      pricing: 'Free Estimate',
      isEnabled: true,
      orderIndex: 1,
      seoTitle: 'Exterior Painting Services | BLS Painting Works',
      seoMetaDesc: 'Weather-resistant outer wall painting and protective coatings.'
    },
    {
      title: 'Home Painting',
      slug: 'home-painting',
      description: 'Complete painting solutions for independent houses, duplex homes, and residential properties, delivering a fresh and long-lasting finish.',
      content: 'Personalized painting for independent houses, duplexes, and villas. From labor-only to full labor + material packages using Asian Paints, Nerolac, or Berger Paints.',
      imageUrl: '/uploads/general/IMG_20210901_165021.jpg',
      imageUrlsJson: '["/uploads/general/IMG_20210901_165021.jpg"]',
      iconName: 'Home',
      pricing: 'Free Quote',
      isEnabled: true,
      orderIndex: 2,
      seoTitle: 'Residential Home Painting | BLS Painting Works',
      seoMetaDesc: 'Flawroll home repainting and wall finishes.'
    },
    {
      title: 'Commercial Painting',
      slug: 'commercial-painting',
      description: 'Professional painting services for offices, shops, hospitals, schools, commercial buildings, and business spaces with minimal disruption to operations.',
      content: 'Large-scale commercial coatings. We manage retail outlets, hospital units, commercial complexes, and schools with flexible evening/off-hour scheduling.',
      imageUrl: '/uploads/general/unnamed.webp',
      imageUrlsJson: '["/uploads/general/unnamed.webp"]',
      iconName: 'Briefcase',
      pricing: 'Custom Quote',
      isEnabled: true,
      orderIndex: 3,
      seoTitle: 'Commercial Building Painting | BLS Painting Works',
      seoMetaDesc: 'Premium commercial and corporate building painting.'
    },
    {
      title: 'Apartment Painting',
      slug: 'apartment-painting',
      description: 'Reliable painting services for apartments and residential complexes, including new construction and repainting projects.',
      content: 'Specialized apartment unit repainting and bulk residential complex painting. Fast turnaround times with neat crack filing and wall putty finishing.',
      imageUrl: '/uploads/general/IMG_20250520_092628.jpg',
      imageUrlsJson: '["/uploads/general/IMG_20250520_092628.jpg"]',
      iconName: 'Building',
      pricing: 'Free Quote',
      isEnabled: true,
      orderIndex: 4,
      seoTitle: 'Apartment Painting Contractors | BLS Painting Works',
      seoMetaDesc: 'Apartment painting services and wall repainting.'
    },
    {
      title: 'Repainting Services',
      slug: 'repainting-services',
      description: 'Give your property a fresh new appearance with our professional repainting services, including surface preparation and premium finishing.',
      content: 'Got peeling paint or stains? Our professional repainting prep involves stripping old paint, filing cracks, sanding, and applying double coat fresh colors.',
      imageUrl: '/uploads/general/IMG_20210901_165233.jpg',
      imageUrlsJson: '["/uploads/general/IMG_20210901_165233.jpg"]',
      iconName: 'Paintbrush',
      pricing: 'Best Rates',
      isEnabled: true,
      orderIndex: 5,
      seoTitle: 'Repainting Services | BLS Painting Works',
      seoMetaDesc: 'Give your walls a fresh coat of high-quality paint.'
    },
    {
      title: 'Spray Wood Polishing',
      slug: 'spray-wood-polishing',
      description: 'Premium spray polishing for wooden doors, windows, wardrobes, cabinets, and other wooden surfaces, providing a smooth, elegant, and durable finish.',
      content: 'We specialize in spray wood polishing for main doors, window frames, wardrobes, cabinets, and premium wood furniture. Delivers a glossy or matte finish.',
      imageUrl: '/uploads/general/IMG_20251102_173527700.jpg',
      imageUrlsJson: '["/uploads/general/IMG_20251102_173527700.jpg"]',
      iconName: 'Sparkles',
      pricing: 'Free Estimate',
      isEnabled: true,
      orderIndex: 6,
      seoTitle: 'Spray Wood Polishing Contractors | BLS Painting Works',
      seoMetaDesc: 'Premium spray polishing for doors, windows, and cabinets.'
    },
    {
      title: 'Wall Crack Repair',
      slug: 'wall-crack-repair',
      description: 'We repair wall cracks and prepare surfaces before painting to ensure a strong foundation, improved appearance, and longer-lasting paint finish.',
      content: 'Don\'t paint over cracks! We use high-tensile crack-filler paste, sand, apply putty, and primer to secure the foundation before applying final coatings.',
      imageUrl: '/uploads/general/IMG_20210901_164823.jpg',
      imageUrlsJson: '["/uploads/general/IMG_20210901_164823.jpg"]',
      iconName: 'Wrench',
      pricing: 'Free Assessment',
      isEnabled: true,
      orderIndex: 7,
      seoTitle: 'Wall Crack Repair & Preparation | BLS Painting Works',
      seoMetaDesc: 'Professional wall crack repair and surface putty coating.'
    }
  ];

  for (const item of services) {
    await prisma.service.upsert({
      where: { slug: item.slug },
      update: item,
      create: item
    });
  }
  console.log('Seeded default services.');

  // 6. Create Default Projects (Gallery)
  const projects = [
    {
      title: 'Living Room Detailing',
      slug: 'living-room-detailing',
      description: 'A complete interior coating change with precision wall trims.',
      beforeImageUrl: '/uploads/general/BEFORE.png',
      afterImageUrl: '/uploads/general/AFTER.png',
      imageUrlsJson: '[]',
      albumName: 'Interior',
      location: 'Main Town',
      projectDate: 'May 2026',
      clientName: 'Local Estate Owner',
      isFeatured: true,
      orderIndex: 0
    },
    {
      title: 'Exterior Restoration',
      slug: 'exterior-restoration',
      description: 'Prepped weather-worn external surfaces and coated with UV resistant paints.',
      beforeImageUrl: '/uploads/general/IMG_20210901_165233.jpg',
      afterImageUrl: '/uploads/general/IMG_20250520_092628.jpg',
      imageUrlsJson: '[]',
      albumName: 'Exterior',
      location: 'East Suburbs',
      projectDate: 'June 2026',
      clientName: 'Sarah Jenkins',
      isFeatured: true,
      orderIndex: 1
    },
    {
      title: 'Commercial Office Facade',
      slug: 'commercial-facade',
      description: 'Modern workspace exterior painting using durable industrial coatings.',
      beforeImageUrl: '/uploads/general/unnamed.webp',
      afterImageUrl: '/uploads/general/unnamed (1).webp',
      imageUrlsJson: '[]',
      albumName: 'Commercial',
      location: 'Industrial Zone',
      projectDate: 'June 2026',
      clientName: 'Corp Center',
      isFeatured: true,
      orderIndex: 2
    },
    {
      title: 'Heritage Siding Restoration',
      slug: 'heritage-siding-restoration',
      description: 'Precision paint coating for siding boards and trims.',
      beforeImageUrl: '/uploads/general/IMG_20250806_175326.jpg',
      afterImageUrl: '/uploads/general/IMG_20250817_172636.jpg',
      imageUrlsJson: '[]',
      albumName: 'Exterior',
      location: 'Old Quarter',
      projectDate: 'July 2026',
      clientName: 'Heritage Society',
      isFeatured: true,
      orderIndex: 3
    },
    {
      title: 'Villa Fence & Trim Finishing',
      slug: 'villa-fence-trim',
      description: 'Complete repainting and sealing of modern wooden fence and matching trim panels.',
      beforeImageUrl: '/uploads/general/IMG_20251102_114221245.jpg',
      afterImageUrl: '/uploads/general/IMG_20251102_114234038.jpg',
      imageUrlsJson: '[]',
      albumName: 'Residential',
      location: 'Valley Estates',
      projectDate: 'August 2026',
      clientName: 'Estate Resident',
      isFeatured: true,
      orderIndex: 4
    }
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
  }
  console.log('Seeded default projects.');

  // 7. Create Default Testimonials
  const testimonials = [
    {
      customerName: 'Robert Vance',
      customerRole: 'Office Manager, Vance Tech',
      customerPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      content: 'The BLS crew painted our entire 15,000 sq ft office over a single weekend. Outstanding quality, zero downtime for our staff, and excellent communication!',
      rating: 5,
      isFeatured: true,
      isApproved: true
    },
    {
      customerName: 'Mary Cooper',
      customerRole: 'Homeowner',
      customerPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      content: 'They were so clean! No drips, no mess, and the trim lines are perfectly straight. It feels like a brand new house.',
      rating: 5,
      isFeatured: true,
      isApproved: true
    }
  ];

  for (const t of testimonials) {
    const exists = await prisma.testimonial.findFirst({ where: { customerName: t.customerName } });
    if (!exists) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log('Seeded default testimonials.');

  // 8. Create Default FAQs
  const faqs = [
    {
      question: "What painting services do you offer?",
      answer: "BLS Painting Works provides professional interior painting, exterior painting, residential painting, commercial painting, apartment painting, villa painting, wall putty, crack repair, texture finishes, repainting, metal painting, and spray wood polishing. We deliver high-quality workmanship tailored to every project.",
      orderIndex: 0,
      isEnabled: true
    },
    {
      question: "How long have you been in the painting industry?",
      answer: "We have 20+ years of experience providing reliable painting services across Nalgonda and nearby areas. Our experience covers homes, apartments, villas, offices, hospitals, schools, shops, and commercial buildings.",
      orderIndex: 1,
      isEnabled: true
    },
    {
      question: "Do you provide paint and other materials?",
      answer: "Yes. We offer flexible options based on your preference.\n\nLabour Only: You provide the paint and materials, and our skilled team completes the work.\nLabour + Materials: We arrange everything for you using trusted brands such as Asian Paints, Berger Paints, Birla Opus, JK Paints, and Nerolac.\n\nThe final decision is always yours.",
      orderIndex: 2,
      isEnabled: true
    },
    {
      question: "How do you prepare walls before painting?",
      answer: "Proper surface preparation is the foundation of a long-lasting finish. We repair cracks, fill damaged areas, apply wall putty where required, smooth the surface, and apply primer before painting to ensure a durable and professional result.",
      orderIndex: 3,
      isEnabled: true
    },
    {
      question: "Do you provide wood polishing services?",
      answer: "Yes. We specialize in spray wood polishing for doors, windows, wardrobes, cabinets, wooden frames, and other wooden surfaces. Our spray finishing technique delivers a smooth, elegant, and long-lasting appearance.",
      orderIndex: 4,
      isEnabled: true
    },
    {
      question: "Do you provide waterproofing services?",
      answer: "We do not offer complete waterproofing solutions. However, where appropriate, we apply water-resistant coating products before painting to help reduce minor moisture penetration and improve the durability of the paint finish.",
      orderIndex: 5,
      isEnabled: true
    },
    {
      question: "How is the painting quotation calculated?",
      answer: "Every quotation is prepared after a site inspection and depends on factors such as:\n\nTotal painting area\nSurface condition\nPaint brand selected\nType of finish required\nNumber of coats\nLabour-only or labour with materials\n\nThis allows us to provide a fair and transparent estimate.",
      orderIndex: 6,
      isEnabled: true
    },
    {
      question: "Which areas do you serve?",
      answer: "We proudly serve Nalgonda and surrounding towns and villages. We also undertake selected projects in nearby districts depending on the project size and requirements.",
      orderIndex: 7,
      isEnabled: true
    },
    {
      question: "Why choose BLS Painting Works?",
      answer: "With 20+ years of trusted craftsmanship, we are committed to delivering quality workmanship, professional service, timely project completion, and customer satisfaction. Whether you supply the materials or choose us to provide them, we focus on achieving a clean, durable, and premium finish for every project.",
      orderIndex: 8,
      isEnabled: true
    },
    {
      question: "How can I request a free quotation?",
      answer: "Getting started is simple. Contact us by phone, WhatsApp, or through our website, and we'll schedule a site visit to understand your requirements and provide a detailed, no-obligation quotation.",
      orderIndex: 9,
      isEnabled: true
    }
  ];

  for (const f of faqs) {
    const exists = await prisma.fAQ.findFirst({ where: { question: f.question } });
    if (!exists) {
      await prisma.fAQ.create({ data: f });
    }
  }
  console.log('Seeded default FAQs.');

  // 9. Create Default Blogs
  const blogs = [
    {
      title: '5 Paint Colors That Boost Home Appraisal Values',
      slug: 'colors-boost-appraisal',
      content: 'Painting is one of the highest ROI improvements you can make. Soft blues in bathrooms, warm grays in living areas, and dramatic charcoal front doors have been proven to drive higher sales prices. In this post, we analyze current design trends that add actual market value to your property.',
      summary: 'Discover the top painting color palettes that professional staging companies and realtors use to increase home appraisal figures.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=600',
      category: 'Design Trends',
      tagsJson: JSON.stringify(['colors', 'home-value', 'trends']),
      authorId: adminUser.id,
      status: 'PUBLISHED',
      seoTitle: 'Paint Colors to Increase House Value | BLS Painting',
      seoMetaDesc: 'Thinking of selling? Here are the top 5 paint color trends that realtors suggest to boost buyer appraisal values instantly.'
    }
  ];

  for (const b of blogs) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {},
      create: b
    });
  }
  console.log('Seeded default blog posts.');

  // 10. Seed Initial Mock Google Reviews
  const mockReviews = [
    { reviewerName: 'Audrey Hepburn', content: 'Incredible clean work! The lines on our trim are perfect.', rating: 5, reviewDate: '2026-06-01', isApproved: true, isFeatured: true },
    { reviewerName: 'George Clooney', content: 'Very reliable team. Showed up on time, finished ahead of schedule.', rating: 5, reviewDate: '2026-06-10', isApproved: true, isFeatured: true }
  ];

  for (const r of mockReviews) {
    const exists = await prisma.googleReview.findFirst({ where: { reviewerName: r.reviewerName } });
    if (!exists) {
      await prisma.googleReview.create({ data: r });
    }
  }
  console.log('Seeded mock Google Reviews.');

  // 11. Create a Default Popup
  const popup = await prisma.popup.create({
    data: {
      name: 'Summer Promo',
      type: 'FESTIVAL',
      title: 'Summer Painting Special!',
      content: 'Get 10% OFF all exterior painting services booked before August 31st. Schedule your free quote today.',
      ctaText: 'Claim Discount',
      ctaUrl: '#quote',
      isEnabled: true
    }
  });
  // 12. Scan uploads/general folder and insert into MediaFile table
  const uploadDir = path.join(__dirname, '../public/uploads/general');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    for (const filename of files) {
      const filepath = `/uploads/general/${filename}`;
      const ext = path.extname(filename).toLowerCase();
      let filetype = 'image/jpeg';
      if (ext === '.png') filetype = 'image/png';
      else if (ext === '.webp') filetype = 'image/webp';
      else if (ext === '.mp4') filetype = 'video/mp4';

      const stats = fs.statSync(path.join(uploadDir, filename));
      const size = stats.size;

      const exists = await prisma.mediaFile.findFirst({ where: { filepath } });
      if (!exists) {
        await prisma.mediaFile.create({
          data: {
            filename,
            filepath,
            filetype,
            size,
            folder: 'general'
          }
        });
      }
    }
    console.log('Seeded local files into Media Library database table.');
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
