import { useState, useEffect } from 'react';
import { Bell, Users, Shield, Clock, Save, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { API_URL } from '@/config';

export default function SettingsPage() {
  const [slaSettings, setSlaSettings] = useState({
    p1_ack_mins: 15,
    p1_res_mins: 120,
    p2_ack_mins: 30,
    p2_res_mins: 480,
    p3_ack_hours: 2,
    p3_res_hours: 48
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isSavingSla, setIsSavingSla] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [slaRes, catRes] = await Promise.all([
        fetch(`${API_URL}/api/settings/sla`),
        fetch(`${API_URL}/api/settings/categories`)
      ]);
      
      if (slaRes.ok) {
        const slaData = await slaRes.json();
        setSlaSettings(slaData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch settings data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlaChange = (field: string, value: number) => {
    setSlaSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSla = async () => {
    setIsSavingSla(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/sla`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slaSettings)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        throw new Error('Failed to save SLA settings');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save SLA settings');
    } finally {
      setIsSavingSla(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setIsAddingCategory(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(prev => [...prev, data]);
        setNewCategory('');
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to add category');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to add category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/settings/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 style={{ color: 'var(--text-primary)' }} className="font-display text-lg sm:text-xl lg:text-2xl font-medium">Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="font-body text-xs sm:text-sm mt-1">Configure platform settings and preferences</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} className="flex items-center gap-2 p-3 rounded-lg mb-6 max-w-sm">
          <AlertCircle size={16} style={{ color: '#DC2626' }} />
          <span style={{ color: '#DC2626' }} className="font-body text-sm">{error}</span>
        </div>
      )}

      {/* SLA Settings */}
      <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div style={{ backgroundColor: '#F59E0B15' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Clock size={16} style={{ color: '#F59E0B' }} />
          </div>
          <h3 style={{ color: 'var(--text-primary)' }} className="font-display text-xs sm:text-sm font-medium">SLA Configuration</h3>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <h4 style={{ color: '#EF4444' }} className="font-display text-xs uppercase tracking-widest mb-3 sm:mb-4">P1 — Critical</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label style={{ color: 'var(--text-secondary)' }} className="block font-body text-xs mb-2">Acknowledge By (minutes)</label>
                <input
                  type="number"
                  value={slaSettings.p1_ack_mins}
                  onChange={(e) => handleSlaChange('p1_ack_mins', Number(e.target.value))}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg font-mono text-sm outline-none" style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)' }} className="block font-body text-xs mb-2">Resolve By (minutes)</label>
                <input
                  type="number"
                  value={slaSettings.p1_res_mins}
                  onChange={(e) => handleSlaChange('p1_res_mins', Number(e.target.value))}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg font-mono text-sm outline-none" style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h4 style={{ color: '#F59E0B' }} className="font-display text-xs uppercase tracking-widest mb-3 sm:mb-4">P2 — High</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label style={{ color: 'var(--text-secondary)' }} className="block font-body text-xs mb-2">Acknowledge By (minutes)</label>
                <input
                  type="number"
                  value={slaSettings.p2_ack_mins}
                  onChange={(e) => handleSlaChange('p2_ack_mins', Number(e.target.value))}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg font-mono text-sm outline-none" style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)' }} className="block font-body text-xs mb-2">Resolve By (minutes)</label>
                <input
                  type="number"
                  value={slaSettings.p2_res_mins}
                  onChange={(e) => handleSlaChange('p2_res_mins', Number(e.target.value))}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg font-mono text-sm outline-none" style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h4 style={{ color: '#0055FF' }} className="font-display text-xs uppercase tracking-widest mb-3 sm:mb-4">P3 — Low</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label style={{ color: 'var(--text-secondary)' }} className="block font-body text-xs mb-2">Acknowledge By (hours)</label>
                <input
                  type="number"
                  value={slaSettings.p3_ack_hours}
                  onChange={(e) => handleSlaChange('p3_ack_hours', Number(e.target.value))}
                  style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg font-mono text-sm outline-none" />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)' }} className="block font-body text-xs mb-2">Resolve By (hours)</label>
                <input
                  type="number"
                  value={slaSettings.p3_res_hours}
                  onChange={(e) => handleSlaChange('p3_res_hours', Number(e.target.value))}
                  style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg font-mono text-sm outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <button
          onClick={handleSaveSla}
          disabled={isSavingSla}
          style={{ backgroundColor: '#0055FF', color: '#FFFFFF' }}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-display text-xs uppercase tracking-widest w-full sm:w-auto transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSavingSla ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isSavingSla ? 'Saving...' : 'Save SLA Settings'}
        </button>
        {saved && (
          <span style={{ color: '#009B77' }} className="font-body text-xs sm:text-sm">SLA Settings saved successfully!</span>
        )}
      </div>

      {/* Categories */}
      <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ backgroundColor: '#0055FF15' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Bell size={16} style={{ color: '#0055FF' }} />
          </div>
          <h3 style={{ color: 'var(--text-primary)' }} className="font-display text-xs sm:text-sm font-medium">Issue Categories (Departments)</h3>
        </div>
        
        <div className="flex items-center gap-2 mb-6 max-w-sm">
          <input 
            type="text" 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="New Category Name..."
            className="flex-1 px-3 py-2 sm:py-2.5 rounded-lg font-body text-sm outline-none" style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          <button 
            onClick={handleAddCategory}
            disabled={!newCategory.trim() || isAddingCategory}
            style={{ backgroundColor: '#0055FF', color: '#FFFFFF' }}
            className="px-4 py-2.5 rounded-lg flex items-center gap-2 font-display text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingCategory ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {isAddingCategory ? 'Adding...' : 'Add'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg font-display text-[10px] uppercase tracking-wider"
            >
              <span>{cat.name}</span>
              <button 
                onClick={() => handleDeleteCategory(cat.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 hover:text-red-500 transition-all text-gray-400"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-gray-500 italic">No categories found.</p>
          )}
        </div>
      </div>

      {/* Roles */}
      <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ backgroundColor: '#009B7715' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Users size={16} style={{ color: '#009B77' }} />
          </div>
          <h3 style={{ color: 'var(--text-primary)' }} className="font-display text-xs sm:text-sm font-medium">User Roles</h3>
        </div>
        <div className="space-y-3">
          {[
            { role: 'Employee', desc: 'Raise tickets, view own tickets, provide feedback' },
            { role: 'Technician', desc: 'View assigned tickets, update status, add resolution notes' },
            { role: 'Facility Manager', desc: 'Full ticket management for their office, all status transitions' },
            { role: 'Operations Head', desc: 'Cross-office view, analytics, SLA breach management' },
            { role: 'Super Admin', desc: 'QR management, config, user role assignment, system settings' },
            { role: 'Auditor', desc: 'Read-only access to all tickets and audit logs' },
          ].map((item) => (
            <div key={item.role} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="flex items-start gap-3 py-2">
              <Shield size={14} style={{ color: 'var(--text-tertiary)' }} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--text-primary)' }} className="font-body text-xs sm:text-sm font-medium">{item.role}</p>
                <p style={{ color: 'var(--text-secondary)' }} className="font-body text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
