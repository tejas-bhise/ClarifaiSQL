'use client';
import { useEffect, useState } from 'react';

interface Feedback {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
}

export default function AdminPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: number | null}>({show: false, id: null});
  const [deleting, setDeleting] = useState(false);
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [phoneFilter, setPhoneFilter] = useState('all');

  // Handle admin authentication
  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setAuthError('');

    try {
      const response = await fetch('http://localhost:8000/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_key', adminKey);
        fetchFeedbacks(adminKey);
      } else {
        setAuthError('Invalid admin key. Access denied.');
      }
    } catch (err) {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  // Fetch feedbacks with admin key
  const fetchFeedbacks = async (key: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/admin/feedbacks', {
        headers: {
          'X-Admin-Key': key,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks || []);
        setFilteredFeedbacks(data.feedbacks || []);
      } else {
        setError('Failed to load feedbacks');
        setIsAuthenticated(false);
        localStorage.removeItem('admin_key');
      }
    } catch (err) {
      setError('Backend not running');
    } finally {
      setLoading(false);
    }
  };

  // Check for saved admin key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
      setIsAuthenticated(true);
      fetchFeedbacks(savedKey);
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = feedbacks;

    if (searchTerm) {
      filtered = filtered.filter(fb => 
        fb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(fb => {
        const feedbackDate = new Date(fb.created_at);
        
        switch(dateFilter) {
          case 'today':
            return feedbackDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return feedbackDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return feedbackDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    if (phoneFilter !== 'all') {
      filtered = filtered.filter(fb => 
        phoneFilter === 'with-phone' ? fb.phone : !fb.phone
      );
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, searchTerm, dateFilter, phoneFilter]);

  // Delete feedback
  const handleDelete = async () => {
    if (!deleteModal.id) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:8000/admin/feedback/${deleteModal.id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Key': adminKey,
        },
      });
      
      if (response.ok) {
        setFeedbacks(prev => prev.filter(fb => fb.id !== deleteModal.id));
        setDeleteModal({show: false, id: null});
        alert('✅ Feedback deleted successfully!');
      } else {
        alert('❌ Failed to delete feedback. Unauthorized or error.');
      }
    } catch (error) {
      alert('❌ Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setPhoneFilter('all');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminKey('');
    setFeedbacks([]);
    setFilteredFeedbacks([]);
    localStorage.removeItem('admin_key');
  };

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-lg shadow-lg border max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
            <p className="text-muted-foreground">Enter your secret admin key to view feedbacks</p>
          </div>

          <form onSubmit={handleAuthentication} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter your secret admin key"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {authError && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authenticating}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {authenticating ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feedbacks...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg shadow-sm border p-8 text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={handleLogout} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Feedback Management
                </span>
              </h1>
              <p className="text-muted-foreground mt-2">Manage and review user feedback</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-primary">
                  📊 {filteredFeedbacks.length} of {feedbacks.length} feedbacks
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">🔍 Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search</label>
              <input
                type="text"
                placeholder="Search name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
              <select
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All</option>
                <option value="with-phone">With Phone</option>
                <option value="without-phone">Without Phone</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">
                {feedbacks.length === 0 ? 'No Feedbacks Yet' : 'No Results Found'}
              </h3>
              <p className="text-muted-foreground">
                {feedbacks.length === 0 
                  ? 'Share your feedback form to start receiving user input!'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">👤 User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">📞 Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">💬 Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">📅 Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">⚡ Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFeedbacks.map((fb, index) => (
                    <tr key={fb.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {fb.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">{fb.name}</div>
                            <div className="text-sm text-muted-foreground">ID: #{fb.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <a href={`mailto:${fb.email}`} className="text-primary hover:underline">
                            {fb.email}
                          </a>
                          <div className="text-sm text-muted-foreground">
                            {fb.phone ? (
                              <a href={`tel:${fb.phone}`} className="text-primary hover:underline">
                                📱 {fb.phone}
                              </a>
                            ) : (
                              '❌ No phone'
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2" title={fb.message}>
                            {fb.message}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(fb.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const text = `Name: ${fb.name}\nEmail: ${fb.email}\nPhone: ${fb.phone || 'Not provided'}\nMessage: ${fb.message}\nDate: ${fb.created_at}`;
                              navigator.clipboard.writeText(text);
                              alert('✅ Feedback copied!');
                            }}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            📋 Copy
                          </button>
                          <button
                            onClick={() => setDeleteModal({show: true, id: fb.id})}
                            className="bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg shadow-xl border max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Delete Feedback</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete this feedback? This will permanently remove it from the system.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteModal({show: false, id: null})}
                    disabled={deleting}
                    className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
