import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Platform', href: '/#platform' },
  { label: 'QR System', href: '/#qr-system' },
  { label: 'Dashboard', href: '/#dashboard' },
  { label: 'Security', href: '/#security' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isLanding = location.pathname === '/';

  const scrollToSection = (href: string) => {
    if (!isLanding) return;
    const id = href.replace('/#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 lg:px-12"
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid #E1E8ED',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/Bayer-Logo.wine.png" alt="Bayer" className="h-9 w-auto" />
          <span className="font-display text-base font-semibold tracking-tight" style={{ color: '#00314E' }}>
            FacilityDesk
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.href)}
              className="px-3 py-1.5 font-display text-xs uppercase tracking-widest transition-colors duration-200 hover:text-[#56D500]"
              style={{ color: '#6B7280' }}
            >
              {item.label}
            </button>
          ))}
          <Link
            to="/admin/auth"
            className="ml-3 px-4 py-2 font-display text-xs uppercase tracking-widest rounded-lg transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: '#56D500',
              color: '#FFFFFF',
            }}
          >
            Admin
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex items-center justify-center"
            style={{ color: 'var(--text-primary)' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 md:hidden"
          style={{
            backgroundColor: 'rgba(255,255,255,0.96)',
          }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-6 w-9 h-9 flex items-center justify-center"
            style={{ color: 'var(--text-primary)' }}
          >
            <X size={24} />
          </button>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.href)}
              className="font-display text-lg uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.label}
            </button>
          ))}
          <Link
            to="/admin/auth"
            onClick={() => setMobileOpen(false)}
            className="px-6 py-2.5 font-display text-sm uppercase tracking-widest rounded-lg"
            style={{
              backgroundColor: '#56D500',
              color: '#FFFFFF',
            }}
          >
            Admin Dashboard
          </Link>
        </div>
      )}
    </>
  );
}
