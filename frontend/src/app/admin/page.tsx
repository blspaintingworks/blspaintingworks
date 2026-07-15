'use client';

import { useState, useEffect } from 'react';
import { apiRequest, BACKEND_URL } from '@/utils/api';
import { 
  LayoutDashboard, Settings, UserCheck, Layers, FileText, Image, 
  MessageSquare, HelpCircle, PhoneCall, AlertTriangle, ShieldCheck, 
  LogOut, Plus, Edit, Trash2, Check, X, Star, FileSpreadsheet, 
  ArrowUpRight, Palette, Lock, Sliders, RefreshCw, Upload, Eye, ToggleLeft, ToggleRight
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // CMS Resources States
  const [stats, setStats] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [theme, setTheme] = useState<any>(null);
  const [website, setWebsite] = useState<any>(null);
  const [popups, setPopups] = useState<any[]>([]);
  const [googleReviews, setGoogleReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Page Builder content states
  const [heroContent, setHeroContent] = useState<any>(null);
  const [aboutContent, setAboutContent] = useState<any>(null);
  const [pageContentId, setPageContentId] = useState<string>('');
  const [aboutContentId, setAboutContentId] = useState<string>('');

  // Form states for adding/editing items
  const [editingItem, setEditingItem] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({ title: '', slug: '', description: '', content: '', imageUrl: '', iconName: 'Paintbrush', pricing: '', isEnabled: true, imageUrlsJson: '[]' });
  const [projectForm, setProjectForm] = useState({ title: '', slug: '', description: '', beforeImageUrl: '', afterImageUrl: '', imageUrlsJson: '[]', albumName: 'General', location: '', projectDate: '', clientName: '', isFeatured: false });
  const [blogForm, setBlogForm] = useState({ title: '', slug: '', content: '', summary: '', featuredImageUrl: '', category: 'General', tagsJson: '[]', status: 'DRAFT', seoTitle: '', seoMetaDesc: '' });
  const [testimonialForm, setTestimonialForm] = useState({ customerName: '', customerRole: 'Homeowner', customerPhotoUrl: '', content: '', rating: 5, isFeatured: false, isApproved: true });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', isEnabled: true });
  const [popupForm, setPopupForm] = useState({ name: '', type: 'BANNER', title: '', content: '', imageUrl: '', ctaText: '', ctaUrl: '', isEnabled: false });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'EDITOR' });
  const [leadFilter, setLeadFilter] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaUploadFile, setMediaUploadFile] = useState<File | null>(null);

  // Authenticate user check
  useEffect(() => {
    apiRequest('/auth/me')
      .then((data) => {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // Fetch data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadAllCmsData();
    }
  }, [isAuthenticated]);

  const loadAllCmsData = () => {
    // Stats
    apiRequest('/analytics/dashboard').then(data => setStats(data)).catch(() => {});
    // Services
    apiRequest('/services').then(data => setServices(data)).catch(() => {});
    // Projects
    apiRequest('/projects').then(data => setProjects(data)).catch(() => {});
    // Testimonials
    apiRequest('/testimonials').then(data => setTestimonials(data)).catch(() => {});
    // FAQs
    apiRequest('/faqs').then(data => setFaqs(data)).catch(() => {});
    // Blogs
    apiRequest('/blogs').then(data => setBlogs(data)).catch(() => {});
    // Leads (Quote Requests)
    apiRequest('/quote-requests').then(data => setLeads(data)).catch(() => {});
    // Audit Logs
    apiRequest('/audit-logs').then(data => setAuditLogs(data)).catch(() => {});
    // Theme
    apiRequest('/settings/theme').then(data => setTheme(data)).catch(() => {});
    // Website Settings
    apiRequest('/settings/website').then(data => setWebsite(data)).catch(() => {});
    // Popups
    apiRequest('/popups').then(data => setPopups(data)).catch(() => {});
    // Google Reviews
    apiRequest('/reviews').then(data => setGoogleReviews(data)).catch(() => {});
    // User management
    apiRequest('/users').then(data => setUsers(data)).catch(() => {});
    // Media Library
    apiRequest('/media').then(data => setMediaFiles(data)).catch(() => {});

    // Homepage content sections
    apiRequest('/page-content')
      .then(data => {
        const heroSec = data.find((s: any) => s.sectionName === 'hero');
        if (heroSec) {
          setPageContentId(heroSec.id);
          setHeroContent(JSON.parse(heroSec.contentJson));
        }
        const aboutSec = data.find((s: any) => s.sectionName === 'about');
        if (aboutSec) {
          setAboutContentId(aboutSec.id);
          setAboutContent(JSON.parse(aboutSec.contentJson));
        }
      })
      .catch(() => {});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      setCurrentUser(res.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (err) {}
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // --- ACTIONS & CRUD CREATORS ---

  // Save Website / Theme
  const saveThemeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiRequest('/settings/theme', {
        method: 'PUT',
        body: JSON.stringify(theme)
      });
      setTheme(updated);
      alert('Theme colors and styles saved successfully.');
    } catch (err) {
      alert('Failed to save theme settings.');
    }
  };

  const saveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiRequest('/settings/website', {
        method: 'PUT',
        body: JSON.stringify(website)
      });
      setWebsite(updated);
      alert('Website metadata and contact settings updated.');
    } catch (err) {
      alert('Failed to save settings.');
    }
  };

  // Save Homepage Editor sections
  const saveHomepageHero = async () => {
    try {
      await apiRequest(`/page-content/${pageContentId}`, {
        method: 'PUT',
        body: JSON.stringify({ contentJson: heroContent })
      });
      alert('Homepage Hero section contents updated live.');
    } catch (err) {
      alert('Failed to update Hero layout.');
    }
  };

  const saveHomepageAbout = async () => {
    try {
      await apiRequest(`/page-content/${aboutContentId}`, {
        method: 'PUT',
        body: JSON.stringify({ contentJson: aboutContent })
      });
      alert('Homepage About story updated live.');
    } catch (err) {
      alert('Failed to update About content.');
    }
  };

  // Generic Save / Update for CRUDs
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingItem ? `/services/${editingItem.id}` : '/services';
    const method = editingItem ? 'PUT' : 'POST';
    try {
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify(serviceForm)
      });
      setEditingItem(null);
      setServiceForm({ title: '', slug: '', description: '', content: '', imageUrl: '', iconName: 'Paintbrush', pricing: '', isEnabled: true, imageUrlsJson: '[]' });
      loadAllCmsData();
    } catch (err) {}
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiRequest(`/services/${id}`, { method: 'DELETE' });
      loadAllCmsData();
    } catch (err) {}
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingItem ? `/projects/${editingItem.id}` : '/projects';
    const method = editingItem ? 'PUT' : 'POST';
    try {
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify(projectForm)
      });
      setEditingItem(null);
      setProjectForm({ title: '', slug: '', description: '', beforeImageUrl: '', afterImageUrl: '', imageUrlsJson: '[]', albumName: 'General', location: '', projectDate: '', clientName: '', isFeatured: false });
      loadAllCmsData();
    } catch (err) {}
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await apiRequest(`/projects/${id}`, { method: 'DELETE' });
      loadAllCmsData();
    } catch (err) {}
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingItem ? `/blogs/${editingItem.id}` : '/blogs';
    const method = editingItem ? 'PUT' : 'POST';
    try {
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify(blogForm)
      });
      setEditingItem(null);
      setBlogForm({ title: '', slug: '', content: '', summary: '', featuredImageUrl: '', category: 'General', tagsJson: '[]', status: 'PUBLISHED', seoTitle: '', seoMetaDesc: '' });
      loadAllCmsData();
    } catch (err) {}
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await apiRequest(`/blogs/${id}`, { method: 'DELETE' });
      loadAllCmsData();
    } catch (err) {}
  };

  // Quote Request / Lead Status & Notes
  const handleUpdateLead = async (id: string, status: string, notes: string) => {
    try {
      await apiRequest(`/quote-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, internalNotes: notes })
      });
      loadAllCmsData();
    } catch (err) {}
  };

  // Popup / Offers Manager
  const handleSavePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingItem ? `/popups/${editingItem.id}` : '/popups';
    const method = editingItem ? 'PUT' : 'POST';
    try {
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify(popupForm)
      });
      setEditingItem(null);
      setPopupForm({ name: '', type: 'BANNER', title: '', content: '', imageUrl: '', ctaText: '', ctaUrl: '', isEnabled: false });
      loadAllCmsData();
    } catch (err) {}
  };

  const handleTogglePopup = async (id: string, isEnabled: boolean) => {
    try {
      const target = popups.find(p => p.id === id);
      if (!target) return;
      await apiRequest(`/popups/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...target, isEnabled })
      });
      loadAllCmsData();
    } catch (err) {}
  };

  // Google reviews approval toggle
  const handleToggleReviewApproval = async (id: string, isApproved: boolean) => {
    try {
      await apiRequest(`/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isApproved })
      });
      loadAllCmsData();
    } catch (err) {}
  };

  const handleImportGoogleReviews = async () => {
    try {
      const res = await apiRequest('/reviews/import', { method: 'POST' });
      alert(res.message);
      loadAllCmsData();
    } catch (err) {
      alert('Failed to connect to Google Places API.');
    }
  };

  // Media Library helpers
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUploadFile) return;
    const formData = new FormData();
    formData.append('file', mediaUploadFile);
    formData.append('folder', 'general');

    try {
      await apiRequest('/media/upload', {
        method: 'POST',
        body: formData
      });
      setMediaUploadFile(null);
      loadAllCmsData();
    } catch (err) {
      alert('Failed to upload file.');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Permanently delete file?')) return;
    try {
      await apiRequest(`/media/${id}`, { method: 'DELETE' });
      loadAllCmsData();
    } catch (err) {}
  };

  // User management admin creators
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingItem ? `/users/${editingItem.id}` : '/users';
    const method = editingItem ? 'PUT' : 'POST';
    try {
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify(userForm)
      });
      setEditingItem(null);
      setUserForm({ name: '', email: '', password: '', role: 'EDITOR' });
      loadAllCmsData();
      alert(editingItem ? 'User details updated successfully.' : 'User created successfully.');
    } catch (err) {
      alert('Failed to save user. Email may be taken.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      loadAllCmsData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  // CSV Mock exporter
  const exportLeadsToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Phone,Services,Status,Created At\n";
    leads.forEach(l => {
      csvContent += `${l.id},${l.name},${l.email},${l.phone},"${JSON.parse(l.servicesJson).join(', ')}",${l.status},${l.createdAt}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bls_painting_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // RENDER INTERACTION LAYER

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-10 w-10 text-secondary animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-slate-500">Checking auth token...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Glow rings */}
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />

        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl relative z-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-secondary/5 border border-secondary/20 text-secondary rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-800">CMS Administrative Gate</h2>
            <p className="text-xs text-slate-500">Log in to manage public content for BLS Painting Works.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Account Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                placeholder="admin@blspainting.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Secure Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-secondary text-white font-bold rounded-xl shadow-lg shadow-secondary/15 hover:scale-102 transition-transform"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard layout tabs selection
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'hero', name: 'Homepage Editor', icon: <Layers className="h-4 w-4" /> },
    { id: 'popups', name: 'Offers / Popups', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'services', name: 'Services Manager', icon: <Layers className="h-4 w-4" /> },
    { id: 'projects', name: 'Gallery Manager', icon: <Image className="h-4 w-4" /> },
    { id: 'leads', name: 'Quote Requests', icon: <PhoneCall className="h-4 w-4" /> },
    { id: 'reviews', name: 'Review Manager', icon: <Star className="h-4 w-4" /> },
    { id: 'media', name: 'Media Library', icon: <Upload className="h-4 w-4" /> },
    { id: 'settings', name: 'Website Settings', icon: <Settings className="h-4 w-4" /> },
    { id: 'users', name: 'Users / Roles', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'audit', name: 'Audit Logs', icon: <Lock className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* CMS Side Nav */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-secondary to-accent rounded-lg shadow-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-lg tracking-wider text-slate-800">BLS CMS Admin</span>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditingItem(null);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-secondary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{currentUser?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main CMS Center View */}
      <main className="flex-grow p-8 overflow-y-auto">
        
        {/* Render Tab Contents */}

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            <h1 className="font-heading font-bold text-3xl text-slate-800">Website Statistics</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Monthly Visitors</p>
                <h3 className="font-heading font-extrabold text-3xl text-slate-800">{stats.stats.visitors}</h3>
                <span className="text-xs text-green-600 flex items-center">↑ 8.2% vs last month</span>
              </div>
              <div className="glass p-6 rounded-xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Leads Logged</p>
                <h3 className="font-heading font-extrabold text-3xl text-slate-800">{stats.stats.leads}</h3>
                <span className="text-xs text-secondary flex items-center">Inquiries processed</span>
              </div>
              <div className="glass p-6 rounded-xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">SEO Health Score</p>
                <h3 className="font-heading font-extrabold text-3xl text-slate-800">{stats.stats.seoScore}/100</h3>
                <span className="text-xs text-accent flex items-center">Search ranking: Good</span>
              </div>
              <div className="glass p-6 rounded-xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Google Reviews</p>
                <h3 className="font-heading font-extrabold text-3xl text-slate-800">{stats.stats.reviews}</h3>
                <span className="text-xs text-yellow-600 flex items-center">★ 4.9 Average rating</span>
              </div>
            </div>

            {/* Inquiries table */}
            <div className="glass rounded-xl overflow-hidden border border-slate-200/50">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-heading font-bold text-lg text-slate-800">Recent Activities / Leads</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs uppercase text-slate-500 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4">Client Name</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Required Service</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-800">{lead.name}</td>
                        <td className="px-6 py-4">{lead.phone}</td>
                        <td className="px-6 py-4">{JSON.parse(lead.servicesJson).join(', ')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${lead.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' : 'bg-green-500/10 text-green-600 border border-green-500/20'}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Offers & Popups tab */}
        {activeTab === 'popups' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h1 className="font-heading font-bold text-3xl text-slate-800">Promotional Offers & Popups</h1>
              {!editingItem && (
                <button
                  onClick={() => {
                    setEditingItem({ id: 'new' });
                    setPopupForm({ name: '', type: 'BANNER', title: '', content: '', imageUrl: '', ctaText: '', ctaUrl: '', isEnabled: false });
                  }}
                  className="px-4 py-2.5 bg-secondary text-white font-bold rounded-lg flex items-center space-x-2 text-xs shadow-md hover:bg-opacity-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Popup Offer</span>
                </button>
              )}
            </div>

            {editingItem ? (
              <div className="glass p-8 rounded-xl bg-white border border-slate-200/50 shadow-sm max-w-3xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h3 className="font-heading font-bold text-xl text-slate-800">
                    {editingItem.id === 'new' ? 'Create New Offer Popup' : 'Edit Offer Popup'}
                  </h3>
                  <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePopup} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Offer Name / Identifier</label>
                      <input
                        type="text"
                        required
                        value={popupForm.name}
                        onChange={(e) => setPopupForm({ ...popupForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                        placeholder="e.g. Summer Special"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Popup Type</label>
                      <select
                        value={popupForm.type}
                        onChange={(e) => setPopupForm({ ...popupForm, type: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                      >
                        <option value="BANNER">Top Promo Banner</option>
                        <option value="MODAL">Center Modal Overlay</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Offer Title Heading</label>
                    <input
                      type="text"
                      required
                      value={popupForm.title}
                      onChange={(e) => setPopupForm({ ...popupForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                      placeholder="e.g. Summer Painting Special!"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Offer Body Content Description</label>
                    <textarea
                      required
                      rows={3}
                      value={popupForm.content}
                      onChange={(e) => setPopupForm({ ...popupForm, content: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                      placeholder="Describe the offer (e.g. Get 15% off all residential exterior painting bookings this July...)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">CTA Button Text</label>
                      <input
                        type="text"
                        value={popupForm.ctaText}
                        onChange={(e) => setPopupForm({ ...popupForm, ctaText: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                        placeholder="e.g. Claim Discount"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">CTA Button Action URL</label>
                      <input
                        type="text"
                        value={popupForm.ctaUrl}
                        onChange={(e) => setPopupForm({ ...popupForm, ctaUrl: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                        placeholder="e.g. #quote"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Promo Image URL (Optional)</label>
                    <input
                      type="text"
                      value={popupForm.imageUrl}
                      onChange={(e) => setPopupForm({ ...popupForm, imageUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                      placeholder="e.g. /uploads/general/banner.png"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <input
                      type="checkbox"
                      id="isEnabled"
                      checked={popupForm.isEnabled}
                      onChange={(e) => setPopupForm({ ...popupForm, isEnabled: e.target.checked })}
                      className="h-4 w-4 text-secondary border-slate-300 rounded"
                    />
                    <label htmlFor="isEnabled" className="text-sm font-semibold text-slate-700">
                      Enable this offer popup immediately on the site
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-secondary text-white font-bold rounded-lg text-xs shadow-md"
                    >
                      Save Offer Configuration
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="glass p-6 rounded-xl bg-white border border-slate-200/50 shadow-sm space-y-4">
                {popups.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    No offer popups configured yet. Click "Create Popup Offer" above.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {popups.map((p) => (
                      <div key={p.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-800">{p.name || 'Untitled Offer'}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              {p.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{p.title}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {/* Toggle Switch */}
                          <button
                            onClick={() => handleTogglePopup(p.id, !p.isEnabled)}
                            className="focus:outline-none"
                          >
                            {p.isEnabled ? (
                              <ToggleRight className="h-8 w-8 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-8 w-8 text-slate-400" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              setEditingItem(p);
                              setPopupForm({
                                name: p.name || '',
                                type: p.type || 'BANNER',
                                title: p.title || '',
                                content: p.content || '',
                                imageUrl: p.imageUrl || '',
                                ctaText: p.ctaText || '',
                                ctaUrl: p.ctaUrl || '',
                                isEnabled: p.isEnabled || false
                              });
                            }}
                            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Homepage builder section editor */}
        {activeTab === 'hero' && heroContent && aboutContent && (
          <div className="space-y-12">
            <h1 className="font-heading font-bold text-3xl text-slate-800">Homepage Content Editor</h1>
            
            {/* Hero form */}
            <div className="glass p-8 rounded-xl space-y-6">
              <h3 className="font-heading font-bold text-xl text-slate-800 border-b border-slate-100 pb-4">Hero Section Editor</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Headline Title</label>
                  <input
                    type="text"
                    value={heroContent.headline}
                    onChange={(e) => setHeroContent({ ...heroContent, headline: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Hero Image URL</label>
                  <input
                    type="text"
                    value={heroContent.heroImageUrl}
                    onChange={(e) => setHeroContent({ ...heroContent, heroImageUrl: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                  />
                  <div className="mt-2 space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Or select from Media Library:</label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
                      {mediaFiles.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setHeroContent({ ...heroContent, heroImageUrl: m.filepath })}
                          className={`px-2 py-1 bg-slate-100 hover:bg-secondary hover:text-white rounded text-[10px] font-mono truncate max-w-[120px] ${heroContent.heroImageUrl === m.filepath ? 'bg-secondary text-white' : 'text-slate-600'}`}
                        >
                          {m.filename}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Subheading Description</label>
                <textarea
                  rows={3}
                  value={heroContent.subheading}
                  onChange={(e) => setHeroContent({ ...heroContent, subheading: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary resize-none transition-all"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={saveHomepageHero}
                  className="px-6 py-3 bg-secondary text-white font-bold rounded-lg shadow-md hover:bg-opacity-95 hover:scale-102 transition-transform"
                >
                  Save Hero Section Live
                </button>
              </div>
            </div>

            {/* About form */}
            <div className="glass p-8 rounded-xl space-y-6">
              <h3 className="font-heading font-bold text-xl text-slate-800 border-b border-slate-100 pb-4">About Section Editor</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Title</label>
                  <input
                    type="text"
                    value={aboutContent.title}
                    onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Team Photo URL</label>
                  <input
                    type="text"
                    value={aboutContent.photoUrl}
                    onChange={(e) => setAboutContent({ ...aboutContent, photoUrl: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                  />
                  <div className="mt-2 space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Or select from Media Library:</label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
                      {mediaFiles.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setAboutContent({ ...aboutContent, photoUrl: m.filepath })}
                          className={`px-2 py-1 bg-slate-100 hover:bg-secondary hover:text-white rounded text-[10px] font-mono truncate max-w-[120px] ${aboutContent.photoUrl === m.filepath ? 'bg-secondary text-white' : 'text-slate-600'}`}
                        >
                          {m.filename}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Company Story Description</label>
                <textarea
                  rows={4}
                  value={aboutContent.story}
                  onChange={(e) => setAboutContent({ ...aboutContent, story: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary resize-none transition-all"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={saveHomepageAbout}
                  className="px-6 py-3 bg-secondary text-white font-bold rounded-lg"
                >
                  Save About Story Live
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Services Manager tab */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="font-heading font-bold text-3xl text-slate-800">Services Manager</h1>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setServiceForm({ title: '', slug: '', description: '', content: '', imageUrl: '', iconName: 'Paintbrush', pricing: '', isEnabled: true, imageUrlsJson: '[]' });
                }}
                className="px-4 py-2.5 bg-secondary text-white font-bold rounded-lg flex items-center space-x-2 shadow-md hover:bg-opacity-95"
              >
                <Plus className="h-4 w-4" />
                <span>Create Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* List */}
              <div className="lg:col-span-2 space-y-4">
                {services.map((item) => (
                  <div key={item.id} className="glass p-5 rounded-xl flex justify-between items-center bg-white border border-slate-200/50 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `${BACKEND_URL}${item.imageUrl}`} alt={item.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      <div>
                        <h4 className="font-heading font-bold text-lg text-slate-800">{item.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 max-w-sm">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setServiceForm({
                            title: item.title,
                            slug: item.slug,
                            description: item.description,
                            content: item.content,
                            imageUrl: item.imageUrl,
                            iconName: item.iconName,
                            pricing: item.pricing,
                            isEnabled: item.isEnabled,
                            imageUrlsJson: item.imageUrlsJson || '[]'
                          });
                        }}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(item.id)}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit / Create Form */}
              <div className="glass p-6 rounded-xl h-fit space-y-4 bg-white border border-slate-200/50 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">
                  {editingItem ? 'Edit Service' : 'Create Service'}
                </h3>
                <form onSubmit={handleSaveService} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Service Title</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Slug</label>
                    <input
                      type="text"
                      value={serviceForm.slug}
                      onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Card Description</label>
                    <input
                      type="text"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Full Details Markdown</label>
                    <textarea
                      rows={4}
                      value={serviceForm.content}
                      onChange={(e) => setServiceForm({ ...serviceForm, content: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary resize-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Pricing Label</label>
                    <input
                      type="text"
                      value={serviceForm.pricing}
                      onChange={(e) => setServiceForm({ ...serviceForm, pricing: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                      placeholder="e.g. Free Quote / Custom Rate"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Service Image URL</label>
                    <input
                      type="text"
                      value={serviceForm.imageUrl}
                      onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                    <div className="mt-2 space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Or select from Media Library:</label>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
                        {mediaFiles.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, imageUrl: m.filepath })}
                            className={`px-2 py-1 bg-slate-100 hover:bg-secondary hover:text-white rounded text-[10px] font-mono truncate max-w-[120px] ${serviceForm.imageUrl === m.filepath ? 'bg-secondary text-white' : 'text-slate-600'}`}
                          >
                            {m.filename}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Service Showcase Images controller */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-slate-500">Service Project Showcase Images</label>
                    
                    {/* Render current showcase thumbs */}
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-16">
                      {JSON.parse(serviceForm.imageUrlsJson || '[]').length > 0 ? (
                        JSON.parse(serviceForm.imageUrlsJson || '[]').map((imgUrl: string, idx: number) => (
                          <div key={idx} className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 group">
                            <img src={`${BACKEND_URL}${imgUrl}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const current = JSON.parse(serviceForm.imageUrlsJson || '[]');
                                const filtered = current.filter((u: string) => u !== imgUrl);
                                setServiceForm({ ...serviceForm, imageUrlsJson: JSON.stringify(filtered) });
                              }}
                              className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                            >
                              Del
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic my-auto">No showcase images added yet. Click from the list below to add.</span>
                      )}
                    </div>

                    {/* Media library picker */}
                    <div className="mt-2 space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Click to add to showcase:</label>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
                        {mediaFiles.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              const current = JSON.parse(serviceForm.imageUrlsJson || '[]');
                              if (!current.includes(m.filepath)) {
                                setServiceForm({ ...serviceForm, imageUrlsJson: JSON.stringify([...current, m.filepath]) });
                              }
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-accent hover:text-white rounded text-[10px] font-mono truncate max-w-[120px] text-slate-600"
                          >
                            + {m.filename}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-secondary text-white font-bold rounded-lg shadow-md hover:bg-opacity-95"
                  >
                    Save Service
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Projects / Gallery Manager */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="font-heading font-bold text-3xl text-slate-800">Gallery Manager</h1>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setProjectForm({ title: '', slug: '', description: '', beforeImageUrl: '', afterImageUrl: '', imageUrlsJson: '[]', albumName: 'General', location: '', projectDate: '', clientName: '', isFeatured: false });
                }}
                className="px-4 py-2.5 bg-secondary text-white font-bold rounded-lg flex items-center space-x-2 shadow-md hover:bg-opacity-95"
              >
                <Plus className="h-4 w-4" />
                <span>Create Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* List */}
              <div className="lg:col-span-2 space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="glass p-5 rounded-xl flex justify-between items-center bg-white border border-slate-200/50 shadow-sm animate-fadeIn">
                    <div className="flex items-center space-x-4">
                      <img src={proj.afterImageUrl.startsWith('http') ? proj.afterImageUrl : `${BACKEND_URL}${proj.afterImageUrl}`} alt={proj.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      <div>
                        <h4 className="font-heading font-bold text-lg text-slate-800">{proj.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-bold text-accent uppercase">{proj.albumName}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setEditingItem(proj);
                          setProjectForm({
                            title: proj.title,
                            slug: proj.slug,
                            description: proj.description,
                            beforeImageUrl: proj.beforeImageUrl,
                            afterImageUrl: proj.afterImageUrl,
                            imageUrlsJson: proj.imageUrlsJson,
                            albumName: proj.albumName,
                            location: proj.location,
                            projectDate: proj.projectDate,
                            clientName: proj.clientName,
                            isFeatured: proj.isFeatured
                          });
                        }}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="glass p-6 rounded-xl h-fit space-y-4 bg-white border border-slate-200/50 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">
                  {editingItem ? 'Edit Project' : 'Create Project'}
                </h3>
                <form onSubmit={handleSaveProject} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Project Title</label>
                    <input
                      type="text"
                      required
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Album Name</label>
                    <input
                      type="text"
                      value={projectForm.albumName}
                      onChange={(e) => setProjectForm({ ...projectForm, albumName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                      placeholder="e.g. Interior / Exterior / Commercial"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Before Image URL</label>
                    <input
                      type="text"
                      value={projectForm.beforeImageUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, beforeImageUrl: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">After Image URL</label>
                    <input
                      type="text"
                      value={projectForm.afterImageUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, afterImageUrl: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary"
                    />
                    <div className="mt-2 space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Or select from Media Library:</label>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
                        {mediaFiles.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setProjectForm({ ...projectForm, afterImageUrl: m.filepath })}
                            className={`px-2 py-1 bg-slate-100 hover:bg-secondary hover:text-white rounded text-[10px] font-mono truncate max-w-[120px] ${projectForm.afterImageUrl === m.filepath ? 'bg-secondary text-white' : 'text-slate-600'}`}
                          >
                            {m.filename}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-secondary text-white font-bold rounded-lg shadow-md hover:bg-opacity-95"
                  >
                    Save Project
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Blogs CMS */}
        {activeTab === 'blogs' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="font-heading font-bold text-3xl text-slate-800">Blog CMS</h1>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setBlogForm({ title: '', slug: '', content: '', summary: '', featuredImageUrl: '', category: 'General', tagsJson: '[]', status: 'PUBLISHED', seoTitle: '', seoMetaDesc: '' });
                }}
                className="px-4 py-2.5 bg-secondary text-white font-bold rounded-lg flex items-center space-x-2 shadow-md hover:bg-opacity-95"
              >
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* List */}
              <div className="lg:col-span-2 space-y-4">
                {blogs.map((b) => (
                  <div key={b.id} className="glass p-5 rounded-xl flex justify-between items-center bg-white border border-slate-200/50 shadow-sm animate-fadeIn">
                    <div className="flex items-center space-x-4">
                      <img src={b.featuredImageUrl.startsWith('http') ? b.featuredImageUrl : `${BACKEND_URL}${b.featuredImageUrl}`} alt={b.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      <div>
                        <h4 className="font-heading font-bold text-lg text-slate-800">{b.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-bold text-accent uppercase">{b.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setEditingItem(b);
                          setBlogForm({
                            title: b.title,
                            slug: b.slug,
                            content: b.content,
                            summary: b.summary,
                            featuredImageUrl: b.featuredImageUrl,
                            category: b.category,
                            tagsJson: b.tagsJson,
                            status: b.status,
                            seoTitle: b.seoTitle,
                            seoMetaDesc: b.seoMetaDesc
                          });
                        }}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(b.id)}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="glass p-6 rounded-xl h-fit space-y-4 bg-white border border-slate-200/50 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">
                  {editingItem ? 'Edit Blog Post' : 'Create Blog Post'}
                </h3>
                <form onSubmit={handleSaveBlog} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Post Title</label>
                    <input
                      type="text"
                      required
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Summary</label>
                    <input
                      type="text"
                      value={blogForm.summary}
                      onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Featured Image URL</label>
                    <input
                      type="text"
                      value={blogForm.featuredImageUrl}
                      onChange={(e) => setBlogForm({ ...blogForm, featuredImageUrl: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary"
                    />
                    <div className="mt-2 space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Or select from Media Library:</label>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
                        {mediaFiles.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setBlogForm({ ...blogForm, featuredImageUrl: m.filepath })}
                            className={`px-2 py-1 bg-slate-100 hover:bg-secondary hover:text-white rounded text-[10px] font-mono truncate max-w-[120px] ${blogForm.featuredImageUrl === m.filepath ? 'bg-secondary text-white' : 'text-slate-600'}`}
                          >
                            {m.filename}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-secondary text-white font-bold rounded-lg shadow-md hover:bg-opacity-95"
                  >
                    Save Blog Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Media Library */}
        {activeTab === 'media' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="font-heading font-bold text-3xl text-slate-800">Media Library</h1>
              
              <form onSubmit={handleMediaUpload} className="flex items-center space-x-3">
                <input
                  type="file"
                  onChange={(e) => setMediaUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="text-xs text-slate-600 border border-slate-200 rounded-lg p-2 bg-slate-50"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-secondary text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-md hover:bg-opacity-95"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {mediaFiles.map((m) => (
                <div key={m.id} className="glass p-3 rounded-lg flex flex-col justify-between space-y-3 relative bg-white border border-slate-200/50 shadow-sm group">
                  <div className="h-28 rounded-md overflow-hidden bg-slate-100 relative border border-slate-200/40">
                    {m.filetype.startsWith('image/') ? (
                      <img src={m.filepath.startsWith('http') ? m.filepath : `${BACKEND_URL}${m.filepath}`} alt={m.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold bg-slate-100">
                        {m.filetype}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] truncate font-semibold text-slate-600 px-1">
                    {m.filename}
                  </div>
                  <button
                    onClick={() => handleDeleteMedia(m.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quote Request Leads manager */}
        {activeTab === 'leads' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="font-heading font-bold text-3xl text-slate-800">Quote Request Lead Manager</h1>
              <div className="flex space-x-3">
                <button
                  onClick={exportLeadsToCSV}
                  className="px-4 py-2.5 bg-secondary text-white font-bold rounded-lg flex items-center space-x-2 text-xs shadow-md"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="glass p-6 rounded-xl space-y-6 bg-white border border-slate-200/50 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex space-x-2">
                  {['', 'PENDING', 'CONTACTED', 'QUOTATION_SENT', 'COMPLETED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setLeadFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${leadFilter === st ? 'bg-secondary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {st || 'ALL'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {leads
                  .filter(l => !leadFilter || l.status === leadFilter)
                  .map((lead) => (
                    <div key={lead.id} className="p-6 bg-slate-50 border border-slate-200/60 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-6 items-start shadow-sm">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-lg leading-tight">{lead.name}</h4>
                        <p className="text-xs text-slate-400">Submitted: {new Date(lead.createdAt).toLocaleString()}</p>
                        <p className="text-sm text-secondary font-semibold">{lead.phone}</p>
                        <p className="text-xs text-slate-500">{lead.email}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Required Services</span>
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(lead.servicesJson).map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Message details</span>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{lead.message}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Lead Status</label>
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateLead(lead.id, e.target.value, lead.internalNotes)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-secondary transition-all"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="QUOTATION_SENT">QUOTATION SENT</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Internal Notes</label>
                          <input
                            type="text"
                            value={lead.internalNotes}
                            onChange={(e) => handleUpdateLead(lead.id, lead.status, e.target.value)}
                            placeholder="Add notes..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-secondary transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Website general settings */}
        {activeTab === 'settings' && website && (
          <div className="space-y-8">
            <h1 className="font-heading font-bold text-3xl text-slate-800">General Website Settings</h1>
            
            <form onSubmit={saveWebsiteSettings} className="glass p-8 rounded-xl space-y-6 bg-white border border-slate-200/50 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Business Name</label>
                  <input
                    type="text"
                    value={website.businessName}
                    onChange={(e) => setWebsite({ ...website, businessName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Contact Email</label>
                  <input
                    type="email"
                    value={website.email}
                    onChange={(e) => setWebsite({ ...website, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Phone Contact</label>
                  <input
                    type="text"
                    value={website.phone}
                    onChange={(e) => setWebsite({ ...website, phone: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">WhatsApp Link Number</label>
                  <input
                    type="text"
                    value={website.whatsapp}
                    onChange={(e) => setWebsite({ ...website, whatsapp: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Google Places API Key (For Reviews Sync)</label>
                  <input
                    type="password"
                    value={website.googlePlacesApiKey || ''}
                    onChange={(e) => setWebsite({ ...website, googlePlacesApiKey: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    placeholder="AIzaSy..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Google Place ID</label>
                  <input
                    type="text"
                    value={website.googlePlaceId || ''}
                    onChange={(e) => setWebsite({ ...website, googlePlaceId: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    placeholder="ChIJ..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Physical Address</label>
                <input
                  type="text"
                  value={website.address}
                  onChange={(e) => setWebsite({ ...website, address: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Google Reviews Embed Widget Code (No Card / API Key Needed)</label>
                <textarea
                  rows={4}
                  value={website.reviewsWidgetCode || ''}
                  onChange={(e) => setWebsite({ ...website, reviewsWidgetCode: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all font-mono text-xs"
                  placeholder="Paste your free Elfsight, Trustindex, or Google reviews widget script/iframe here..."
                />
                <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">
                  Use websites like Trustindex.io or Elfsight.com to connect your business profile for free. Copy the generated script/iframe and paste it here to display live Google Reviews without paying Google or registering a credit card.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-secondary text-white font-bold rounded-lg shadow-md hover:bg-opacity-95"
                >
                  Save Settings Live
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Audit Logs tab */}
        {activeTab === 'audit' && (
          <div className="space-y-8">
            <h1 className="font-heading font-bold text-3xl text-slate-800">System Security Audit Logs</h1>
            
            <div className="glass rounded-xl overflow-hidden border border-slate-200/50 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs uppercase text-slate-500 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Log Details</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-800">{log.action}</td>
                        <td className="px-6 py-4 text-xs text-slate-600">{log.details}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Google Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="font-heading font-bold text-3xl text-slate-800">Google Review Manager</h1>
              <button
                onClick={handleImportGoogleReviews}
                className="px-4 py-2.5 bg-secondary text-white font-bold rounded-lg flex items-center space-x-2 text-xs shadow-md hover:bg-opacity-95"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Import Google Reviews</span>
              </button>
            </div>

            <div className="glass p-6 rounded-xl space-y-4 bg-white border border-slate-200/50 shadow-sm">
              {googleReviews.map((r) => (
                <div key={r.id} className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl flex justify-between items-center shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{r.reviewerName}</span>
                      <span className="text-[10px] text-slate-500">{r.reviewDate}</span>
                    </div>
                    <div className="flex space-x-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 italic">"{r.content}"</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleReviewApproval(r.id, !r.isApproved)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 ${r.isApproved ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}
                    >
                      {r.isApproved ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      <span>{r.isApproved ? 'Approved' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users / Roles tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <h1 className="font-heading font-bold text-3xl text-slate-800">Administrative Users</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="glass p-5 rounded-xl flex justify-between items-center bg-white border border-slate-200/50 shadow-sm">
                    <div>
                      <h4 className="font-heading font-bold text-lg text-slate-800">{u.name}</h4>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-accent uppercase">
                        {u.role}
                      </span>
                      <button
                        onClick={() => {
                          setEditingItem(u);
                          setUserForm({
                            name: u.name,
                            email: u.email,
                            password: '', // Blank, change if typed
                            role: u.role
                          });
                        }}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass p-6 rounded-xl h-fit space-y-4 bg-white border border-slate-200/50 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">
                  {editingItem ? 'Edit User Credentials' : 'Add New Administrator'}
                </h3>
                <form onSubmit={handleSaveUser} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Full Name</label>
                    <input
                      type="text"
                      required
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Email Address</label>
                    <input
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Password {editingItem && '(leave blank to keep current)'}</label>
                    <input
                      type="password"
                      required={!editingItem}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">User Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary transition-all"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="MANAGER">MANAGER</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-secondary text-white font-bold rounded-lg shadow-md hover:bg-opacity-95"
                  >
                    {editingItem ? 'Save User Live' : 'Create User'}
                  </button>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(null);
                        setUserForm({ name: '', email: '', password: '', role: 'EDITOR' });
                      }}
                      className="w-full py-2 bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-200 text-xs"
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
