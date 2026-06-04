import { Link } from 'react-router-dom';
import {
  QrCode,
  Brain,
  Shield,
  Bell,
  BarChart3,
  Zap,
  CheckCircle,
  Mail,
  MessageSquare,
  Timer,
  Users,
  Lock,
  Eye,
  Clock,
  ChevronDown,
  Ticket,
  LayoutDashboard,
  Droplets,
  Lightbulb,
  Wind,
  Sofa,
  Coffee,
  Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 lg:px-12 pt-20 pb-16 overflow-hidden"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle gradient accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{
            background: 'radial-gradient(ellipse at center, #56D500 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
          style={{
            background: 'radial-gradient(ellipse at center, #01BEFF 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1000px] mx-auto text-center px-4">
        {/* Bayer Logo - Prominently Displayed */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <img
            src="/Bayer-Logo.wine.png"
            alt="Bayer"
            className="h-16 sm:h-20 lg:h-24 w-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
          style={{
            backgroundColor: 'rgba(86, 213, 0, 0.08)',
            border: '1px solid rgba(86, 213, 0, 0.25)',
          }}
        >
          <Zap size={14} style={{ color: '#56D500' }} />
          <span className="font-display text-xs font-medium uppercase tracking-widest" style={{ color: '#00314E' }}>
            Bayer Facilities Management
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display font-semibold leading-[0.95] tracking-tight"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            color: '#00314E',
            letterSpacing: '-0.03em',
          }}
        >
          FacilityDesk
          <br />
          <span style={{ color: '#52525B' }}>for Bayer</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 max-w-[640px] mx-auto font-body text-base lg:text-lg leading-relaxed"
          style={{ color: '#3F3F46' }}
        >
          An intelligent, end-to-end facilities ticketing platform that transforms how employees
          raise maintenance complaints across Bayer&apos;s South Asia offices.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4"
        >
          <Link
            to="/app"
            className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-display text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:shadow-xl hover:scale-105 w-full sm:w-auto"
            style={{ backgroundColor: '#56D500', color: '#FFFFFF' }}
          >
            <QrCode size={18} />
            Scan QR to Report
          </Link>
          <Link
            to="/admin/auth"
            className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-display text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #00314E',
              color: '#00314E',
            }}
          >
            <LayoutDashboard size={18} />
            Admin Dashboard
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-display text-[8px] font-medium uppercase tracking-widest" style={{ color: '#71717A' }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} style={{ color: '#71717A' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: QrCode,
      title: 'QR-First Submission',
      description: 'Unique, location-aware QR codes posted at every zone. Scanning opens the PWA — no app installation required. Location auto-detected from QR metadata.',
    },
    {
      icon: Brain,
      title: 'Smart Ticket Routing',
      description: 'Report issues easily in plain English. The system automatically categorises your request and routes it to the correct facility team.',
    },
    {
      icon: Shield,
      title: 'Azure AD Authentication',
      description: 'Single sign-on via Microsoft Identity Platform. Employee profiles auto-populated from Azure AD — zero manual data entry for identity.',
    },
    {
      icon: Bell,
      title: 'Multi-Channel Notifications',
      description: 'Email via Azure Communication Services, two-way WhatsApp Business API with actionable buttons, and Microsoft Teams adaptive cards.',
    },
    {
      icon: BarChart3,
      title: 'Cross-Office Analytics',
      description: 'Real-time dashboards showing tickets by category, office, priority. AI-generated feedback reports by day, month, and year.',
    },
    {
      icon: Timer,
      title: 'SLA Enforcement',
      description: 'Seven-stage tracked lifecycle with automatic escalation. SLA breach triggers notifications to the next management tier.',
    },
  ];

  return (
    <section
      id="platform"
      className="py-24 lg:py-32 px-6 lg:px-12"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-20"
        >
          <span className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: '#01BEFF' }}>
            Platform
          </span>
          <h2
            className="mt-4 font-display font-bold"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: '#00314E',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Simple, fast issue reporting
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                custom={idx + 1}
                className="group p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: 'rgba(86, 213, 0, 0.12)' }}
                >
                  <Icon size={24} style={{ color: '#56D500' }} strokeWidth={2.5} />
                </div>
                <h3
                  className="font-display text-lg font-bold mb-3"
                  style={{ color: '#00314E' }}
                >
                  {feature.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: '#52525B' }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QRSystem() {
  return (
    <section
      id="qr-system"
      className="py-24 lg:py-32 px-6 lg:px-12"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            custom={0}
          >
            <span className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: '#01BEFF' }}>
              QR Intelligence
            </span>
            <h2
              className="mt-4 font-display font-bold"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                color: '#00314E',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Location-aware QR codes
            </h2>
            <p className="mt-6 font-body text-base leading-relaxed" style={{ color: '#3F3F46' }}>
              Every QR encodes a structured Location ID: <code className="font-mono text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#F8F9FA', color: '#00314E', fontWeight: 600 }}>BAYER-THN-03-CAFE</code>.
              When scanned, the system pre-fills office, floor, and zone — eliminating misrouting entirely.
            </p>
            <ul className="mt-10 space-y-5">
              {[
                'HMAC-SHA256 signed URL security',
                'Print-ready A4 and A5 card generation',
                'Active / retired status toggle',
                'Batch generation for entire floors',
              ].map((item, idx) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(1, 190, 255, 0.12)' }}>
                    <CheckCircle size={16} style={{ color: '#01BEFF' }} strokeWidth={2.5} />
                  </div>
                  <span className="font-body text-base font-medium" style={{ color: '#18181B' }}>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center"
          >
            <div
              className="p-10 rounded-3xl flex flex-col items-center gap-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 20px 60px rgba(0, 49, 78, 0.15)',
                border: '1px solid #E5E7EB',
              }}
            >
              <img src="/Bayer-Logo.wine.svg" alt="Bayer" className="h-10" />
              <div
                className="w-56 h-56 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: '#F8F9FA', border: '2px solid #E5E7EB' }}
              >
                <QrCode size={120} style={{ color: '#00314E' }} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="font-display text-base font-bold" style={{ color: '#00314E' }}>
                  Floor 3, Cafeteria
                </p>
                <p className="font-mono text-xs mt-2 font-semibold" style={{ color: '#71717A' }}>
                  BAYER-THN-03-CAFE
                </p>
              </div>
              <p className="font-body text-sm font-semibold" style={{ color: '#56D500' }}>
                facilitydesk.bayer.in/r/abc123
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const stats = [
    { label: 'Total Tickets', value: '254', icon: Ticket },
    { label: 'Open', value: '42', icon: Eye },
    { label: 'In Progress', value: '28', icon: Clock },
    { label: 'Resolved Today', value: '18', icon: CheckCircle },
  ];

  return (
    <section
      id="dashboard"
      className="py-24 lg:py-32 px-6 lg:px-12"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-20"
        >
          <span className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: '#56D500' }}>
            Dashboard
          </span>
          <h2
            className="mt-4 font-display font-bold"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: '#00314E',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Complete visibility, real-time control
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <Icon size={16} style={{ color: '#01BEFF' }} strokeWidth={2.5} />
                  <span className="font-display text-[8px] font-bold uppercase tracking-widest" style={{ color: '#71717A' }}>
                    {stat.label}
                  </span>
                </div>
                <span className="font-mono text-3xl lg:text-4xl font-bold" style={{ color: '#00314E' }}>
                  {stat.value}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E5E7EB',
          }}
        >
          {/* Mini header */}
          <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
            {['All', 'Resolved', 'Open', 'In Progress', 'Failed'].map((tab, idx) => (
              <span
                key={tab}
                className="font-display text-[8px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all cursor-pointer"
                style={{
                  backgroundColor: idx === 0 ? '#00314E' : 'transparent',
                  color: idx === 0 ? '#FFFFFF' : '#71717A',
                }}
              >
                {tab}
              </span>
            ))}
          </div>
          {/* Mini table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F8F9FA' }}>
                  {['Ticket ID', 'Subject', 'Assignee', 'Category', 'Priority'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 font-display text-[8px] font-bold uppercase tracking-wider" style={{ color: '#71717A' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'BYR-THN-2026-003847', subject: 'Air conditioning unit non-functional', assignee: 'Rahul Sharma', category: 'HVAC / AC', priority: 'P2', color: '#F59E0B' },
                  { id: 'BYR-THN-2026-003848', subject: 'Exposed live wire near workstation', assignee: 'Amit Kumar', category: 'Electrical', priority: 'P1', color: '#EF4444' },
                  { id: 'BYR-MUM-2026-001923', subject: 'Chair is wobbly and unstable', assignee: 'Vikram Singh', category: 'Furniture', priority: 'P3', color: '#56D500' },
                  { id: 'BYR-THN-2026-003849', subject: 'Washroom out of order on Floor 4', assignee: 'Suresh Reddy', category: 'Plumbing', priority: 'P2', color: '#F59E0B' },
                ].map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td className="px-6 py-4 font-mono text-xs font-semibold" style={{ color: '#01BEFF' }}>{row.id}</td>
                    <td className="px-6 py-4 font-body text-sm font-medium" style={{ color: '#18181B' }}>{row.subject}</td>
                    <td className="px-6 py-4 font-body text-sm" style={{ color: '#52525B' }}>{row.assignee}</td>
                    <td className="px-6 py-4">
                      <span className="font-display text-[8px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(86, 213, 0, 0.12)', color: '#56D500' }}>
                        {row.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-display text-[8px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${row.color}15`, color: row.color }}>
                        {row.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const items = [
    { icon: Lock, title: 'Azure AD SSO', desc: 'No custom credential storage. MSAL handles token lifecycle.' },
    { icon: Shield, title: 'HMAC-SHA256 QR Security', desc: 'Signed URLs with quarterly secret rotation. Retired QRs invalidated immediately.' },
    { icon: Eye, title: 'PII Masking', desc: 'Column-level access control. Mobile numbers masked in public audit views.' },
    { icon: Users, title: 'Role-Based Access', desc: 'Azure AD App Roles — Employee, Technician, Facility Manager, Operations Head, Super Admin, Auditor.' },
  ];

  return (
    <section
      id="security"
      className="py-24 lg:py-32 px-6 lg:px-12"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-20"
        >
          <span className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: '#01BEFF' }}>
            Security &amp; Compliance
          </span>
          <h2
            className="mt-4 font-display font-bold"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: '#00314E',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Enterprise-grade protection
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-5 p-8 rounded-2xl"
                style={{
                  backgroundColor: '#F8F9FA',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(1, 190, 255, 0.12)' }}
                >
                  <Icon size={22} style={{ color: '#01BEFF' }} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold mb-2" style={{ color: '#00314E' }}>
                    {item.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: '#52525B' }}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhatYouCanReportSection() {
  const categories = [
    { icon: Droplets, label: 'Plumbing', desc: 'Leaks, washroom issues, water supply' },
    { icon: Lightbulb, label: 'Electrical', desc: 'Lighting, power outlets, wiring' },
    { icon: Wind, label: 'HVAC', desc: 'Air conditioning, heating, ventilation' },
    { icon: Sofa, label: 'Furniture', desc: 'Chairs, desks, storage units' },
    { icon: Coffee, label: 'Cafeteria', desc: 'Pantry equipment, vending machines' },
    { icon: Monitor, label: 'IT Setup', desc: 'Meeting room screens, conferencing' },
  ];

  return (
    <section
      className="py-24 lg:py-32 px-6 lg:px-12"
      style={{
        backgroundColor: '#00314E',
        backgroundImage: 'linear-gradient(135deg, #00314E 0%, #004466 100%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <span className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: '#56D500' }}>
            Report Anything
          </span>
          <h2
            className="mt-4 font-display font-bold text-white"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            What you can report
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c, idx) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10">
                  <Icon size={24} style={{ color: '#56D500' }} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white mb-1">
                    {c.label}
                  </h3>
                  <p className="font-body text-xs text-slate-300">
                    {c.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section
      id="contact"
      className="py-24 lg:py-32 px-6 lg:px-12"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="max-w-[700px] mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <img src="/Bayer-Logo.wine.svg" alt="Bayer" className="h-16 mx-auto mb-8" />
          <h2
            className="font-display font-bold"
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              color: '#00314E',
              letterSpacing: '-0.01em',
            }}
          >
            Ready to modernise your facilities?
          </h2>
          <p className="mt-6 font-body text-base leading-relaxed" style={{ color: '#3F3F46' }}>
            FacilityDesk is commissioned by Bayer&apos;s RE, Commercial Area &amp; Facilities Management team.
            Contact the team to learn more or schedule a demo.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
            <div
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}
            >
              <Mail size={16} style={{ color: '#56D500' }} strokeWidth={2.5} />
              <span className="font-body text-sm font-medium" style={{ color: '#18181B' }}>
                facilities@bayer.com
              </span>
            </div>
            <div
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}
            >
              <MessageSquare size={16} style={{ color: '#01BEFF' }} strokeWidth={2.5} />
              <span className="font-body text-sm font-medium" style={{ color: '#18181B' }}>
                Teams: Facilities Desk
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Hero />
      <Features />
      <QRSystem />
      <DashboardPreview />
      <SecuritySection />
      <WhatYouCanReportSection />
      <ContactSection />
    </div>
  );
}
