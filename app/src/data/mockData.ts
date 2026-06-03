export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'Submitted' | 'Acknowledged' | 'Assigned' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed' | 'Escalated';
  priority: 'P1' | 'P2' | 'P3';
  category: string;
  assignee: string;
  assigneeAvatar?: string;
  office: string;
  floor: string;
  zone: string;
  locationId: string;
  createdAt: string;
  slaDeadline: string;
  slaElapsed: number; // percentage 0-100
  reportedBy: string;
  reportedByEmail: string;
  department: string;
  aiSummary: string;
  photos?: string[]; // Array of image URLs
  team?: string; // Team name for reassignment
}

export const mockTickets: Ticket[] = [
  {
    id: 'BYR-THN-2026-003847',
    subject: 'Air conditioning unit non-functional',
    description: 'The AC unit in the cafeteria area on Floor 3 has not been operational since morning. Multiple employees are affected. Immediate attention required.',
    status: 'In Progress',
    priority: 'P2',
    category: 'HVAC / AC',
    assignee: 'Rahul Sharma',
    office: 'Thane',
    floor: '3',
    zone: 'Cafeteria',
    locationId: 'BAYER-THN-03-CAFE',
    createdAt: '2026-05-25T09:14:33Z',
    slaDeadline: '2026-05-25T17:14:33Z',
    slaElapsed: 65,
    reportedBy: 'Priya Patel',
    reportedByEmail: 'priya.patel@bayer.com',
    department: 'Finance',
    aiSummary: 'HVAC unit failure in cafeteria affecting employee comfort',
    photos: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800', 'https://images.unsplash.com/photo-1604754742629-3e5728249d73?w=800'],
    team: 'HVAC Team',
  },
  {
    id: 'BYR-THN-2026-003848',
    subject: 'Exposed live wire near workstation',
    description: 'There is an exposed electrical wire hanging near desk 42 on Floor 5. This is a serious safety hazard that needs immediate attention.',
    status: 'Escalated',
    priority: 'P1',
    category: 'Electrical',
    assignee: 'Amit Kumar',
    office: 'Thane',
    floor: '5',
    zone: 'Workstation B',
    locationId: 'BAYER-THN-05-WS-B',
    createdAt: '2026-05-28T08:30:00Z',
    slaDeadline: '2026-05-28T10:30:00Z',
    slaElapsed: 95,
    reportedBy: 'Sneha Gupta',
    reportedByEmail: 'sneha.gupta@bayer.com',
    department: 'HR',
    aiSummary: 'Critical electrical safety hazard — exposed wiring near employee workstation',
    photos: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800', 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=800', 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800'],
    team: 'Electrical Team',
  },
  {
    id: 'BYR-MUM-2026-001923',
    subject: 'Chair is wobbly and unstable',
    description: 'My office chair has a broken wheel and wobbles when I sit. It is becoming uncomfortable to work. Could someone please fix or replace it?',
    status: 'Assigned',
    priority: 'P3',
    category: 'Furniture',
    assignee: 'Vikram Singh',
    office: 'Mumbai',
    floor: '2',
    zone: 'Workstation A',
    locationId: 'BAYER-MUM-02-WS-A',
    createdAt: '2026-05-27T14:22:00Z',
    slaDeadline: '2026-05-29T14:22:00Z',
    slaElapsed: 30,
    reportedBy: 'Arjun Mehta',
    reportedByEmail: 'arjun.mehta@bayer.com',
    department: 'IT',
    aiSummary: 'Broken office chair wheel requiring repair or replacement',
  },
  {
    id: 'BYR-THN-2026-003849',
    subject: 'Washroom out of order on Floor 4',
    description: 'The men\'s washroom on Floor 4 near the conference area is completely out of order. The toilet is clogged and there is water leaking.',
    status: 'Acknowledged',
    priority: 'P2',
    category: 'Plumbing',
    assignee: 'Suresh Reddy',
    office: 'Thane',
    floor: '4',
    zone: 'Conference Area',
    locationId: 'BAYER-THN-04-CONF',
    createdAt: '2026-05-28T07:15:00Z',
    slaDeadline: '2026-05-28T15:15:00Z',
    slaElapsed: 45,
    reportedBy: 'Neha Joshi',
    reportedByEmail: 'neha.joshi@bayer.com',
    department: 'Marketing',
    aiSummary: 'Plumbing failure in Floor 4 washroom — clogged toilet and water leak',
  },
  {
    id: 'BYR-THN-2026-003850',
    subject: 'Conference Room B projector not working',
    description: 'The projector in Conference Room B on Floor 5 is displaying a blue screen only. HDMI connection is not being detected.',
    status: 'In Progress',
    priority: 'P2',
    category: 'IT Infrastructure',
    assignee: 'Deepak Nair',
    office: 'Thane',
    floor: '5',
    zone: 'Conference Room B',
    locationId: 'BAYER-THN-05-CONF-B',
    createdAt: '2026-05-28T06:00:00Z',
    slaDeadline: '2026-05-28T14:00:00Z',
    slaElapsed: 72,
    reportedBy: 'Karan Shah',
    reportedByEmail: 'karan.shah@bayer.com',
    department: 'Operations',
    aiSummary: 'Projector HDMI detection failure in Conference Room B',
  },
  {
    id: 'BYR-THN-2026-003851',
    subject: 'Light flickering in corridor near pantry',
    description: 'The corridor lights between the pantry and the elevator on Floor 2 have been flickering for the past two days.',
    status: 'Submitted',
    priority: 'P3',
    category: 'Electrical',
    assignee: 'Unassigned',
    office: 'Thane',
    floor: '2',
    zone: 'Pantry Corridor',
    locationId: 'BAYER-THN-02-PANTRY',
    createdAt: '2026-05-28T09:00:00Z',
    slaDeadline: '2026-05-30T09:00:00Z',
    slaElapsed: 10,
    reportedBy: 'Anita Desai',
    reportedByEmail: 'anita.desai@bayer.com',
    department: 'Legal',
    aiSummary: 'Flickering corridor lights near pantry area — electrical maintenance needed',
  },
  {
    id: 'BYR-MUM-2026-001924',
    subject: 'Lift stuck with person inside',
    description: 'The main elevator is stuck between floors 3 and 4 with a person trapped inside. Emergency assistance needed immediately.',
    status: 'Resolved',
    priority: 'P1',
    category: 'Lift / Elevator',
    assignee: 'Ramesh Iyer',
    office: 'Mumbai',
    floor: '3',
    zone: 'Elevator Lobby',
    locationId: 'BAYER-MUM-03-LIFT',
    createdAt: '2026-05-27T10:00:00Z',
    slaDeadline: '2026-05-27T12:00:00Z',
    slaElapsed: 100,
    reportedBy: 'Meera Krishnan',
    reportedByEmail: 'meera.krishnan@bayer.com',
    department: 'Sales',
    aiSummary: 'Elevator entrapment emergency — person trapped between floors',
  },
  {
    id: 'BYR-THN-2026-003852',
    subject: 'Pantry microwave sparking',
    description: 'The microwave in the Floor 3 pantry is making sparking noises and smells like burning. We have stopped using it.',
    status: 'Assigned',
    priority: 'P2',
    category: 'Pantry / Kitchen',
    assignee: 'Lakshmi Menon',
    office: 'Thane',
    floor: '3',
    zone: 'Pantry',
    locationId: 'BAYER-THN-03-PANTRY',
    createdAt: '2026-05-28T08:00:00Z',
    slaDeadline: '2026-05-28T16:00:00Z',
    slaElapsed: 50,
    reportedBy: 'Rajesh Khanna',
    reportedByEmail: 'rajesh.khanna@bayer.com',
    department: 'R&D',
    aiSummary: 'Microwave sparking and burning smell in Floor 3 pantry — safety hazard',
  },
  {
    id: 'BYR-THN-2026-003853',
    subject: 'Carpet stain and odour in reception',
    description: 'The carpet in the reception area has a large coffee stain and unpleasant odour. Needs professional cleaning.',
    status: 'Acknowledged',
    priority: 'P3',
    category: 'Housekeeping',
    assignee: 'Sunita Devi',
    office: 'Thane',
    floor: '1',
    zone: 'Reception',
    locationId: 'BAYER-THN-01-RECEP',
    createdAt: '2026-05-27T16:30:00Z',
    slaDeadline: '2026-05-29T16:30:00Z',
    slaElapsed: 25,
    reportedBy: 'David Thomas',
    reportedByEmail: 'david.thomas@bayer.com',
    department: 'Admin',
    aiSummary: 'Reception carpet cleaning required — stain and odour removal',
  },
  {
    id: 'BYR-THN-2026-003854',
    subject: 'Security camera not recording Floor 5',
    description: 'The security camera covering the west corridor of Floor 5 appears to be offline. The red recording light is not on.',
    status: 'In Progress',
    priority: 'P2',
    category: 'Access / Security',
    assignee: 'Prakash Rao',
    office: 'Thane',
    floor: '5',
    zone: 'West Corridor',
    locationId: 'BAYER-THN-05-WEST',
    createdAt: '2026-05-28T05:00:00Z',
    slaDeadline: '2026-05-28T13:00:00Z',
    slaElapsed: 78,
    reportedBy: 'Fatima Sheikh',
    reportedByEmail: 'fatima.sheikh@bayer.com',
    department: 'Security',
    aiSummary: 'Security camera offline on Floor 5 west corridor — surveillance gap',
  },
  {
    id: 'BYR-MUM-2026-001925',
    subject: 'Server room temperature alarm',
    description: 'The server room on Floor 1 is showing temperature above threshold on the monitoring panel. Current reading is 28°C.',
    status: 'Escalated',
    priority: 'P1',
    category: 'IT Infrastructure',
    assignee: 'Nikhil Banerjee',
    office: 'Mumbai',
    floor: '1',
    zone: 'Server Room',
    locationId: 'BAYER-MUM-01-SERVER',
    createdAt: '2026-05-28T08:45:00Z',
    slaDeadline: '2026-05-28T10:45:00Z',
    slaElapsed: 88,
    reportedBy: 'System Monitor',
    reportedByEmail: 'sysmon@bayer.com',
    department: 'IT',
    aiSummary: 'Server room overheating — temperature at 28°C exceeding threshold',
  },
  {
    id: 'BYR-THN-2026-003855',
    subject: 'Pest infestation in pantry storage',
    description: 'There are signs of rodent activity in the pantry storage room on Floor 2. Droppings found near the dry goods shelf.',
    status: 'Submitted',
    priority: 'P2',
    category: 'Pest Control',
    assignee: 'Unassigned',
    office: 'Thane',
    floor: '2',
    zone: 'Pantry Storage',
    locationId: 'BAYER-THN-02-PSTORE',
    createdAt: '2026-05-28T09:30:00Z',
    slaDeadline: '2026-05-28T17:30:00Z',
    slaElapsed: 20,
    reportedBy: 'Chef Ramesh',
    reportedByEmail: 'ramesh.chef@bayer.com',
    department: 'Facilities',
    aiSummary: 'Rodent infestation in pantry storage — pest control required',
  },
  {
    id: 'BYR-THN-2026-003856',
    subject: 'Glass door hinge loose',
    description: 'The glass door to Meeting Room A on Floor 4 has a loose hinge and makes a creaking sound. Might fall off soon.',
    status: 'Acknowledged',
    priority: 'P3',
    category: 'Furniture',
    assignee: 'Manoj Tiwari',
    office: 'Thane',
    floor: '4',
    zone: 'Meeting Room A',
    locationId: 'BAYER-THN-04-MR-A',
    createdAt: '2026-05-26T11:00:00Z',
    slaDeadline: '2026-05-28T11:00:00Z',
    slaElapsed: 90,
    reportedBy: 'Lisa Chen',
    reportedByEmail: 'lisa.chen@bayer.com',
    department: 'Procurement',
    aiSummary: 'Loose glass door hinge in Meeting Room A — potential safety issue',
  },
  {
    id: 'BYR-MUM-2026-001926',
    subject: 'Fire extinguisher inspection overdue',
    description: 'The fire extinguisher near the east staircase on Floor 3 has an inspection tag dated March 2026. It is now overdue.',
    status: 'Assigned',
    priority: 'P2',
    category: 'Safety',
    assignee: 'Inspector Kumar',
    office: 'Mumbai',
    floor: '3',
    zone: 'East Staircase',
    locationId: 'BAYER-MUM-03-EAST',
    createdAt: '2026-05-26T09:00:00Z',
    slaDeadline: '2026-05-28T09:00:00Z',
    slaElapsed: 85,
    reportedBy: 'Safety Officer',
    reportedByEmail: 'safety@bayer.com',
    department: 'Compliance',
    aiSummary: 'Fire extinguisher inspection overdue — compliance issue',
  },
  {
    id: 'BYR-THN-2026-003857',
    subject: 'Wi-Fi dead zone in southwest corner',
    description: 'The southwest corner of Floor 2 has very weak Wi-Fi signal. Employees cannot connect to the corporate network in that area.',
    status: 'In Progress',
    priority: 'P2',
    category: 'IT Infrastructure',
    assignee: 'Deepak Nair',
    office: 'Thane',
    floor: '2',
    zone: 'Southwest Corner',
    locationId: 'BAYER-THN-02-SW',
    createdAt: '2026-05-25T13:00:00Z',
    slaDeadline: '2026-05-27T13:00:00Z',
    slaElapsed: 100,
    reportedBy: 'Anil Kapoor',
    reportedByEmail: 'anil.kapoor@bayer.com',
    department: 'IT',
    aiSummary: 'Wi-Fi coverage gap in Floor 2 southwest corner — network infrastructure issue',
  },
];

