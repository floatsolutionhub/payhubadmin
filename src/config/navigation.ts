import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  UserIcon,
  FileTextIcon,
  type LucideIcon} from
'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

export const adminNavItems: NavItem[] = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, path: '/admin/dashboard' }
];


export const employeeNavItems: NavItem[] = [
{
  label: 'Dashboard',
  icon: LayoutDashboardIcon,
  path: '/employee/dashboard'
},
{
  label: 'Onboarding',
  icon: ClipboardListIcon,
  path: '/employee/onboarding'
},
{ label: 'My Profile', icon: UserIcon, path: '/employee/profile' },
{ label: 'Documents', icon: FileTextIcon, path: '/employee/documents' }];


export const internNavItems: NavItem[] = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, path: '/intern/dashboard' },
{ label: 'Onboarding', icon: ClipboardListIcon, path: '/intern/onboarding' },
{ label: 'My Profile', icon: UserIcon, path: '/intern/profile' },
{ label: 'Documents', icon: FileTextIcon, path: '/intern/documents' }];
