import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Package, ShoppingCart, DollarSign, Plus, Edit2, Trash2, X, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

import type { Product } from '../types';
import { readStoredToken, storeToken, readError } from '../lib/adminSession';

const MIN_PASSWORD_LENGTH = 8;

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboardError, setDashboardError] = useState('');
  
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: ''
  });

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchOrders();
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    storeToken(null);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        setToken(data.token);
        storeToken(data.token);
        setPassword('');
        setDashboardError('');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Error connecting to server');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(await readError(res, 'Could not load products.'));
      setProducts(await res.json());
    } catch (error: any) {
      setDashboardError(error?.message || 'Could not load products.');
    }
  };

  // Returns false (and signs out) when the session is no longer valid.
  const checkSession = (res: Response) => {
    if (res.status === 401) {
      handleLogout();
      setLoginError('Your session has expired. Please log in again.');
      return false;
    }
    return true;
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!checkSession(res)) return;
      if (!res.ok) throw new Error(await readError(res, 'Could not load orders.'));
      setOrders(await res.json());
    } catch (error: any) {
      setDashboardError(error?.message || 'Could not load orders.');
    }
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const price = parseFloat(formData.price);
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Enter a price greater than 0.');
      return;
    }
    const payload = {
      name: formData.name,
      price,
      image: formData.image,
      category: formData.category
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    setIsSaving(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!checkSession(res)) return;
      if (!res.ok) {
        setFormError(await readError(res, 'The product could not be saved.'));
        return;
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch {
      setFormError('Error connecting to server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setDashboardError('');
      try {
        const res = await fetch(`/api/products/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!checkSession(res)) return;
        if (!res.ok) setDashboardError(await readError(res, 'The product could not be deleted.'));
      } catch {
        setDashboardError('Error connecting to server');
      }
      fetchProducts();
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        category: product.category
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', image: '', category: '' });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    setDashboardError('');
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!checkSession(res)) return;
      if (!res.ok) setDashboardError(await readError(res, 'The order status could not be updated.'));
    } catch {
      setDashboardError('Error connecting to server');
    }
    fetchOrders();
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordMessage({ type: 'error', text: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        // The server signs out other sessions and returns a fresh token for this one.
        if (data.token) {
          setToken(data.token);
          storeToken(data.token);
        }
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif font-bold text-gray-900">Admin Login</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your password to access the dashboard.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                id="admin-password"
                type="password" 
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-900 focus:outline-none" 
                required
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">
              Login
            </button>
            <Link to="/" className="block text-center text-sm text-gray-500 hover:text-gray-900 mt-4 transition-colors">
              &larr; Return to Storefront
            </Link>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Admin Panel</h1>
            <Link to="/" className="text-sm text-gray-500 hover:text-primary transition-colors mt-1 inline-block">
              &larr; Back to Store
            </Link>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id ? 'bg-[#F3E5AB] text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 min-w-0">
        {/* The sidebar is hidden on small screens, so they get the same tabs here. */}
        <div className="md:hidden mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-serif font-bold text-gray-900">Admin Panel</h1>
            <button onClick={handleLogout} className="text-sm text-red-600 font-medium">
              Logout
            </button>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === item.id ? 'bg-[#F3E5AB] text-gray-900' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>
          <Link to="/" className="text-sm text-gray-500 hover:text-primary transition-colors mt-3 inline-block">
            &larr; Back to Store
          </Link>
        </div>
        {dashboardError && (
          <p role="alert" className="mb-6 text-sm text-red-600">{dashboardError}</p>
        )}
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-lg"><ShoppingCart size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Package size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Active Products</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Products</h2>
              <button 
                onClick={() => openModal()}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openModal(product)} aria-label={`Edit ${product.name}`} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} aria-label={`Delete ${product.name}`} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Orders</h2>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders yet.</td></tr>
                  ) : orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_email}</p>
                        {order.items.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          aria-label={`Status of order #${order.id}`}
                          className="text-sm border border-gray-200 rounded p-1"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Settings</h2>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Admin Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input 
                    id="current-password"
                    type="password" 
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-900 focus:outline-none" 
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    id="new-password"
                    type="password" 
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-900 focus:outline-none" 
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    id="confirm-password"
                    type="password" 
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-900 focus:outline-none" 
                    required
                  />
                </div>
                {passwordMessage.text && (
                  <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {passwordMessage.text}
                  </p>
                )}
                <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">
                  Update Password
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </main>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsModalOpen(false)} aria-label="Close" className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input id="product-name" required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">Base Price (in USD, converts automatically)</label>
                <input id="product-price" required type="number" step="0.01" min="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input id="product-category" required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label htmlFor="product-image" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input id="product-image" required type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
              <button type="submit" disabled={isSaving} className="w-full bg-gray-900 text-white py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-70">
                {isSaving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
