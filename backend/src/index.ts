import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT, requireRole, logActivity, AuthenticatedRequest } from './middleware/auth';
import { uploadMediaFile, deleteMediaFile } from './utils/cloudinary';
import { autoSeedDatabase } from './utils/autoseed';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'bls_super_secret_session_token_key_12938123';

// Configure Multer (memory storage for custom handler)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(cookieParser());

// Static uploads serving
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// --- MOCK DATABASE REDIRECT / 404 LOGS ---
// In a production system, these might have tables. We'll store redirect rules in a local JSON config or DB.
let redirects = [
  { from: '/old-services', to: '/services', code: 301 },
  { from: '/contact-us', to: '/contact', code: 301 }
];
let fourOhFourLogs: { id: string; url: string; timestamp: Date }[] = [];

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or inactive user' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    // Save audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        details: `User ${user.name} logged in successfully.`
      }
    });

    return res.json({
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/logout', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user) {
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'LOGOUT',
        details: `User ${req.user.name} logged out.`
      }
    });
  }

  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateJWT, (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.user });
});

// User Management (Admin only)
app.get('/api/users', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
  });
  return res.json(users);
});

app.post('/api/users', authenticateJWT, requireRole(['ADMIN']), logActivity('CREATE_USER'), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, isActive: true },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/:id', authenticateJWT, requireRole(['ADMIN']), logActivity('UPDATE_USER'), async (req, res) => {
  const { name, email, password, role, isActive } = req.body;
  const updateData: any = { name, email, role, isActive };

  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/users/:id', authenticateJWT, requireRole(['ADMIN']), logActivity('DELETE_USER'), async (req: AuthenticatedRequest, res) => {
  if (req.user && req.user.id === req.params.id) {
    return res.status(400).json({ message: 'You cannot delete yourself' });
  }
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// 2. SETTINGS & THEMES
// ==========================================

app.get('/api/settings/theme', async (req, res) => {
  let theme = await prisma.themeSettings.findUnique({ where: { id: 'default' } });
  if (!theme) {
    theme = await prisma.themeSettings.create({ data: { id: 'default' } });
  }
  return res.json(theme);
});

app.put('/api/settings/theme', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_THEME'), async (req, res) => {
  const settings = await prisma.themeSettings.update({
    where: { id: 'default' },
    data: req.body
  });
  return res.json(settings);
});

app.get('/api/settings/website', async (req, res) => {
  let settings = await prisma.websiteSettings.findUnique({ where: { id: 'default' } });
  if (!settings) {
    settings = await prisma.websiteSettings.create({ data: { id: 'default' } });
  }
  return res.json(settings);
});

app.put('/api/settings/website', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_WEBSITE_SETTINGS'), async (req, res) => {
  const settings = await prisma.websiteSettings.update({
    where: { id: 'default' },
    data: req.body
  });
  return res.json(settings);
});

// ==========================================
// 3. HOMEPAGE BUILDER / PAGE CONTENT
// ==========================================

app.get('/api/page-content', async (req, res) => {
  const contents = await prisma.pageContent.findMany({
    orderBy: { orderIndex: 'asc' }
  });
  return res.json(contents);
});

app.post('/api/page-content', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('CREATE_PAGE_SECTION'), async (req, res) => {
  const { pageName, sectionName, contentJson, isEnabled, orderIndex } = req.body;
  const section = await prisma.pageContent.create({
    data: { pageName, sectionName, contentJson: JSON.stringify(contentJson), isEnabled, orderIndex }
  });
  return res.json(section);
});

app.put('/api/page-content/reorder', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('REORDER_PAGE_SECTIONS'), async (req, res) => {
  const { orders } = req.body; // Array of { id: string, orderIndex: number }
  for (const item of orders) {
    await prisma.pageContent.update({
      where: { id: item.id },
      data: { orderIndex: item.orderIndex }
    });
  }
  return res.json({ message: 'Sections reordered' });
});

app.put('/api/page-content/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_PAGE_SECTION'), async (req, res) => {
  const { contentJson, isEnabled } = req.body;
  const data: any = {};
  if (contentJson !== undefined) data.contentJson = JSON.stringify(contentJson);
  if (isEnabled !== undefined) data.isEnabled = isEnabled;

  const section = await prisma.pageContent.update({
    where: { id: req.params.id },
    data
  });
  return res.json(section);
});

