import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
import { API_URL } from '@/config';
  TrendingUp,
  Ticket,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Download,
  Sparkles,
  FileText,
  Loader2,
  BarChart3,
  Clock,
  Building2,
  Activity,
  Star,
} from 'lucide-react';

// ── Bayer Design System Colors ──
const BAYER_BLUE    = '#00314E';
const BAYER_CYAN    = '#01BEFF';
const BAYER_GREEN   = '#56D500';
const BAYER_BLUE_LT = '#004A78';

const API = import.meta.env.VITE_API_URL || `${API_URL}`;

interface TicketData {
  id: string;
  office_id: string;
  category_name: string | null;
  priority: string;
  status: string;
  created_at: string;
  office?: { name: string; city: string } | null;
}
interface FeedbackData {
  id: string;
  ticket_id: string;
  overall_rating: number;
  resolution_quality: number | null;
  response_time: number | null;
  communication: number | null;
  professionalism: number | null;
  comments: string | null;
  created_at: string;
}
interface OfficeData {
  id: string;
  name: string;
  city: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}
        className="rounded-lg px-3 py-2 shadow-lg"
      >
        <p style={{ color: 'var(--text-primary)' }} className="font-display text-xs font-semibold mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-mono text-xs">
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [offices, setOffices] = useState<OfficeData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [trendOffice, setTrendOffice] = useState('all');
  const [priorityOffice, setPriorityOffice] = useState('all');

  // Report controls
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [reportOffice, setReportOffice] = useState('all');
  const [fbReportType, setFbReportType] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [fbReportOffice, setFbReportOffice] = useState('all');
  const [generatingTicket, setGeneratingTicket] = useState(false);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  // ── Fetch Data ──
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [tkRes, fbRes, offRes] = await Promise.all([
          fetch(`${API}/api/tickets`),
          fetch(`${API}/api/feedback`),
          fetch(`${API}/api/offices`),
        ]);
        if (tkRes.ok) setTickets(await tkRes.json());
        if (fbRes.ok) setFeedbacks(await fbRes.json());
        if (offRes.ok) setOffices(await offRes.json());
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Office Name Map ──
  const officeMap = useMemo(() => {
    const map: Record<string, string> = {};
    offices.forEach(o => { map[o.id] = o.name; });
    return map;
  }, [offices]);

  const getOfficeName = (t: TicketData) => officeMap[t.office_id] || 'Unknown';

  // ── Computed Metrics ──
  const stats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const open = tickets.filter(t => t.status === 'Open').length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const totalFb = feedbacks.length;
    const fbRate = total > 0 ? Math.round((totalFb / total) * 100) : 0;
    const avgRating = totalFb > 0 ? (feedbacks.reduce((s, f) => s + (f.overall_rating || 0), 0) / totalFb).toFixed(1) : '0';
    const p1 = tickets.filter(t => t.priority === 'P1').length;
    return { total, resolved, open, inProgress, resRate, totalFb, fbRate, avgRating, p1 };
  }, [tickets, feedbacks]);

  // ── Weekly Trend Data ──
  const trendData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d;
    });
    return days.map(d => {
      const ds = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      const filtered = trendOffice === 'all'
        ? tickets
        : tickets.filter(t => getOfficeName(t) === trendOffice);
      const opened = filtered.filter(t => t.created_at.startsWith(ds)).length;
      const resolvedDay = filtered.filter(t =>
        (t.status === 'Resolved' || t.status === 'Closed') && t.created_at.startsWith(ds)
      ).length;
      return { name: label, Opened: opened, Resolved: resolvedDay };
    });
  }, [tickets, trendOffice, officeMap]);

  // ── Tickets by Office ──
  const officeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      const name = getOfficeName(t);
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [tickets, officeMap]);

  // ── Priority Distribution ──
  const priorityData = useMemo(() => {
    const filtered = priorityOffice === 'all'
      ? tickets
      : tickets.filter(t => getOfficeName(t) === priorityOffice);
    const p1 = filtered.filter(t => t.priority === 'P1').length;
    const p2 = filtered.filter(t => t.priority === 'P2').length;
    const p3 = filtered.filter(t => t.priority === 'P3').length;
    return [
      { name: 'P1 Critical', value: p1, color: BAYER_BLUE },
      { name: 'P2 High', value: p2, color: BAYER_CYAN },
      { name: 'P3 Normal', value: p3, color: BAYER_GREEN },
    ].filter(p => p.value > 0);
  }, [tickets, priorityOffice, officeMap]);

  // ── Category Distribution ──
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      const cat = t.category_name || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [tickets]);

  // ── Feedback Rating Distribution ──
  const ratingData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    feedbacks.forEach(f => {
      if (f.overall_rating >= 1 && f.overall_rating <= 5) {
        counts[f.overall_rating - 1]++;
      }
    });
    return counts.map((count, i) => ({ name: `${i + 1}★`, count }));
  }, [feedbacks]);

  // ── AI Insights ──
  const insights = useMemo(() => {
    const items: { type: string; title: string; desc: string; impact: string }[] = [];
    if (stats.total === 0) return items;

    if (stats.p1 > 0) {
      items.push({
        type: 'warning', title: `${stats.p1} Critical (P1) Tickets Active`,
        desc: 'P1 tickets require resolution within 2 hours per SLA. Ensure immediate escalation.',
        impact: 'Critical'
      });
    }
    if (stats.resRate >= 90) {
      items.push({
        type: 'success', title: 'Excellent Resolution Performance',
        desc: `Resolution rate of ${stats.resRate}% exceeds the 90% benchmark. Strong team execution.`,
        impact: 'Positive'
      });
    } else if (stats.resRate < 70) {
      items.push({
        type: 'warning', title: 'Resolution Rate Below Target',
        desc: `Current rate of ${stats.resRate}% is below the 70% target. Evaluate bottlenecks.`,
        impact: 'High'
      });
    }
    if (stats.fbRate < 50) {
      items.push({
        type: 'info', title: 'Low Feedback Response Rate',
        desc: `Only ${stats.fbRate}% of tickets received feedback. Consider automated reminders.`,
        impact: 'Medium'
      });
    }
    if (categoryData.length > 0) {
      const top = categoryData[0];
      items.push({
        type: 'info', title: `Top Category: ${top.name}`,
        desc: `${top.name} accounts for ${Math.round((top.value / stats.total) * 100)}% of all tickets. Preventive maintenance recommended.`,
        impact: 'Actionable'
      });
    }
    if (parseFloat(stats.avgRating) >= 4) {
      items.push({
        type: 'success', title: 'High Employee Satisfaction',
        desc: `Average feedback rating of ${stats.avgRating}/5 reflects excellent service delivery.`,
        impact: 'Positive'
      });
    }
    return items;
  }, [stats, categoryData]);

  // ── Report Generation ──
  const handleGenerateReport = async (type: 'ticket' | 'feedback') => {
    const isTicket = type === 'ticket';
    const period = isTicket ? reportType : fbReportType;
    const officeParam = isTicket ? reportOffice : fbReportOffice;
    const setter = isTicket ? setGeneratingTicket : setGeneratingFeedback;

    setter(true);
    try {
      const endpoint = isTicket ? 'tickets' : 'feedback';
      const url = `${API}/api/reports/${endpoint}?period=${period}&office=${officeParam === 'all' ? '' : officeParam}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Report generation failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Bayer_${isTicket ? 'Ticket' : 'Feedback'}_Report_${period}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Report error:', err);
      alert('Failed to generate report. Please ensure the backend is running.');
    } finally {
      setter(false);
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: BAYER_CYAN }} />
          <p style={{ color: 'var(--text-secondary)' }} className="font-body text-sm">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const officeNames = offices.map(o => o.name);

  const topStats = [
    { label: 'Total Tickets', value: stats.total, icon: Ticket, color: BAYER_BLUE },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: BAYER_GREEN },
    { label: 'Total Feedback', value: stats.totalFb, icon: MessageSquare, color: BAYER_CYAN },
    { label: 'Resolution Rate', value: `${stats.resRate}%`, icon: TrendingUp, color: BAYER_GREEN },
    { label: 'Feedback Rate', value: `${stats.fbRate}%`, icon: Activity, color: BAYER_CYAN },
    { label: 'Avg Rating', value: `${stats.avgRating}/5`, icon: Star, color: BAYER_BLUE },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ color: 'var(--text-primary)' }} className="font-display text-xl lg:text-2xl font-semibold">
          Analytics & Reports
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="font-body text-sm mt-1">
          Real-time cross-office performance metrics, trends, and automated report generation
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {topStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}
              className="p-4 rounded-xl"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={12} style={{ color: stat.color }} />
                <span style={{ color: 'var(--text-tertiary)' }} className="font-display text-[9px] uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
              <span style={{ color: 'var(--text-primary)' }} className="font-mono text-xl lg:text-2xl font-bold">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Ticket Trend (Area Chart) ── */}
      <div
        style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}
        className="rounded-xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
            Ticket Volume Trend (14 Days)
          </h3>
          <select
            value={trendOffice}
            onChange={(e) => setTrendOffice(e.target.value)}
            className="px-3 py-1.5 rounded-lg font-body text-xs outline-none"
            style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Offices</option>
            {officeNames.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradOpened" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BAYER_BLUE} stopOpacity={0.3} />
                <stop offset="100%" stopColor={BAYER_BLUE} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BAYER_GREEN} stopOpacity={0.3} />
                <stop offset="100%" stopColor={BAYER_GREEN} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={8} />
            <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} dx={-8} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Opened" stroke={BAYER_BLUE} strokeWidth={2.5} fill="url(#gradOpened)"
              dot={{ r: 3, fill: BAYER_BLUE, strokeWidth: 0 }} activeDot={{ r: 5, fill: BAYER_BLUE, stroke: '#fff', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="Resolved" stroke={BAYER_GREEN} strokeWidth={2.5} fill="url(#gradResolved)"
              dot={{ r: 3, fill: BAYER_GREEN, strokeWidth: 0 }} activeDot={{ r: 5, fill: BAYER_GREEN, stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tickets by Office */}
        <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={13} style={{ color: BAYER_CYAN }} />
            <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Tickets by Office
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={officeDistribution} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis type="number" tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={BAYER_CYAN} radius={[0, 6, 6, 0]} maxBarSize={22} name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={13} style={{ color: BAYER_BLUE }} />
              <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
                Priority Mix
              </h3>
            </div>
            <select
              value={priorityOffice}
              onChange={(e) => setPriorityOffice(e.target.value)}
              className="px-2 py-1 rounded-md font-body text-[10px] outline-none"
              style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <option value="all">All</option>
              {officeNames.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={72} paddingAngle={4}
                dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ stroke: 'var(--text-tertiary)', strokeWidth: 1 }}
              >
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={13} style={{ color: BAYER_GREEN }} />
            <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Issues by Category
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={6}
                interval={0} angle={-25} textAnchor="end" height={50} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={BAYER_GREEN} radius={[6, 6, 0, 0]} maxBarSize={28} name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Feedback Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Rating Distribution */}
        <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={13} style={{ color: BAYER_CYAN }} />
            <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Feedback Rating Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Responses" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {ratingData.map((_, i) => (
                  <Cell key={i} fill={i < 2 ? BAYER_BLUE : i < 3 ? BAYER_CYAN : BAYER_GREEN} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback Metrics Breakdown */}
        <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={13} style={{ color: BAYER_GREEN }} />
            <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Feedback Dimension Scores
            </h3>
          </div>
          <div className="space-y-4 mt-6">
            {[
              { label: 'Overall Rating', key: 'overall_rating' as const, color: BAYER_BLUE },
              { label: 'Resolution Quality', key: 'resolution_quality' as const, color: BAYER_CYAN },
              { label: 'Response Time', key: 'response_time' as const, color: BAYER_GREEN },
              { label: 'Communication', key: 'communication' as const, color: BAYER_BLUE_LT },
              { label: 'Professionalism', key: 'professionalism' as const, color: BAYER_GREEN },
            ].map(dim => {
              const vals = feedbacks.map(f => f[dim.key]).filter(v => v != null) as number[];
              const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
              const pct = (avg / 5) * 100;
              return (
                <div key={dim.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: 'var(--text-secondary)' }} className="font-body text-xs">{dim.label}</span>
                    <span style={{ color: 'var(--text-primary)' }} className="font-mono text-xs font-bold">{avg.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-light)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: dim.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── AI Insights ── */}
      {insights.length > 0 && (
        <div
          style={{ backgroundColor: `${BAYER_CYAN}08`, border: `1px solid ${BAYER_CYAN}20` }}
          className="rounded-xl p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} style={{ color: BAYER_CYAN }} />
            <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              AI-Generated Insights & Recommendations
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}
                className="rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  {insight.type === 'warning' && <AlertCircle size={15} style={{ color: '#F59E0B' }} className="flex-shrink-0 mt-0.5" />}
                  {insight.type === 'success' && <CheckCircle size={15} style={{ color: BAYER_GREEN }} className="flex-shrink-0 mt-0.5" />}
                  {insight.type === 'info' && <TrendingUp size={15} style={{ color: BAYER_CYAN }} className="flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <h4 style={{ color: 'var(--text-primary)' }} className="font-display text-sm font-semibold mb-1">
                      {insight.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)' }} className="font-body text-xs leading-relaxed mb-2">
                      {insight.desc}
                    </p>
                    <span
                      style={{
                        backgroundColor: insight.impact === 'Critical' ? '#FEE2E2' :
                          insight.impact === 'High' ? '#FEF3C7' :
                          insight.impact === 'Positive' ? '#D1FAE5' :
                          insight.impact === 'Medium' ? '#DBEAFE' : '#F3E8FF',
                        color: insight.impact === 'Critical' ? '#991B1B' :
                          insight.impact === 'High' ? '#92400E' :
                          insight.impact === 'Positive' ? '#065F46' :
                          insight.impact === 'Medium' ? '#1E40AF' : '#6B21A8',
                      }}
                      className="inline-block px-2 py-0.5 rounded font-display text-[9px] uppercase tracking-wider font-semibold"
                    >
                      {insight.impact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Report Generation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Report */}
        <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={14} style={{ color: BAYER_BLUE }} />
            <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Generate Ticket Report (PDF)
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label style={{ color: 'var(--text-tertiary)' }} className="block font-display text-[9px] uppercase tracking-wider mb-1.5">Period</label>
              <select value={reportType} onChange={e => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none"
                style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--text-tertiary)' }} className="block font-display text-[9px] uppercase tracking-wider mb-1.5">Office</label>
              <select value={reportOffice} onChange={e => setReportOffice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none"
                style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="all">All Offices</option>
                {officeNames.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={() => handleGenerateReport('ticket')}
            disabled={generatingTicket}
            className="w-full px-4 py-2.5 rounded-lg font-display text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: BAYER_BLUE }}
            onMouseEnter={e => { if (!generatingTicket) e.currentTarget.style.backgroundColor = BAYER_BLUE_LT; }}
            onMouseLeave={e => { if (!generatingTicket) e.currentTarget.style.backgroundColor = BAYER_BLUE; }}
          >
            {generatingTicket ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {generatingTicket ? 'Generating...' : 'Download Ticket Report'}
          </button>
          <p style={{ color: 'var(--text-tertiary)' }} className="font-body text-[10px] mt-3 leading-relaxed">
            Includes: executive summary, KPI metrics, charts (priority & category pie charts, office distribution, daily trends), breakdown tables, AI insights, and recent tickets list.
          </p>
        </div>

        {/* Feedback Report */}
        <div style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }} className="rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={14} style={{ color: BAYER_GREEN }} />
            <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Generate Feedback Report (PDF)
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label style={{ color: 'var(--text-tertiary)' }} className="block font-display text-[9px] uppercase tracking-wider mb-1.5">Period</label>
              <select value={fbReportType} onChange={e => setFbReportType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none"
                style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--text-tertiary)' }} className="block font-display text-[9px] uppercase tracking-wider mb-1.5">Office</label>
              <select value={fbReportOffice} onChange={e => setFbReportOffice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none"
                style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="all">All Offices</option>
                {officeNames.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={() => handleGenerateReport('feedback')}
            disabled={generatingFeedback}
            className="w-full px-4 py-2.5 rounded-lg font-display text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: BAYER_GREEN }}
            onMouseEnter={e => { if (!generatingFeedback) e.currentTarget.style.backgroundColor = '#45AA00'; }}
            onMouseLeave={e => { if (!generatingFeedback) e.currentTarget.style.backgroundColor = BAYER_GREEN; }}
          >
            {generatingFeedback ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {generatingFeedback ? 'Generating...' : 'Download Feedback Report'}
          </button>
          <p style={{ color: 'var(--text-tertiary)' }} className="font-body text-[10px] mt-3 leading-relaxed">
            Includes: executive summary, satisfaction KPIs (overall, quality, response, communication, professionalism), rating distribution chart, category satisfaction table, AI recommendations, and recent feedback list.
          </p>
        </div>
      </div>
    </div>
  );
}
