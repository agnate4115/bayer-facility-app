import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Building2,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { API_URL } from '@/config';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// Bayer Brand Colors
const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';

// Mock data removed, computations done dynamically

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
          style={{ backgroundColor: 'var(--surface-light)',
          border: '1px solid var(--border)' }}
       className="rounded-lg px-3 py-2">
        {payload.map((entry: any, i: number) => (
          <p key={i}   style={{ color: entry.color }} className="font-body text-xs">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardOverview() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, feedbacksRes, auditLogsRes] = await Promise.all([
          fetch(`${API_URL}/api/tickets/`),
          fetch(`${API_URL}/api/feedback/`),
          fetch(`${API_URL}/api/audit-logs/`)
        ]);
        
        if (ticketsRes.ok) setTickets(await ticketsRes.json());
        if (feedbacksRes.ok) setFeedbacks(await feedbacksRes.json());
        if (auditLogsRes.ok) setAuditLogs(await auditLogsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute metrics
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const totalFeedbacks = feedbacks.length;
  
  const resolutionRate = totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : '0.0';

  const p1Count = tickets.filter(t => t.priority === 'P1').length;
  const p2Count = tickets.filter(t => t.priority === 'P2').length;
  const p3Count = tickets.filter(t => t.priority === 'P3' || t.priority === 'Normal' || t.priority === 'Low').length;

  const priorityDistribution = [
    { name: 'P1 Critical', value: p1Count, color: BAYER_BLUE },
    { name: 'P2 High', value: p2Count, color: BAYER_CYAN },
    { name: 'P3 Normal', value: p3Count, color: BAYER_GREEN },
  ].filter(p => p.value > 0);

  // Tickets vs Feedback Data for last 7 days
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const ticketFeedbackData = last7Days.map(dateStr => {
    const d = new Date(dateStr);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const ticketsCount = tickets.filter(t => t.created_at.startsWith(dateStr)).length;
    const feedbackCount = feedbacks.filter(f => f.created_at.startsWith(dateStr)).length;
    return { name: label, Tickets: ticketsCount, Feedback: feedbackCount };
  });

  const recentTicketsList = [...tickets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

  const resolvedToday = tickets.filter(t => {
    if (t.status !== 'Resolved' && t.status !== 'Closed') return false;
    const updatedAt = new Date(t.updated_at);
    const today = new Date();
    return updatedAt.toDateString() === today.toDateString();
  }).length;

  const criticalOpen = tickets.filter(t => t.priority === 'P1' && t.status !== 'Resolved' && t.status !== 'Closed');

  const recentActivity = auditLogs.slice(0, 5).map(log => ({
    id: log.entity,
    action: log.action,
    office: log.user_name,
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: log.action_type.toLowerCase() === 'create' ? 'new' :
          log.action.toLowerCase().includes('resolve') ? 'resolved' :
          log.entity_type === 'Feedback' ? 'feedback' : 'progress'
  }));

  const criticalStats = [
    {
      label: 'Total Tickets',
      value: totalTickets,
      change: '+12%',
      trend: 'up',
      icon: Ticket,
      bgColor: `${BAYER_BLUE}15`,
      color: BAYER_BLUE,
    },
    {
      label: 'Active Now',
      value: activeTickets,
      change: '-5%',
      trend: 'down',
      icon: Activity,
      color: BAYER_CYAN,
      bgColor: `${BAYER_CYAN}15`,
    },
    {
      label: 'Total Feedbacks',
      value: totalFeedbacks,
      change: '+8%',
      trend: 'up',
      icon: MessageSquare,
      color: BAYER_BLUE,
      bgColor: `${BAYER_BLUE}15`,
    },
    {
      label: 'Resolution Rate',
      value: `${resolutionRate}%`,
      change: '+3%',
      trend: 'up',
      icon: CheckCircle,
      color: BAYER_GREEN,
      bgColor: `${BAYER_GREEN}15`,
    },
  ];

  const quickMetrics = [
    { label: 'Resolved Today', value: resolvedToday, icon: CheckCircle },
    { label: 'Critical Open', value: criticalOpen.length, icon: AlertCircle },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Command Center Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
              style={{ backgroundColor: BAYER_GREEN }}
          className="w-2 h-2 rounded-full animate-pulse" />
          <h1   style={{ color: 'var(--text-primary)' }} className="font-display text-xl lg:text-2xl font-medium">
            Command Center
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p   style={{ color: 'var(--text-secondary)' }} className="font-body text-sm">
            Real-time facility operations across all offices
          </p>
          <div className="flex items-center gap-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className="px-3 py-1.5 rounded-md font-display text-[8px] uppercase tracking-wider transition-colors"  style={{ backgroundColor: timeRange === range ? `${BAYER_CYAN}15` : 'transparent',
                  color: timeRange === range ? BAYER_CYAN : 'var(--text-secondary)',
                  border: timeRange === range ? `1px solid ${BAYER_CYAN}30` : '1px solid var(--border-subtle)' }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#56D500] mx-auto mb-4"></div>
          <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">Loading dashboard...</h3>
        </div>
      ) : (
      <>
      {/* Primary Stats - Hero Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {criticalStats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div
              key={stat.label}
                style={{ backgroundColor: 'var(--surface-mid)',
                border: '1px solid var(--border-subtle)' }}
             className="p-5 rounded-xl relative overflow-hidden">
              <div
                  style={{ backgroundColor: stat.color }}
              className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div
                      style={{ backgroundColor: stat.bgColor }}
                   className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Icon size={16}  style={{ color: stat.color }} />
                  </div>
                </div>
                <div   style={{ color: 'var(--text-primary)' }} className="font-mono text-2xl lg:text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <div   style={{ color: 'var(--text-tertiary)' }} className="font-display text-[8px] uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Metrics Bar */}
      <div
          style={{ backgroundColor: `${BAYER_CYAN}10`, border: `1px solid ${BAYER_CYAN}20` }}
       className="flex items-center justify-around p-4 rounded-xl mb-6">
        {quickMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="flex items-center gap-3">
              <Icon size={16}  style={{ color: BAYER_CYAN }} />
              <div>
                <div   style={{ color: 'var(--text-primary)' }} className="font-mono text-lg font-bold">
                  {metric.value}
                </div>
                <div   style={{ color: 'var(--text-secondary)' }} className="font-body text-xs">
                  {metric.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Priority Distribution */}
        <div
            style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}
         className="p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3   style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Priority Mix
            </h3>
            <Zap size={14}  style={{ color: BAYER_BLUE }} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={priorityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {priorityDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-3">
            {priorityDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                    style={{ backgroundColor: item.color }}
                className="w-2 h-2 rounded-full" />
                <span   style={{ color: 'var(--text-secondary)' }} className="font-body text-xs">
                  {item.name.split(' ')[0]}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets vs Feedback Trend */}
        <div
            style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}
         className="lg:col-span-2 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Tickets vs Feedback Ratio
            </h3>
            <Activity size={14} style={{ color: BAYER_CYAN }} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={ticketFeedbackData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--text-tertiary)', fontSize: 8, fontFamily: 'monospace' }} 
                axisLine={false} 
                tickLine={false} 
                dy={10} 
              />
              <YAxis 
                tick={{ fill: 'var(--text-tertiary)', fontSize: 8, fontFamily: 'monospace' }} 
                axisLine={false} 
                tickLine={false} 
                dx={-10} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-subtle)', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Line 
                type="monotone" 
                dataKey="Tickets" 
                stroke={BAYER_BLUE} 
                strokeWidth={3} 
                dot={{ r: 4, fill: BAYER_BLUE, strokeWidth: 0 }} 
                activeDot={{ r: 6, fill: BAYER_BLUE, stroke: '#FFFFFF', strokeWidth: 2 }} 
              />
              <Line 
                type="monotone" 
                dataKey="Feedback" 
                stroke={BAYER_CYAN} 
                strokeWidth={3} 
                dot={{ r: 4, fill: BAYER_CYAN, strokeWidth: 0 }} 
                activeDot={{ r: 6, fill: BAYER_CYAN, stroke: '#FFFFFF', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Activity Feed & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Feed */}
        <div
            style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}
         className="p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <div
                style={{ backgroundColor: BAYER_GREEN }}
            className="w-2 h-2 rounded-full animate-pulse" />
            <h3   style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Live Activity
            </h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                  style={{ borderColor: 'var(--border-subtle)' }}
               className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === 'new' ? 'animate-pulse' : ''
                    }`}
                     style={{ backgroundColor:
                        activity.type === 'new' ? BAYER_CYAN :
                        activity.type === 'resolved' ? BAYER_GREEN :
                        activity.type === 'feedback' ? BAYER_BLUE :
                        BAYER_CYAN }}
                  />
                  <div className="flex-1 min-w-0">
                    <p   style={{ color: BAYER_CYAN }} className="font-mono text-xs truncate">
                      {activity.id}
                    </p>
                    <p   style={{ color: 'var(--text-secondary)' }} className="font-body text-xs truncate">
                      {activity.action} · {activity.office}
                    </p>
                  </div>
                </div>
                <span   style={{ color: 'var(--text-tertiary)' }} className="font-body text-xs flex-shrink-0">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/admin/tickets"
              style={{ backgroundColor: `${BAYER_CYAN}10`, color: BAYER_CYAN }}
           className="block mt-4 text-center py-2 rounded-lg font-display text-xs uppercase tracking-wider transition-colors">
            View All Tickets
          </Link>
        </div>

        {/* Recent Tickets */}
        <div
            style={{ backgroundColor: 'var(--surface-mid)', border: '1px solid var(--border-subtle)' }}
         className="p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Ticket size={14} style={{ color: BAYER_BLUE }} />
            <h3 style={{ color: 'var(--text-secondary)' }} className="font-display text-xs uppercase tracking-widest">
              Recent Tickets
            </h3>
          </div>
          <div className="space-y-3">
            {recentTicketsList.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/admin/tickets/${ticket.id}`}
                  style={{ backgroundColor: 'var(--surface-light)', border: '1px solid var(--border-subtle)' }}
               className="block p-3 rounded-lg hover:border-[#00314E] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: 'var(--text-primary)' }} className="font-mono text-xs font-bold">
                    {ticket.id.substring(0, 8).toUpperCase()}
                  </span>
                  <span
                      style={{ 
                        backgroundColor: `${
                          ticket.priority === 'P1' ? '#EF4444' : 
                          ticket.priority === 'P2' ? BAYER_CYAN : BAYER_GREEN
                        }15`, 
                        color: ticket.priority === 'P1' ? '#DC2626' : 
                               ticket.priority === 'P2' ? BAYER_CYAN : BAYER_GREEN 
                      }}
                   className="font-display text-[7px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold">
                    {ticket.priority}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }} className="font-body text-xs line-clamp-2 mb-2">
                  {ticket.description}
                </p>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-tertiary)' }} className="font-body text-xs">
                    {ticket.office?.name || ticket.office_id.substring(0, 8)}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }} className="font-body text-xs">
                    {ticket.category_name || 'Uncategorized'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {recentTicketsList.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle size={32} style={{ color: BAYER_GREEN }} className="mx-auto mb-2 opacity-50" />
              <p style={{ color: 'var(--text-secondary)' }} className="font-body text-xs">
                No recent tickets
              </p>
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