// ==========================================
// 4. SERVICES
// ==========================================

app.get('/api/services', async (req, res) => {
  const services = await prisma.service.findMany({
    orderBy: { orderIndex: 'asc' }
  });
  return res.json(services);
});

app.post('/api/services', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('CREATE_SERVICE'), async (req, res) => {
  const data = { ...req.body };
  if (data.imageUrlsJson && typeof data.imageUrlsJson === 'object') {
    data.imageUrlsJson = JSON.stringify(data.imageUrlsJson);
  }
  const service = await prisma.service.create({
    data: {
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/ /g, '-')
    }
  });
  return res.json(service);
});

app.put('/api/services/reorder', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('REORDER_SERVICES'), async (req, res) => {
  const { orders } = req.body;
  for (const item of orders) {
    await prisma.service.update({
      where: { id: item.id },
      data: { orderIndex: item.orderIndex }
    });
  }
  return res.json({ message: 'Services reordered' });
});

app.put('/api/services/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_SERVICE'), async (req, res) => {
  const data = { ...req.body };
  if (data.imageUrlsJson && typeof data.imageUrlsJson === 'object') {
    data.imageUrlsJson = JSON.stringify(data.imageUrlsJson);
  }
  const service = await prisma.service.update({
    where: { id: req.params.id },
    data
  });
  return res.json(service);
});

app.delete('/api/services/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('DELETE_SERVICE'), async (req, res) => {
  await prisma.service.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Service deleted' });
});

// ==========================================
// 5. PROJECTS / GALLERY
// ==========================================

app.get('/api/projects', async (req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { orderIndex: 'asc' }
  });
  return res.json(projects);
});

app.post('/api/projects', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('CREATE_PROJECT'), async (req, res) => {
  const data = { ...req.body };
  if (data.imageUrlsJson && typeof data.imageUrlsJson === 'object') {
    data.imageUrlsJson = JSON.stringify(data.imageUrlsJson);
  }
  const project = await prisma.project.create({
    data: {
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/ /g, '-')
    }
  });
  return res.json(project);
});

app.put('/api/projects/reorder', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('REORDER_PROJECTS'), async (req, res) => {
  const { orders } = req.body;
  for (const item of orders) {
    await prisma.project.update({
      where: { id: item.id },
      data: { orderIndex: item.orderIndex }
    });
  }
  return res.json({ message: 'Projects reordered' });
});

app.put('/api/projects/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_PROJECT'), async (req, res) => {
  const data = { ...req.body };
  if (data.imageUrlsJson && typeof data.imageUrlsJson === 'object') {
    data.imageUrlsJson = JSON.stringify(data.imageUrlsJson);
  }
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data
  });
  return res.json(project);
});

app.delete('/api/projects/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('DELETE_PROJECT'), async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Project deleted' });
});

// ==========================================
// 6. TESTIMONIALS
// ==========================================

app.get('/api/testimonials', async (req, res) => {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return res.json(testimonials);
});

app.post('/api/testimonials', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('CREATE_TESTIMONIAL'), async (req, res) => {
  const t = await prisma.testimonial.create({ data: req.body });
  return res.json(t);
});

app.put('/api/testimonials/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_TESTIMONIAL'), async (req, res) => {
  const t = await prisma.testimonial.update({
    where: { id: req.params.id },
    data: req.body
  });
  return res.json(t);
});

app.delete('/api/testimonials/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('DELETE_TESTIMONIAL'), async (req, res) => {
  await prisma.testimonial.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Testimonial deleted' });
});

// ==========================================
// 7. FAQS
// ==========================================

app.get('/api/faqs', async (req, res) => {
  const faqs = await prisma.fAQ.findMany({
    orderBy: { orderIndex: 'asc' }
  });
  return res.json(faqs);
});

app.post('/api/faqs', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('CREATE_FAQ'), async (req, res) => {
  const faq = await prisma.fAQ.create({ data: req.body });
  return res.json(faq);
});

app.put('/api/faqs/reorder', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('REORDER_FAQS'), async (req, res) => {
  const { orders } = req.body;
  for (const item of orders) {
    await prisma.fAQ.update({
      where: { id: item.id },
      data: { orderIndex: item.orderIndex }
    });
  }
  return res.json({ message: 'FAQs reordered' });
});

