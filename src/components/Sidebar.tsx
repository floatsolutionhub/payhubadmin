import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar } from
'@mui/material';
import { LogOutIcon, type LucideIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { clearApiAccessToken } from '../services/api';
import { oidcAuthService } from '../services/auth/oidcAuthService';

const useMockAuth = String(import.meta.env.VITE_USE_MOCK_AUTH || 'false').toLowerCase() === 'true';
export interface SidebarMenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
}
interface SidebarProps {
  menuItems: SidebarMenuItem[];
}
export default function Sidebar({ menuItems }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const displayName = user?.name || 'HR Admin';
  const displayEmail = user?.email || 'Not signed in';
  const displayInitials =
    user?.initials ||
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') ||
    'HR';

  const handleLogout = async () => {
    if (useMockAuth) {
      window.sessionStorage.removeItem('auth:mockUser');
      clearApiAccessToken();
      dispatch(logout());
      navigate('/auth/admin', { replace: true });
      return;
    }

    try {
      await oidcAuthService.startLogout();
    } catch {
      clearApiAccessToken();
      dispatch(logout());
      navigate('/');
    }
  };
  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: 'white',
        borderRight: '1px solid #EFEFEF',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 10
      }}>

      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid #EFEFEF'
        }}>

        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Merriweather, serif',
            fontWeight: 700,
            color: '#004987',
            letterSpacing: '0.5px'
          }}>

          FSDH PAYHUB
        </Typography>
      </Box>

      <List
        sx={{
          flex: 1,
          px: 2,
          py: 3
        }}>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + '/');
          return (
            <ListItem
              key={item.label}
              disablePadding
              sx={{
                mb: 0.5
              }}>

              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  bgcolor: isActive ? '#E6F0F8' : 'transparent',
                  color: isActive ? '#004987' : '#666666',
                  '&:hover': {
                    bgcolor: isActive ? '#E6F0F8' : '#F5F5F5'
                  },
                  py: 1.5
                }}>

                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: 'inherit'
                  }}>

                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400
                  }} />

              </ListItemButton>
            </ListItem>);

        })}
      </List>

      <Box
        sx={{
          p: 3,
          borderTop: '1px solid #EFEFEF',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>

          <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#004987',
            fontSize: '14px',
            fontWeight: 600
          }}>

            {displayInitials}
          </Avatar>
          <Box
          sx={{
            flex: 1
          }}>

            <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: '#222242',
              fontSize: '14px'
            }}>

              {displayName}
            </Typography>
            <Typography
            variant="caption"
            sx={{
              color: '#919191',
              fontSize: '12px'
            }}>

              {displayEmail}
            </Typography>
          </Box>
          <Box
          onClick={handleLogout}
          sx={{
            cursor: 'pointer',
            color: '#666666',
            '&:hover': {
              color: '#004987'
            }
          }}>

            <LogOutIcon size={20} />
          </Box>
        </Box>
    </Box>);

}