export const offices = ['Thane', 'Mumbai'];

export const floors = ['1', '2', '3', '4', '5'];

export const zones = [
  'Cafeteria', 'Workstation A', 'Workstation B', 'Conference Room A',
  'Conference Room B', 'Pantry', 'Reception', 'Elevator Lobby',
  'Server Room', 'West Corridor', 'East Staircase', 'Southwest Corner',
  'Pantry Storage', 'Meeting Room A', 'Pantry Corridor',
];

export const categories = [
  'Plumbing', 'Electrical', 'HVAC / AC', 'Furniture', 'Housekeeping',
  'IT Infrastructure', 'Safety', 'Lift / Elevator', 'Pantry / Kitchen',
  'Pest Control', 'Access / Security', 'Other',
];

export const assignees = [
  'Rahul Sharma', 'Amit Kumar', 'Vikram Singh', 'Suresh Reddy',
  'Deepak Nair', 'Ramesh Iyer', 'Lakshmi Menon', 'Sunita Devi',
  'Prakash Rao', 'Nikhil Banerjee', 'Manoj Tiwari', 'Inspector Kumar',
  'Unassigned',
];

export const statusLabels: Record<string, string> = {
  Submitted: 'Submitted',
  Acknowledged: 'Acknowledged',
  Assigned: 'Assigned',
  'In Progress': 'In Progress',
  'On Hold': 'On Hold',
  Resolved: 'Resolved',
  Closed: 'Closed',
  Escalated: 'Escalated',
};

