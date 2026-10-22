import { useEffect, useState } from 'react';
import { Alert, Box, Typography, Button, Divider, Snackbar } from '@mui/material';
import { ShieldCheckIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { setApiAccessToken } from '../../services/api';
import { setIdpAuthSession } from '../../store/authSlice';
import { oidcAuthService } from '../../services/auth/oidcAuthService';

const useMockAuth = String(import.meta.env.VITE_USE_MOCK_AUTH || 'false').toLowerCase() === 'true';
export default function AdminSignIn() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const storedError = window.sessionStorage.getItem('auth:signinError');

    if (storedError) {
      setToastMessage(storedError);
      setToastOpen(true);
      window.sessionStorage.removeItem('auth:signinError');
    }
  }, []);

  const handleMicrosoftLogin = async () => {
    setIsSubmitting(true);

    if (useMockAuth) {
      setApiAccessToken('mock-access-token');
      dispatch(
        setIdpAuthSession({
          userBiodata: {
            given_name: 'Mayowa',
            family_name: 'Ajadi',
            middle_name: '',
            department: 'Info Tech',
            subsidiary: 'FSDH Merchant Bank',
            role: ['DOMAIN1\\IT'],
            sub: 'DOMAIN1\\majadi'
          },
          tokenData: {
            accessToken: 'mock-access-token',
            idToken: 'mock-id-token',
            tokenType: 'Bearer',
            scope: 'openid profile roles work_info policy-viewer-api-scope',
            expiresIn: 3600
          }
        })
      );
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    try {
      await oidcAuthService.startLogin();
    } catch {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh'
        }}>
      
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          bgcolor: 'white'
        }}>
        
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5
          }}
          style={{
            width: '100%',
            maxWidth: '400px'
          }}>
          
          <Box
            sx={{
              mb: 6,
              textAlign: 'center'
            }}>
            
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Merriweather, serif',
                fontWeight: 700,
                color: '#004987'
              }}>
              
              FSDH
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: 'center'
            }}>
            
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#E6F0F8',
                mb: 3
              }}>
              
              <ShieldCheckIcon size={32} color="#004987" />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Merriweather, serif',
                fontWeight: 600,
                color: '#222242',
                mb: 1
              }}>
              
              HR Admin Portal
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#919191',
                mb: 4
              }}>
              
              Sign in with your staff email to access the HR Onboarding Portal
            </Typography>
            <Button
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              onClick={handleMicrosoftLogin}
              sx={{
                bgcolor: '#004987',
                color: 'white',
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 700,
                display: 'flex',
                gap: 1.5,
                '&:hover': {
                  bgcolor: '#003366'
                }
              }}>
              
              {/* <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg> */}
              {isSubmitting ? 'Redirecting...' : 'Click here to sign in'}
            </Button>
            <Divider
              sx={{
                my: 4
              }}>
              
            
            </Divider>
            <Typography
              variant="body2"
              sx={{
                color: '#919191',
                fontSize: '13px'
              }}>
              
              Only authorized HR administrators can access this portal. Contact
              IT support if you're having trouble signing in.
            </Typography>
          </Box>
        </motion.div>
      </Box>
      <Box
        sx={{
          flex: 1,
          bgcolor: '#004987',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          position: 'relative'
        }}>
        
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            duration: 0.6,
            delay: 0.2
          }}>
          
          <Box
            sx={{
              textAlign: 'center',
              color: 'white'
            }}>
            
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Merriweather, serif',
                fontWeight: 600,
                mb: 2
              }}>
              
              HR Admin Portal
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '18px',
                opacity: 0.9,
                maxWidth: '400px',
                mx: 'auto'
              }}>
              
              Manage employee onboarding, payroll, and performance all in one
              place
            </Typography>
          </Box>
        </motion.div>
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            gap: 1
          }}>
          
          {[0, 1, 2].map((dot) =>
          <Box
            key={dot}
            sx={{
              width: dot === 0 ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: 'white',
              opacity: dot === 0 ? 1 : 0.4
            }} />

          )}
        </Box>
      </Box>

      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={5000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>

        <Alert
          severity="error"
          onClose={() => setToastOpen(false)}
          sx={{ width: '100%' }}>

          {toastMessage}
        </Alert>
      </Snackbar>
    </>);

}