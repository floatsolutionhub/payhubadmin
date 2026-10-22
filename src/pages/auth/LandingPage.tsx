import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { ShieldCheckIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
export default function LandingPage() {
  const navigate = useNavigate();
  const portals = [
  {
    title: 'HR Admin',
    description: 'Manage employee onboarding and HR operations',
    icon: ShieldCheckIcon,
    path: '/auth/admin',
    color: '#004987'
  }];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F9FAFB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
      
      <motion.div
        initial={{
          opacity: 0,
          y: -20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.5
        }}>
        
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Merriweather, serif',
            fontWeight: 700,
            color: '#004987',
            textAlign: 'center',
            mb: 1
          }}>
          
          FSDH
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Merriweather, serif',
            fontWeight: 600,
            color: '#222242',
            textAlign: 'center',
            mb: 1
          }}>
          
          Employee Onboarding Portal
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#919191',
            textAlign: 'center',
            mb: 6,
            maxWidth: 500,
            mx: 'auto'
          }}>
          
          Select your portal to sign in
        </Typography>
      </motion.div>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
        
        {portals.map((portal, index) => {
          const Icon = portal.icon;
          return (
            <motion.div
              key={portal.title}
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.4,
                delay: index * 0.1
              }}>
              
              <Card
                sx={{
                  width: 300,
                  borderRadius: '12px',
                  border: '1px solid #EFEFEF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,73,135,0.15)',
                    borderColor: '#004987',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => navigate(portal.path)}>
                
                <CardContent
                  sx={{
                    p: 4,
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
                      mb: 2
                    }}>
                    
                    <Icon size={28} color={portal.color} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Merriweather, serif',
                      fontWeight: 600,
                      color: '#222242',
                      mb: 1
                    }}>
                    
                    {portal.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#919191',
                      mb: 3
                    }}>
                    
                    {portal.description}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: '#004987',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#003366'
                      }
                    }}>
                    
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            </motion.div>);

        })}
      </Box>
    </Box>);

}