import React from 'react';
import { Container, Typography, Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import UnifiedCalculator from './UnifiedCalculator';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          height: '100dvh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          overflow: 'hidden'
        }}
      >
        {/* Fixed Header */}
        <Box sx={{ 
          flexShrink: 0,
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'background.default',
        }}>
          <Container 
            maxWidth="sm" 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '100%',
              px: { xs: 1, sm: 2 },
            }}
          >
            {/* Title Section */}
            <Box sx={{ 
              width: '100%', 
              mb: { xs: 2, sm: 3, md: 4 }, 
              textAlign: 'center' 
            }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"}
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700, 
                  letterSpacing: 1,
                  mb: { xs: 1, sm: 2 },
                  color: 'text.primary',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                LED Strip Calculator
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* Scrollable Content Area */}
        <Box sx={{ 
          flex: 1,
          overflow: 'auto',
          px: { xs: 1, sm: 2 },
          pb: { xs: 2, sm: 3, md: 4 },
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0,0,0,0.3)',
          },
        }}>
          <Container 
            maxWidth="sm" 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '100%',
              px: { xs: 1, sm: 2 },
              minHeight: '100%',
            }}
          >
            <Box sx={{ 
              width: '100%', 
              minHeight: { xs: '500px', sm: '550px', md: '600px' },
              position: 'relative',
              overflow: 'hidden'
            }}>
              <UnifiedCalculator />
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default App;
