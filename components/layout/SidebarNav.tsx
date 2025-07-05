// src/components/layout/SidebarNav.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types';
import { Icons, Icon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  roles: UserRole[];
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'Dashboard', roles: ['Admin', 'HR', 'Employee', 'Payroll Partner', 'Recruiter', 'Supervisor'] },
  { href: '/communications', label: 'Communications', icon: 'Megaphone', roles: ['Admin', 'HR', 'Employee', 'Payroll Partner', 'Recruiter', 'Supervisor'] },
  { 
    href: '#core-hr', 
    label: 'Core HR', 
    icon: 'Users', 
    roles: ['Admin', 'HR', 'Employee', 'Payroll Partner', 'Recruiter', 'Supervisor'],
    subItems: [
      { href: '/user-management', label: 'Employee Database', icon: 'Users', roles: ['Admin', 'HR', 'Payroll Partner'] },
      { href: '/onboarding', label: 'Onboarding & Offboarding', icon: 'ClipboardCheck', roles: ['Admin', 'HR'] },
      { href: '/documents', label: 'Document Management', icon: 'Files', roles: ['Admin', 'HR', 'Employee'] },
      { href: '/org-chart', label: 'Organizational Chart', icon: 'OrgChart', roles: ['Admin', 'HR', 'Employee', 'Payroll Partner', 'Recruiter', 'Supervisor'] },
      { href: '/compliance', label: 'Compliance Center', icon: 'ShieldCheck', roles: ['Admin', 'HR'] },
    ]
  },
  { 
    href: '#talent-management', 
    label: 'Talent Management', 
    icon: 'Briefcase', 
    roles: ['Admin', 'HR', 'Employee', 'Payroll Partner', 'Recruiter', 'Supervisor'],
    subItems: [
      { href: '/recruitment/jobs', label: 'Job Postings (ATS)', icon: 'Briefcase', roles: ['Admin', 'HR', 'Recruiter', 'Payroll Partner'] },
      { href: '/recruitment/candidates', label: 'Candidates (ATS)', icon: 'Applicants', roles: ['Admin', 'HR', 'Recruiter', 'Payroll Partner'] },
      { href: '/performance', label: 'Performance Mgt.', icon: 'TrendingUp', roles: ['Admin', 'HR', 'Employee', 'Supervisor'] },
      { href: '/training', label: 'Training & LMS', icon: 'BookOpen', roles: ['Admin', 'HR', 'Employee'] },
      { href: '/succession-planning', label: 'Succession Planning', icon: 'TrendingUp', roles: ['Admin', 'HR'] },
      { href: '/compensation-management', label: 'Compensation Mgt.', icon: 'Payroll', roles: ['Admin', 'HR'] },
    ]
  },
   { 
    href: '#workforce-management', 
    label: 'Workforce Management', 
    icon: 'CalendarClock', 
    roles: ['Admin', 'HR', 'Employee', 'Supervisor'],
    subItems: [
      { href: '/time-tracking', label: 'Time & Attendance', icon: 'TimeLog', roles: ['Admin', 'HR', 'Employee', 'Supervisor'] },
      { href: '/leave-management', label: 'Leave Management', icon: 'Leave', roles: ['Admin', 'HR', 'Employee', 'Supervisor'] },
      { href: '/scheduling', label: 'Workforce Scheduling', icon: 'CalendarClock', roles: ['Admin', 'HR', 'Supervisor'] },
    ]
  },
  { 
    href: '#payroll-benefits', 
    label: 'Payroll & Benefits', 
    icon: 'Payroll', 
    roles: ['Admin', 'HR', 'Payroll Partner', 'Employee'],
    subItems: [
      { href: '/payroll/run', label: 'Run Payroll', icon: 'PaymentSchedule', roles: ['Admin', 'HR', 'Payroll Partner'] },
      { href: '/payroll/payslips', label: 'My Payslips', icon: 'TaxManagement', roles: ['Employee'] },
      { href: '/payroll/reports', label: 'Payroll Reports', icon: 'Reports', roles: ['Admin', 'HR', 'Payroll Partner'] },
      { href: '/payroll/closure', label: 'Payroll Closure', icon: 'ClipboardCheck', roles: ['Admin', 'HR', 'Payroll Partner'] },
      { href: '/payment-scheduling', label: 'Payment Schedules Setup', icon: 'PaymentSchedule', roles: ['Admin', 'HR'] },
      { href: '/benefits', label: 'Benefits Administration', icon: 'ShieldCheck', roles: ['Admin', 'HR', 'Employee'] },
      { href: '/expense-management', label: 'Expense Management', icon: 'ExpenseManagement', roles: ['Admin', 'HR', 'Employee'] },
      { href: '/tax-management', label: 'Tax Management', icon: 'TaxManagement', roles: ['Admin', 'HR', 'Payroll Partner'] },
    ]
  },
  { 
    href: '#engagement-experience', 
    label: 'Employee Engagement', 
    icon: 'HeartPulse', 
    roles: ['Admin', 'HR', 'Employee', 'Payroll Partner', 'Recruiter', 'Supervisor'],
    subItems: [
      { href: '/surveys', label: 'Surveys & Feedback', icon: 'Surveys', roles: ['Admin', 'HR', 'Employee'] },
      { href: '/recognition', label: 'Recognition & Rewards', icon: 'Gift', roles: ['Admin', 'HR', 'Employee', 'Supervisor'] },
      { href: '/wellness', label: 'Wellness Hub', icon: 'Wellness', roles: ['Admin', 'HR', 'Employee', 'Payroll Partner', 'Recruiter', 'Supervisor'] },
      { href: '/hr-helpdesk', label: 'HR Helpdesk', icon: 'HelpCircle', roles: ['Admin', 'HR', 'Employee', 'Payroll Partner', 'Recruiter', 'Supervisor'] },
    ]
  },
  { 
    href: '#analytics-strategy', 
    label: 'Analytics & Strategy', 
    icon: 'Analytics', 
    roles: ['Admin', 'HR'],
    subItems: [
      { href: '/hr-analytics', label: 'HR Analytics Hub', icon: 'Analytics', roles: ['Admin', 'HR'] },
      { href: '/workforce-planning', label: 'Workforce Planning', icon: 'TrendingUp', roles: ['Admin', 'HR'] },
    ]
  },
  // Standalone items that might not fit well in above groups or are specific
  { href: '/approvals', label: 'Approval Center', icon: 'Applicants', roles: ['Admin', 'HR', 'Supervisor'] },
  { href: '/asset-management', label: 'Asset Management', icon: 'AssetManagement', roles: ['Admin', 'HR', 'Employee'] },
  { href: '/bureau-dashboard', label: 'Payroll Partner View', icon: 'Company', roles: ['Payroll Partner'] }, 
  { href: '/settings', label: 'System Settings', icon: 'Settings', roles: ['Admin', 'HR', 'Employee', 'Payroll Partner', 'Recruiter', 'Supervisor'] }, 
];

