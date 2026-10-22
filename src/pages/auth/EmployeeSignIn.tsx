import React, { useState } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { oidcAuthService } from '../../services/auth/oidcAuthService';

export default function EmployeeSignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMicrosoftLogin = async () => {
    setIsSubmitting(true);

    try {
      await oidcAuthService.startLogin();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
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

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Merriweather, serif',
                fontWeight: 600,
                color: '#222242',
                mb: 1
              }}>
              
              Employee Sign In
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#919191',
                mb: 4
              }}>
              
              Sign in with your Microsoft account to continue to employee onboarding
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

              <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              {isSubmitting ? 'Redirecting...' : 'Sign in with Microsoft'}
            </Button>

            <Divider sx={{ my: 4 }}>
              <Typography variant="caption" sx={{ color: '#919191' }}>
                Secured by Microsoft Identity
              </Typography>
            </Divider>
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
              
              Welcome to FSDH
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '18px',
                opacity: 0.9,
                maxWidth: '400px',
                mx: 'auto'
              }}>
              
              Complete your onboarding process to get started with your new role
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
    </Box>);

}