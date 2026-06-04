import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import TicketHistory from './TicketHistory';
import TicketDetail from './TicketDetail';
import FeedbackHistory from './FeedbackHistory';
import FeedbackDetail from './FeedbackDetail';

// Bayer Brand Colors
const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';
const BG_LIGHT = '#FFFFFF';
const BG_GRAY = '#F5F7FA';
const BORDER_LIGHT = '#E1E8ED';
const TEXT_PRIMARY = '#00314E';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';

function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: BG_GRAY }}>
      <header className="h-16 flex items-center justify-between px-4" style={{ backgroundColor: BG_LIGHT, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeft size={18} style={{ color: TEXT_SECONDARY }} />
          <span className="font-display text-sm font-medium" style={{ color: TEXT_PRIMARY }}>Back</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <img src="/Bayer-Logo.wine.png" alt="Bayer" className="h-8 w-auto" />
          <span className="font-display text-base font-semibold" style={{ color: BAYER_BLUE }}>FacilityDesk</span>
        </div>
        <div className="w-16"></div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

function QRScan() {
  return (
    <EmployeeLayout>
      <div className="text-center py-12">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${BAYER_CYAN}20` }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={BAYER_CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            <line x1="7" y1="7" x2="7" y2="7" /><line x1="17" y1="7" x2="17" y2="7" />
            <line x1="7" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="17" y2="17" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-3" style={{ color: BAYER_BLUE }}>
          Scan QR Code
        </h1>
        <p className="font-body text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
          Point your camera at the QR code posted near the facility issue
        </p>

        {/* Camera viewfinder simulation */}
        <div
          className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden mb-8"
          style={{
            border: `2px solid ${BORDER_LIGHT}`,
            backgroundColor: BG_LIGHT,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-48 h-48 rounded-xl flex flex-col items-center justify-center gap-3 p-6"
              style={{ backgroundColor: BG_GRAY }}
            >
              <img
                src="/Bayer-Logo.wine.png"
                alt="Bayer"
                className="h-12 w-auto object-contain"
              />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              </div>
            </div>
          </div>
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 rounded-tl-sm" style={{ borderColor: BAYER_GREEN }} />
          <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 rounded-tr-sm" style={{ borderColor: BAYER_GREEN }} />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 rounded-bl-sm" style={{ borderColor: BAYER_GREEN }} />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 rounded-br-sm" style={{ borderColor: BAYER_GREEN }} />
        </div>

        <Link
          to="/app/auth"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-display text-sm font-semibold uppercase tracking-wide shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: BAYER_GREEN, color: BG_LIGHT }}
        >
          Scan QR Code
        </Link>
      </div>
    </EmployeeLayout>
  );
}

function MockAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAzureLogin = () => {
    setIsLoading(true);
    // In production, this would redirect to:
    // https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize
    // For now, simulate OAuth flow with timeout
    setTimeout(() => {
      window.location.href = '/app/dashboard';
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
            <span className="block" style={{ color: '#01BEFF' }}>Employee Portal</span>
          </h1>
          <div className="w-16 md:w-24 h-2 md:h-3 mb-6" style={{ backgroundColor: '#56D500' }}></div>
          <p className="font-body text-base md:text-lg lg:text-xl text-slate-300 max-w-md font-light leading-relaxed">
            Report issues, track progress, and manage your facilities.
          </p>
        </div>
        
        <div className="relative z-10 hidden md:block">
          <p className="font-mono text-[8px] text-slate-400 uppercase tracking-[0.2em]">Bayer Global &middot; Authorized Access Only</p>
        </div>
      </div>

      {/* Right / Bottom Side: Auth Box */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-center p-6 md:p-12 lg:p-24 relative">
        {/* Subtle right side accent */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full pointer-events-none hidden md:block" style={{ backgroundColor: '#56D500' }}></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-5 rounded-tr-full pointer-events-none hidden md:block" style={{ backgroundColor: '#01BEFF' }}></div>
        
        <div className="w-full max-w-md mx-auto relative z-10">
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
              backgroundColor: `${BAYER_CYAN}08`,
              border: `1px solid ${BAYER_CYAN}20`
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={BAYER_CYAN}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <div>
              <p
                className="font-body text-xs font-medium mb-0.5"
                style={{ color: BAYER_CYAN }}
              >
                Secure Authentication
              </p>
              <p
                className="font-body text-xs"
                style={{ color: TEXT_SECONDARY }}
              >
                Your credentials are verified through Microsoft's secure enterprise authentication system.
              </p>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}

function ComplaintForm() {
  return (
    <EmployeeLayout>
      <div className="py-4">
        {/* Location badge */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-6"
          style={{ backgroundColor: `${BAYER_CYAN}15`, border: `1px solid ${BAYER_CYAN}40` }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BAYER_CYAN} strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-mono text-xs font-medium" style={{ color: BAYER_CYAN }}>
            BAYER-THN-03-CAFE &middot; Thane &middot; Floor 3 &middot; Cafeteria
          </span>
        </div>

        {/* User info */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: BAYER_BLUE }}>
            Report an Issue
          </h1>
          <p className="font-body text-sm" style={{ color: TEXT_SECONDARY }}>
            Logged in as <strong style={{ color: TEXT_PRIMARY }}>Priya Patel</strong> &middot; Finance
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block font-body text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: TEXT_SECONDARY }}>
              Describe the issue in your own words
            </label>
            <textarea
              defaultValue="The AC unit in the cafeteria area on Floor 3 has not been operational since morning. Multiple employees are affected."
              rows={5}
              className="w-full px-4 py-3 rounded-lg font-body text-sm outline-none resize-vertical focus:ring-2"
              style={{
                backgroundColor: BG_LIGHT,
                border: `1px solid ${BORDER_LIGHT}`,
                color: TEXT_PRIMARY,
                minHeight: '120px',
              }}
            />
            <div className="text-right mt-1">
              <span className="font-body text-[9px]" style={{ color: TEXT_TERTIARY }}>142 / 1000</span>
            </div>
          </div>

          <div>
            <label className="block font-body text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: TEXT_SECONDARY }}>
              Attach photos (optional, max 3)
            </label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-gray-400"
              style={{ borderColor: BORDER_LIGHT, backgroundColor: BG_LIGHT }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEXT_TERTIARY} strokeWidth="2" className="mx-auto mb-2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="font-body text-sm" style={{ color: TEXT_TERTIARY }}>
                Tap to upload photos
              </span>
            </div>
          </div>

          <Link
            to="/app/processing"
            className="block w-full text-center py-3.5 rounded-lg font-display text-sm font-semibold uppercase tracking-wide shadow-sm hover:shadow-md transition-shadow mt-6"
            style={{ backgroundColor: BAYER_GREEN, color: BG_LIGHT }}
          >
            Submit Report
          </Link>
        </div>
      </div>
    </EmployeeLayout>
  );
}

function Processing() {
  return (
    <EmployeeLayout>
      <div className="text-center py-16">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: `3px solid ${BORDER_LIGHT}`,
              borderTopColor: BAYER_GREEN,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BAYER_GREEN} strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: BAYER_BLUE }}>
          Processing your request...
        </h1>
        <p className="font-body text-sm" style={{ color: TEXT_SECONDARY }}>
          AI is categorising, prioritising, and routing your ticket
        </p>

        {/* Processing steps */}
        <div className="mt-8 space-y-3 max-w-xs mx-auto text-left">
          {[
            { label: 'Categorising issue', done: true },
            { label: 'Assigning priority', done: true },
            { label: 'Checking for duplicates', done: false },
            { label: 'Routing to maintenance team', done: false },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: step.done ? `${BAYER_GREEN}20` : BG_LIGHT,
                  border: `2px solid ${step.done ? BAYER_GREEN : BORDER_LIGHT}`,
                }}
              >
                {step.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BAYER_GREEN} strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>}
              </div>
              <span
                className="font-body text-sm"
                style={{ color: step.done ? TEXT_PRIMARY : TEXT_TERTIARY }}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Auto-redirect simulation */}
        <div className="mt-8">
          <Link
            to="/app/ticket"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-display text-sm font-medium hover:bg-gray-100 transition-colors"
            style={{ backgroundColor: BG_LIGHT, border: `1px solid ${BORDER_LIGHT}`, color: TEXT_PRIMARY }}
          >
            View Ticket
          </Link>
        </div>
      </div>
    </EmployeeLayout>
  );
}

function TicketView() {
  const stages = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
  const currentStage = 3; // In Progress

  return (
    <EmployeeLayout>
      <div className="py-4">
        {/* Success banner */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg mb-6"
          style={{ backgroundColor: `${BAYER_GREEN}15`, border: `1px solid ${BAYER_GREEN}40` }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BAYER_GREEN} strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg>
          <div>
            <p className="font-body text-sm font-semibold" style={{ color: BAYER_GREEN }}>Ticket created successfully</p>
            <p className="font-mono text-xs font-medium" style={{ color: BAYER_GREEN }}>BYR-THN-2026-003847</p>
          </div>
        </div>

        {/* Ticket Summary */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{ backgroundColor: BG_LIGHT, border: `1px solid ${BORDER_LIGHT}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs font-medium" style={{ color: BAYER_CYAN }}>BYR-THN-2026-003847</span>
            <span className="font-display text-[8px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded" style={{ backgroundColor: '#F59E0B15', color: '#F59E0B' }}>
              P2 &middot; High
            </span>
          </div>
          <h2 className="font-display text-base font-semibold mb-2" style={{ color: BAYER_BLUE }}>
            Air conditioning unit non-functional
          </h2>
          <p className="font-body text-sm mb-4" style={{ color: TEXT_SECONDARY }}>
            The AC unit in the cafeteria area on Floor 3 has not been operational since morning. Multiple employees are affected. Immediate attention required.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="font-display text-[8px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded" style={{ backgroundColor: `${BAYER_CYAN}15`, color: BAYER_CYAN }}>
              HVAC / AC
            </span>
            <span className="font-display text-[8px] font-medium uppercase tracking-wider px-2.5 py-1 rounded" style={{ backgroundColor: BG_GRAY, color: TEXT_SECONDARY }}>
              Thane &middot; Floor 3 &middot; Cafeteria
            </span>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="mb-6">
          <h3 className="font-display text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: TEXT_SECONDARY }}>
            Ticket Progress
          </h3>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ backgroundColor: BORDER_LIGHT }} />
            <div className="space-y-0">
              {stages.map((stage, stageIdx) => {
                const isDone = stageIdx <= currentStage;
                const isCurrent = stageIdx === currentStage;
                return (
                  <div key={stage} className="flex items-start gap-3 relative py-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      style={{
                        backgroundColor: isDone ? BAYER_GREEN : BG_LIGHT,
                        border: isCurrent ? `2px solid ${BAYER_GREEN}` : `2px solid ${BORDER_LIGHT}`,
                      }}
                    >
                      {isDone && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                      )}
                    </div>
                    <div className="pt-0.5">
                      <span
                        className="font-body text-sm"
                        style={{ color: isDone ? TEXT_PRIMARY : TEXT_TERTIARY }}
                      >
                        {stage}
                      </span>
                      {isCurrent && (
                        <span className="block font-body text-[9px] font-medium mt-0.5" style={{ color: BAYER_GREEN }}>
                          Current stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Assigned to */}
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ backgroundColor: BG_LIGHT, border: `1px solid ${BORDER_LIGHT}` }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display text-xs font-semibold"
            style={{ backgroundColor: `${BAYER_CYAN}20`, color: BAYER_CYAN }}
          >
            RS
          </div>
          <div>
            <p className="font-body text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Assigned to Rahul Sharma</p>
            <p className="font-body text-xs" style={{ color: TEXT_SECONDARY }}>HVAC Maintenance Team, Thane</p>
          </div>
        </div>

        {/* Feedback prompt */}
        <div className="mt-6 text-center">
          <p className="font-body text-xs mb-3" style={{ color: TEXT_TERTIARY }}>
            You will receive a feedback request once the ticket is resolved
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide hover:underline"
            style={{ color: BAYER_CYAN }}
          >
            Return to home
          </Link>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default function EmployeeApp() {
  return (
    <Routes>
      <Route path="/" element={<QRScan />} />
      <Route path="/auth" element={<MockAuth />} />
      <Route path="/form" element={<ComplaintForm />} />
      <Route path="/processing" element={<Processing />} />
      <Route path="/ticket" element={<TicketView />} />
      <Route path="/history" element={<TicketHistory />} />
      <Route path="/history/:id" element={<TicketDetail />} />
      <Route path="/feedback-history" element={<FeedbackHistory />} />
      <Route path="feedback/:id" element={<FeedbackDetail />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