export const priorityLabels: Record<string, { label: string; color: string }> = {
  P1: { label: 'Critical', color: '#EF4444' },
  P2: { label: 'High', color: '#F59E0B' },
  P3: { label: 'Low', color: '#0055FF' },
};

// Analytics data
export const ticketsByCategory = [
  { name: 'HVAC / AC', value: 18 },
  { name: 'Electrical', value: 14 },
  { name: 'Plumbing', value: 12 },
  { name: 'IT Infra', value: 16 },
  { name: 'Furniture', value: 10 },
  { name: 'Housekeeping', value: 8 },
  { name: 'Safety', value: 6 },
  { name: 'Other', value: 16 },
];

export const ticketsByOffice = [
  { name: 'Thane', tickets: 156, resolved: 132 },
  { name: 'Mumbai', tickets: 98, resolved: 85 },
];

export const ticketsByPriority = [
  { name: 'P1', value: 24, color: '#EF4444' },
  { name: 'P2', value: 68, color: '#F59E0B' },
  { name: 'P3', value: 162, color: '#0055FF' },
];

export const weeklyTrend = [
  { day: 'Mon', opened: 32, resolved: 28 },
  { day: 'Tue', opened: 45, resolved: 38 },
  { day: 'Wed', opened: 38, resolved: 42 },
  { day: 'Thu', opened: 52, resolved: 35 },
  { day: 'Fri', opened: 41, resolved: 48 },
  { day: 'Sat', opened: 12, resolved: 18 },
  { day: 'Sun', opened: 8, resolved: 10 },
];

