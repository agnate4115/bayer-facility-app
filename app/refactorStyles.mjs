import fs from 'fs';
import path from 'path';

const files = [
  'src/components/TicketDetailView.tsx',
  'src/components/FeedbackDetailView.tsx',
  'src/pages/admin/PeopleManagement.tsx',
  'src/pages/admin/AuditLogs.tsx',
  'src/pages/admin/OfficeManagement.tsx',
  'src/pages/admin/AddOffice.tsx',
  'src/pages/admin/DashboardOverview.tsx',
  'src/pages/admin/TicketsPage.tsx',
  'src/pages/admin/SettingsPage.tsx',
  'src/pages/admin/QRCodesPage.tsx',
  'src/pages/admin/FeedbackManagement.tsx',
  'src/pages/admin/AnalyticsPage.tsx',
  'src/pages/employee/EmployeeDashboard.tsx',
  'src/pages/employee/NewTicket.tsx',
  'src/pages/employee/TicketHistory.tsx',
  'src/pages/employee/FeedbackHistory.tsx',
  'src/pages/employee/FeedbackForm.tsx'
];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf-8');

  // Both orders: className="..." style={{...}} AND style={{...}} className="..."
  const replacer = (match, p1, classNames, p3, styleBody, isReversed = false) => {
    let newClasses = classNames;
    let newStyle = styleBody;
    
    // Extract bg
    if (newStyle.includes("backgroundColor: '#F5F7FA'")) {
      newClasses += " bg-slate-50 dark:bg-slate-950";
      newStyle = newStyle.replace(/backgroundColor:\s*['"]#F5F7FA['"],?\s*/, '');
    }
    if (newStyle.includes("backgroundColor: '#FFFFFF'")) {
      newClasses += " bg-white dark:bg-slate-900";
      newStyle = newStyle.replace(/backgroundColor:\s*['"]#FFFFFF['"],?\s*/, '');
    }
    if (newStyle.includes("border: '1px solid #E1E8ED'")) {
      newClasses += " border border-slate-200 dark:border-slate-800";
      newStyle = newStyle.replace(/border:\s*['"]1px solid #E1E8ED['"],?\s*/, '');
    }
    if (newStyle.includes("borderColor: '#E1E8ED'")) {
      newClasses += " border-slate-200 dark:border-slate-800";
      newStyle = newStyle.replace(/borderColor:\s*['"]#E1E8ED['"],?\s*/, '');
    }
    
    // Extract colors
    if (newStyle.includes("color: 'oklch(0.25 0.02 250)'")) {
      newClasses += " text-slate-900 dark:text-slate-100";
      newStyle = newStyle.replace(/color:\s*['"]oklch\(0\.25 0\.02 250\)['"],?\s*/, '');
    }
    if (newStyle.includes("color: 'oklch(0.45 0.01 250)'")) {
      newClasses += " text-slate-500 dark:text-slate-400";
      newStyle = newStyle.replace(/color:\s*['"]oklch\(0\.45 0\.01 250\)['"],?\s*/, '');
    }
    if (newStyle.includes("color: 'oklch(0.6 0.01 250)'")) {
      newClasses += " text-slate-400 dark:text-slate-500";
      newStyle = newStyle.replace(/color:\s*['"]oklch\(0\.6 0\.01 250\)['"],?\s*/, '');
    }
    if (newStyle.includes("color: BAYER_BLUE")) {
      newClasses += " text-[#00314E] dark:text-slate-100";
      newStyle = newStyle.replace(/color:\s*BAYER_BLUE,?\s*/, '');
    }
    
    // Trim remaining styles
    newStyle = newStyle.trim();
    if (newStyle.endsWith(',')) newStyle = newStyle.slice(0, -1);
    
    const finalClasses = newClasses.trim().replace(/\s+/g, ' ');
    if (newStyle.length === 0 || newStyle === ' ' || newStyle === '\n') {
      return `className="${finalClasses}"`;
    } else {
      if (isReversed) {
        return `style={{ ${newStyle} }} className="${finalClasses}"`;
      } else {
        return `className="${finalClasses}" style={{ ${newStyle} }}`;
      }
    }
  };

  // className="..." style={{...}}
  content = content.replace(/className=(["'])(.*?)\1\s+style=\{\{([\s\S]*?)\}\}/g, (m, p1, p2, p3) => replacer(m, p1, p2, null, p3, false));
  
  // style={{...}} className="..."
  content = content.replace(/style=\{\{([\s\S]*?)\}\}\s+className=(["'])(.*?)\2/g, (m, p1, p2, p3) => replacer(m, null, p3, null, p1, true));

  // standalone style={{ backgroundColor: '#F5F7FA' }} -> className="..."
  content = content.replace(/style=\{\{([\s\S]*?)\}\}/g, (m, styleBody) => {
     let tempContent = `className="" style={{${styleBody}}}`;
     let result = tempContent.replace(/className=(["'])(.*?)\1\s+style=\{\{([\s\S]*?)\}\}/g, (m, p1, p2, p3) => replacer(m, p1, p2, null, p3, false));
     return result;
  });

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Processed ${file}`);
}

