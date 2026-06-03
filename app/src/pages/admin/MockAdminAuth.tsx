import { useState } from 'react';

// Bayer colors
const BAYER_BLUE = '#00314E';
const BG_LIGHT = '#FFFFFF';
const BG_GRAY = '#F5F7FA';
const TEXT_PRIMARY = '#18181B';
const TEXT_SECONDARY = '#52525B';
const BORDER_LIGHT = '#E5E7EB';

export default function MockAdminAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAzureLogin = () => {
    setIsLoading(true);
    // In production, this would redirect to:
    // https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize
    // For now, simulate OAuth flow with timeout
    setTimeout(() => {
      window.location.href = '/admin/dashboard';
    }, 2000);
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F7FA]">
      {/* Left / Top Side: Bauhaus Poster Presentation */}
      <div className="w-full md:w-5/12 lg:w-1/2 relative overflow-hidden flex flex-col justify-between p-8 md:p-12 lg:p-16 min-h-[35vh] md:min-h-screen" style={{ backgroundColor: BAYER_BLUE }}>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Bauhaus Geometrics behind text */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Capri Blue Diagonal Block */}
          <div className="absolute w-[150%] h-[30%] rotate-[-35deg] opacity-80" style={{ backgroundColor: '#01BEFF', mixBlendMode: 'multiply' }}></div>
          {/* Innovation Green Circle */}
          <div className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full right-[-10%] top-[20%] opacity-90" style={{ backgroundColor: '#56D500', mixBlendMode: 'screen' }}></div>
          {/* White Outline Circle */}
          <div className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full border-[8px] md:border-[16px] border-white opacity-20 left-[-10%] bottom-[10%]"></div>
          {/* Solid White Square */}
          <div className="absolute w-24 h-24 bg-white opacity-10 right-[15%] bottom-[20%] rotate-12"></div>
        </div>

        <div className="relative z-10">
          <img src="/Bayer-Logo.wine.png" alt="Bayer" className="h-10 md:h-14 lg:h-16 w-auto brightness-0 invert" />
        </div>

        <div className="relative z-10 mt-12 md:mt-0">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
            FacilityDesk
            <span className="block" style={{ color: '#01BEFF' }}>Admin Portal</span>
          </h1>
          <div className="w-16 md:w-24 h-2 md:h-3 mb-6" style={{ backgroundColor: '#56D500' }}></div>
          <p className="font-body text-base md:text-lg lg:text-xl text-slate-300 max-w-md font-light leading-relaxed">
            Enterprise facility management, engineered for absolute precision.
          </p>
        </div>
        
        <div className="relative z-10 hidden md:block">
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.2em]">Bayer Global &middot; Authorized Access Only</p>
        </div>
      </div>

      {/* Right / Bottom Side: Auth Box */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 relative">
        {/* Subtle right side accent */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full pointer-events-none hidden md:block" style={{ backgroundColor: '#56D500' }}></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-5 rounded-tr-full pointer-events-none hidden md:block" style={{ backgroundColor: '#01BEFF' }}></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 md:hidden">
            <h2 className="font-display text-2xl font-semibold tracking-tight" style={{ color: BAYER_BLUE }}>Welcome back</h2>
          </div>

        {/* Authentication card */}
        <div
          className="rounded-xl p-8"
          style={{
            backgroundColor: BG_LIGHT,
            border: `1px solid ${BORDER_LIGHT}`,
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
          }}
        >
          <div className="mb-6">
            <img
              src="/Bayer-Logo.wine.png"
              alt="Bayer Logo"
              className="h-10 w-auto mb-4 hidden md:block"
            />
            <h2
              className="font-display text-base font-semibold mb-1"
              style={{ color: TEXT_PRIMARY }}
            >
              Sign in to continue
            </h2>
            <p
              className="font-body text-xs"
              style={{ color: TEXT_SECONDARY }}
            >
              Use your Bayer corporate credentials
            </p>
          </div>

          <button
            onClick={handleAzureLogin}
            disabled={isLoading}
            className="w-full rounded-xl font-body text-base font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#5E5E5E',
              border: '1px solid #D1D5DB',
              height: '3.5rem',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div
                  className="w-5 h-5 rounded-full animate-spin"
                  style={{
                    border: '2px solid #D1D5DB',
                    borderTopColor: 'transparent'
                  }}
                />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#00A4EF"/>
                  <rect x="1" y="11" width="9" height="9" fill="#7FBA00"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
                <span>Sign in with Microsoft</span>
              </>
            )}
          </button>

          {/* Security note */}
          <div
            className="mt-6 flex items-start gap-2 p-3 rounded-lg"
            style={{
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB'
            }}
          >
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6B7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="font-body text-[11px] leading-relaxed" style={{ color: '#6B7280' }}>
              Authentication is handled securely by Microsoft Azure Active Directory. Bayer FacilityDesk does not store your credentials.
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