export const slaMetrics = {
  p1AckRate: 96,
  p2ResolutionRate: 92,
  avgResolutionTime: '4.2h',
  feedbackResponseRate: 43,
  systemUptime: 99.7,
};

export const dashboardStats = {
  totalTickets: 254,
  openTickets: 42,
  inProgress: 28,
  resolvedToday: 18,
  slaBreaches: 3,
  avgResponseTime: '12m',
};

// QR Code data
export const mockQRCodes = [
  { id: 'qr-001', locationId: 'BAYER-THN-03-CAFE', office: 'Thane', floor: '3', zone: 'Cafeteria', createdAt: '2026-05-01', ticketCount: 12, status: 'active' as const },
  { id: 'qr-002', locationId: 'BAYER-THN-05-CONF-B', office: 'Thane', floor: '5', zone: 'Conference Room B', createdAt: '2026-05-01', ticketCount: 8, status: 'active' as const },
  { id: 'qr-003', locationId: 'BAYER-MUM-02-RECEP', office: 'Mumbai', floor: '2', zone: 'Reception', createdAt: '2026-05-03', ticketCount: 5, status: 'active' as const },
  { id: 'qr-004', locationId: 'BAYER-THN-04-MR-A', office: 'Thane', floor: '4', zone: 'Meeting Room A', createdAt: '2026-05-05', ticketCount: 3, status: 'retired' as const },
  { id: 'qr-005', locationId: 'BAYER-MUM-01-SERVER', office: 'Mumbai', floor: '1', zone: 'Server Room', createdAt: '2026-05-10', ticketCount: 15, status: 'active' as const },
];