app.put('/api/faqs/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_FAQ'), async (req, res) => {
  const faq = await prisma.fAQ.update({
    where: { id: req.params.id },
    data: req.body
  });
  return res.json(faq);
});

app.delete('/api/faqs/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('DELETE_FAQ'), async (req, res) => {
  await prisma.fAQ.delete({ where: { id: req.params.id } });
  return res.json({ message: 'FAQ deleted' });
});

// ==========================================
// 8. BLOGS
// ==========================================

app.get('/api/blogs', async (req, res) => {
  const blogs = await prisma.blogPost.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' }
  });
  return res.json(blogs);
});

app.post('/api/blogs', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('CREATE_BLOG'), async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const data = { ...req.body };
  if (data.tagsJson && typeof data.tagsJson === 'object') {
    data.tagsJson = JSON.stringify(data.tagsJson);
  }
  const blog = await prisma.blogPost.create({
    data: {
      ...data,
      authorId: req.user.id,
      slug: data.slug || data.title.toLowerCase().replace(/ /g, '-')
    }
  });
  return res.json(blog);
});

app.put('/api/blogs/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_BLOG'), async (req, res) => {
  const data = { ...req.body };
  if (data.tagsJson && typeof data.tagsJson === 'object') {
    data.tagsJson = JSON.stringify(data.tagsJson);
  }
  const blog = await prisma.blogPost.update({
    where: { id: req.params.id },
    data
  });
  return res.json(blog);
});

app.delete('/api/blogs/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('DELETE_BLOG'), async (req, res) => {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Blog deleted' });
});

// ==========================================
// 9. QUOTE REQUESTS (LEADS)
// ==========================================

app.get('/api/quote-requests', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { status, search } = req.query;
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { name: { contains: String(search) } },
      { email: { contains: String(search) } },
      { phone: { contains: String(search) } },
      { message: { contains: String(search) } }
    ];
  }

  const requests = await prisma.quoteRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  return res.json(requests);
});

// Public Endpoint to submit leads
app.post('/api/quote-requests/public', async (req, res) => {
  const { name, email, phone, services, message } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Name, email, and phone are required' });
  }

  try {
    const lead = await prisma.quoteRequest.create({
      data: {
        name,
        email,
        phone,
        servicesJson: JSON.stringify(services || []),
        message: message || '',
        status: 'PENDING'
      }
    });
    return res.status(201).json(lead);
  } catch (error) {
    return res.status(500).json({ message: 'Error submitting lead request' });
  }
});

app.put('/api/quote-requests/:id', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), logActivity('UPDATE_LEAD'), async (req, res) => {
  const { status, internalNotes } = req.body;
  const lead = await prisma.quoteRequest.update({
    where: { id: req.params.id },
    data: { status, internalNotes }
  });
  return res.json(lead);
});

// ==========================================
// 10. GOOGLE REVIEWS
// ==========================================

app.get('/api/reviews', async (req, res) => {
  const reviews = await prisma.googleReview.findMany({
    orderBy: { reviewDate: 'desc' }
  });
  return res.json(reviews);
});

app.post('/api/reviews', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('CREATE_REVIEW'), async (req, res) => {
  const r = await prisma.googleReview.create({ data: req.body });
  return res.json(r);
});

app.put('/api/reviews/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_REVIEW'), async (req, res) => {
  const r = await prisma.googleReview.update({
    where: { id: req.params.id },
    data: req.body
  });
  return res.json(r);
});

