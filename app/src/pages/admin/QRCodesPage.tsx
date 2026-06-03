import { useState, useEffect } from 'react';
import { Download, Search, AlertCircle, Loader2 } from 'lucide-react';
import { API_URL } from '@/config';

export default function QRCodesPage() {
  const [offices, setOffices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/offices/`);
      if (!res.ok) throw new Error('Failed to fetch offices');
      const data = await res.json();
      setOffices(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load QR codes from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = offices.filter(office => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return office.name.toLowerCase().includes(q) || (office.qr_code && office.qr_code.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="font-display text-xl lg:text-2xl font-medium">QR Codes</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="font-body text-sm mt-1">Manage location QR codes</p>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} className="flex items-center gap-2 p-3 rounded-lg mb-6 max-w-sm">
          <AlertCircle size={16} style={{ color: '#DC2626' }} />
          <span style={{ color: '#DC2626' }} className="font-body text-sm">{error}</span>
        </div>
      )}

      {/* Search */}
      <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="flex items-center gap-2 px-3 py-2 rounded-lg mb-6 max-w-sm">
        <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Search offices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none font-body text-sm flex-1" style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#01BEFF] mb-4" />
          <p className="font-display text-lg font-semibold text-gray-900">Loading QR Codes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((office) => (
            <div
              key={office.id}
              style={{ boxShadow: '0 20px 60px rgba(0, 49, 78, 0.15)', border: '1px solid #E5E7EB' }}
              className="p-10 rounded-3xl flex flex-col items-center gap-6 bg-white"
            >
              <img src="/Bayer-Logo.wine.svg" alt="Bayer" className="h-10" />
              <div
                style={{ backgroundColor: '#F8F9FA', border: '2px solid #E5E7EB' }}
                className="w-56 h-56 rounded-2xl flex items-center justify-center overflow-hidden"
              >
                {office.qr_image_url ? (
                  <img src={office.qr_image_url} alt="QR Code" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-sm text-gray-400">No QR Code</p>
                )}
              </div>
              <div className="text-center">
                <p style={{ color: '#00314E' }} className="font-display text-base font-bold">
                  {office.name} Office
                </p>
                <p style={{ color: '#71717A' }} className="font-mono text-xs mt-2 font-semibold">
                  {office.qr_code}
                </p>
              </div>
              <p style={{ color: '#56D500' }} className="font-body text-sm font-semibold">
                facilitydesk.bayer.in/r/{office.id.substring(0, 8)}...
              </p>

              {/* Metadata */}
              <div style={{ borderColor: '#E5E7EB' }} className="w-full pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span style={{ color: '#71717A' }} className="font-body text-xs">
                    Created: {new Date(office.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  disabled={!office.qr_pdf_url}
                  onClick={() => window.open(office.qr_pdf_url, '_blank')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-display text-[10px] uppercase tracking-wider transition-all duration-300 hover:shadow-md disabled:opacity-50" style={{ backgroundColor: '#00314E', color: '#FFFFFF' }}
                >
                  <Download size={12} />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