// Feedback data
export interface Feedback {
  id: string;
  ticketId: string;
  rating: number;
  comment: string;
  technician: string;
  date: string;
  submittedBy?: string;
  resolutionQuality?: number;
  responseTime?: number;
  communication?: number;
  professionalism?: number;
  wentWell?: string;
  improvements?: string;
}

export const feedbackData: Feedback[] = [
  { id: 'fb-001', ticketId: 'BYR-THN-2026-003847', rating: 5, comment: 'Very quick response, AC was fixed within 2 hours!', technician: 'Rahul Sharma', date: '2026-05-25', submittedBy: 'Priya Patel' },
  { id: 'fb-002', ticketId: 'BYR-MUM-2026-001923', rating: 4, comment: 'Chair replaced promptly. Good service.', technician: 'Vikram Singh', date: '2026-05-27', submittedBy: 'Rajesh Kumar' },
  { id: 'fb-003', ticketId: 'BYR-THN-2026-003849', rating: 3, comment: 'Took longer than expected but eventually resolved.', technician: 'Suresh Reddy', date: '2026-05-28', submittedBy: 'Anita Deshmukh' },
  { id: 'fb-004', ticketId: 'BYR-MUM-2026-001924', rating: 5, comment: 'Excellent emergency response. Very professional.', technician: 'Ramesh Iyer', date: '2026-05-27', submittedBy: 'Amit Verma' },
  { id: 'fb-005', ticketId: 'BYR-THN-2026-003853', rating: 4, comment: 'Carpet looks brand new now!', technician: 'Sunita Devi', date: '2026-05-28', submittedBy: 'Kavita Shah' },
];