app.post('/api/reviews/import', authenticateJWT, requireRole(['ADMIN']), logActivity('IMPORT_GOOGLE_REVIEWS'), async (req, res) => {
  try {
    const siteSettings = await prisma.websiteSettings.findUnique({ where: { id: 'default' } });
    const apiKey = siteSettings?.googlePlacesApiKey;
    const placeId = siteSettings?.googlePlaceId;

    if (apiKey && placeId) {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,formatted_address,url&key=${apiKey}`;
      const response = await fetch(googleUrl);
      const data = await response.json() as any;

      if (data.status !== 'OK') {
        return res.status(400).json({ message: `Google Places API error: ${data.status} - ${data.error_message || ''}` });
      }

      // Update website settings location details and direction links dynamically
      const formattedAddress = data.result?.formatted_address;
      const mapsUrl = data.result?.url;
      if (formattedAddress) {
        await prisma.websiteSettings.update({
          where: { id: 'default' },
          data: {
            address: formattedAddress,
            googleMapEmbed: mapsUrl || ''
          }
        });
      }

      const googleReviews = data.result?.reviews || [];
      let importedCount = 0;

      for (const item of googleReviews) {
        const authorName = item.author_name;
        const exists = await prisma.googleReview.findFirst({ where: { reviewerName: authorName } });
        if (!exists) {
          await prisma.googleReview.create({
            data: {
              reviewerName: authorName,
              reviewerPhotoUrl: item.profile_photo_url || '',
              content: item.text || '',
              rating: item.rating || 5,
              reviewDate: new Date(item.time * 1000).toLocaleDateString(),
              isApproved: true,
              isFeatured: true
            }
          });
          importedCount++;
        }
      }
      return res.json({ message: `Successfully imported ${importedCount} real-time reviews directly from Google Business Profile.` });
    } else {
      const mockReviews = [
        { reviewerName: 'James Carter', content: 'BLS Painting did an incredible job painting our interior! Highly recommend them.', rating: 5, reviewDate: '2026-06-15', isApproved: true, isFeatured: true },
        { reviewerName: 'Sophia Miller', content: 'Professional crew, clean work, and finished ahead of schedule.', rating: 5, reviewDate: '2026-06-20', isApproved: true, isFeatured: true },
        { reviewerName: 'Daniel Vance', content: 'Fair pricing and perfect lines. Very happy with my deck paint.', rating: 4, reviewDate: '2026-06-28', isApproved: true, isFeatured: false }
      ];

      let importedCount = 0;
      for (const item of mockReviews) {
        const exists = await prisma.googleReview.findFirst({ where: { reviewerName: item.reviewerName } });
        if (!exists) {
          await prisma.googleReview.create({ data: item });
          importedCount++;
        }
      }
      return res.json({ message: `Simulated sync: Imported ${importedCount} reviews. Configure a Google Places API Key and Place ID in settings for real live reviews.` });
    }
  } catch (error: any) {
    console.error('Reviews import error:', error);
    return res.status(500).json({ message: `Failed to import reviews: ${error.message}` });
  }
});

// ==========================================
// 11. POPUPS
// ==========================================

app.get('/api/popups', async (req, res) => {
  const popups = await prisma.popup.findMany({});
  return res.json(popups);
});

app.post('/api/popups', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('CREATE_POPUP'), async (req, res) => {
  const p = await prisma.popup.create({ data: req.body });
  return res.json(p);
});

app.put('/api/popups/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), logActivity('UPDATE_POPUP'), async (req, res) => {
  const p = await prisma.popup.update({
    where: { id: req.params.id },
    data: req.body
  });
  return res.json(p);
});

// ==========================================
// 12. MEDIA LIBRARY
// ==========================================

app.get('/api/media', authenticateJWT, async (req, res) => {
  const files = await prisma.mediaFile.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(files);
});

app.post('/api/media/upload', authenticateJWT, upload.single('file'), logActivity('UPLOAD_MEDIA'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const folder = req.body.folder || 'general';
    const result = await uploadMediaFile(req.file, folder);

    // Save metadata
    const media = await prisma.mediaFile.create({
      data: {
        filename: req.file.originalname,
        filepath: result.url,
        filetype: req.file.mimetype,
        size: req.file.size,
        isCompressed: true, // Mocked auto-compression on upload
        folder
      }
    });

    return res.status(201).json(media);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Upload failed' });
  }
});

app.put('/api/media/:id', authenticateJWT, logActivity('RENAME_MEDIA'), async (req, res) => {
  const { filename } = req.body;
  const media = await prisma.mediaFile.update({
    where: { id: req.params.id },
    data: { filename }
  });
  return res.json(media);
});

app.delete('/api/media/:id', authenticateJWT, logActivity('DELETE_MEDIA'), async (req, res) => {
  try {
    const media = await prisma.mediaFile.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ message: 'File not found' });

    await deleteMediaFile(media.filepath);
    await prisma.mediaFile.delete({ where: { id: req.params.id } });
    return res.json({ message: 'File deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete' });
  }
});

// ==========================================
// 13. AUDIT LOGS
// ==========================================

app.get('/api/audit-logs', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { timestamp: 'desc' },
    take: 100
  });
  return res.json(logs);
});

// ==========================================
// 14. ANALYTICS & SEO
// ==========================================

app.get('/api/analytics/dashboard', authenticateJWT, async (req, res) => {
  // Generate beautiful stats report
  const leadCount = await prisma.quoteRequest.count();
  const conversionRate = leadCount > 0 ? ((leadCount / 420) * 100).toFixed(1) : '0'; // mock 420 base visitors

  return res.json({
    stats: {
      visitors: 1250,
      leads: leadCount,
      conversionRate: `${conversionRate}%`,
      reviews: 42,
      seoScore: 92,
      health: 'Optimal'
    },
    popularPages: [
      { path: '/', views: 980 },
      { path: '/services', views: 340 },
      { path: '/gallery', views: 280 },
      { path: '/blog', views: 120 }
    ],
    trafficSources: [
      { source: 'Google Search', count: 720 },
      { source: 'Direct', count: 280 },
      { source: 'WhatsApp / Referral', count: 180 },
      { source: 'Social Media', count: 70 }
    ],
    keywords: [
      { keyword: 'painting contractors near me', position: 2 },
      { keyword: 'house painters', position: 4 },
      { keyword: 'exterior wall painting', position: 3 },
      { keyword: 'interior home paint cost', position: 5 }
    ]
  });
});

// Redirects and 404 logs
app.get('/api/redirects', authenticateJWT, (req, res) => {
  return res.json(redirects);
});

app.post('/api/redirects', authenticateJWT, requireRole(['ADMIN']), logActivity('ADD_REDIRECT'), (req, res) => {
  const { from, to, code } = req.body;
  const newRedirect = { from, to, code: code || 301 };
  redirects.push(newRedirect);
  return res.json(newRedirect);
});

app.delete('/api/redirects', authenticateJWT, requireRole(['ADMIN']), logActivity('DELETE_REDIRECT'), (req, res) => {
  const { from } = req.body;
  redirects = redirects.filter(r => r.from !== from);
  return res.json({ message: 'Redirect deleted' });
});

app.get('/api/404-logs', authenticateJWT, (req, res) => {
  return res.json(fourOhFourLogs);
});

app.post('/api/404-logs/public', (req, res) => {
  const { url } = req.body;
  fourOhFourLogs.unshift({ id: Math.random().toString(), url, timestamp: new Date() });
  if (fourOhFourLogs.length > 100) fourOhFourLogs.pop();
  return res.json({ logged: true });
});

// XML/TXT Generators (Sitemap, Robots)
app.get('/sitemap.xml', async (req, res) => {
  res.header('Content-Type', 'application/xml');
  const services = await prisma.service.findMany({ where: { isEnabled: true } });
  const blogs = await prisma.blogPost.findMany({ where: { status: 'PUBLISHED' } });

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://blspaintingworks.com/</loc><priority>1.0</priority></url>
  <url><loc>https://blspaintingworks.com/about</loc><priority>0.8</priority></url>
  <url><loc>https://blspaintingworks.com/services</loc><priority>0.8</priority></url>
  <url><loc>https://blspaintingworks.com/gallery</loc><priority>0.7</priority></url>
  <url><loc>https://blspaintingworks.com/blog</loc><priority>0.7</priority></url>
  <url><loc>https://blspaintingworks.com/contact</loc><priority>0.8</priority></url>`;

  services.forEach(s => {
    sitemap += `\n  <url><loc>https://blspaintingworks.com/services/${s.slug}</loc><priority>0.8</priority></url>`;
  });

  blogs.forEach(b => {
    sitemap += `\n  <url><loc>https://blspaintingworks.com/blog/${b.slug}</loc><priority>0.6</priority></url>`;
  });

  sitemap += '\n</urlset>';
  return res.send(sitemap);
});

app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  return res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://blspaintingworks.com/sitemap.xml`);
});

app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  try {
    await autoSeedDatabase();
  } catch (err) {
    console.error('Auto-seeding failed on startup:', err);
  }
});