export function SidebarNav({ userRole }: { userRole: UserRole | undefined }) {
  const pathname = usePathname();

  if (!userRole) return null;

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const IconComponent = Icons[item.icon];
    // For parent accordion items, isActive should also consider if any of its children are active
    let isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/' && !item.href.startsWith('#') && pathname.startsWith(item.href));
    if (item.subItems && item.subItems.length > 0) {
      isActive = isActive || item.subItems.some(sub => pathname.startsWith(sub.href) && sub.roles.includes(userRole));
    }


    if (!item.roles.includes(userRole)) {
      return null;
    }

    const visibleSubItems = item.subItems?.filter(sub => sub.roles.includes(userRole)) || [];

    if (item.href.startsWith('#') && visibleSubItems.length > 0) { // This is an Accordion group trigger
      return (
        <AccordionItem value={item.label} className="border-none" key={item.label}>
          <AccordionTrigger 
            className={cn(
              "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>svg:last-child]:group-data-[collapsible=icon]:hidden",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
              "py-2 px-2" 
            )}
          >
            <div className="flex items-center gap-2">
              {IconComponent ? <IconComponent className="h-4 w-4" /> : <Icons.Settings className="h-4 w-4"/>}
              <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuSub className="ml-4 mt-1 border-l border-sidebar-border/50 pl-3">
              {visibleSubItems.map(subItem => renderNavItem(subItem, true))}
            </SidebarMenuSub>
          </AccordionContent>
        </AccordionItem>
      );
    } else if (item.href.startsWith('#') && visibleSubItems.length === 0) {
      // Don't render group if no visible sub-items
      return null;
    }


    const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
    const ItemComponent = isSubItem ? SidebarMenuSubItem : SidebarMenuItem;

    return (
      <ItemComponent key={item.href}>
        <Link href={item.href} legacyBehavior passHref>
          <ButtonComponent isActive={isActive} tooltip={item.label}>
            {IconComponent ? <IconComponent className="h-4 w-4"/> : <Icons.Settings className="h-4 w-4"/>}
            <span className="truncate">{item.label}</span>
          </ButtonComponent>
        </Link>
      </ItemComponent>
    );
  };
  
  return (
    <Accordion type="multiple" className="w-full">
      <SidebarMenu>
         {navItems.map(item => renderNavItem(item))}
      </SidebarMenu>
    </Accordion>
  );
}