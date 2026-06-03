export default function Footer() {
  return (
    <footer
      className="w-full"
      style={{
        borderTop: '1px solid #E1E8ED',
        backgroundColor: '#F8F9FA',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="font-display text-lg font-semibold" style={{ color: '#00314E' }}>
              FacilityDesk
            </span>
            <span className="block font-body text-[13px] mt-0.5" style={{ color: '#6B7280' }}>
              by Bayer
            </span>
          </div>
          <img src="/Bayer-Logo.wine.png" alt="Bayer" className="h-20 w-auto opacity-90" />
        </div>

        {/* Middle Row */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          {['Platform', 'QR Intelligence', 'Dashboard', 'Security', 'Privacy Policy'].map((item, i, arr) => (
            <span key={item} className="flex items-center gap-4">
              <span
                className="font-body text-[13px] cursor-pointer hover:text-[#56D500] transition-colors"
                style={{ color: '#6B7280', letterSpacing: '0.04em' }}
              >
                {item}
              </span>
              {i < arr.length - 1 && (
                <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              )}
            </span>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
            &copy; 2026 Bayer AG. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
