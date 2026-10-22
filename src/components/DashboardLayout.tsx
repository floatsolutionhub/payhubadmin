import React from 'react';
import { Box } from '@mui/material';
import Sidebar, { type SidebarMenuItem } from './Sidebar';
interface DashboardLayoutProps {
  children: React.ReactNode;
  menuItems: SidebarMenuItem[];
}
export default function DashboardLayout({
  children,
  menuItems
}: DashboardLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#F9FAFB'
      }}>

      <Sidebar menuItems={menuItems} />
      <Box
        sx={{
          flex: 1,
          ml: '280px',
          p: 4
        }}>

        {children}
      </Box>
    </Box>);

}
