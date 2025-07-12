import React, { useState } from 'react';
import { TextField, Button, Card, CardContent, InputAdornment, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// Conversion factors
const CONVERSIONS = {
  ft: {
    toBase: (v) => v * 0.3048, // to meters
    fromBase: (m) => m / 0.3048,
  },
  in: {
    toBase: (v) => v * 0.0254, // to meters
    fromBase: (m) => m / 0.0254,
  },
  cm: {
    toBase: (v) => v * 0.01, // to meters
    fromBase: (m) => m / 0.01,
  },
  m: {
    toBase: (v) => v, // already meters
    fromBase: (m) => m,
  },
};

const UNIT_LABELS = {
  ft: 'Feet (ft)',
  in: 'Inches (in)',
  cm: 'Centimeters (cm)',
  m: 'Meters (m)',
};

const HELPER_TEXT = {
  ft: 'Enter value in feet',
  in: 'Enter value in inches',
  cm: 'Enter value in centimeters',
  m: 'Enter value in meters',
};

const INITIAL_STATE = { ft: '', in: '', cm: '', m: '' };

function Converter() {
  const [values, setValues] = useState(INITIAL_STATE);
  const [lastEdited, setLastEdited] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle input change for any unit
  const handleChange = (unit) => (e) => {
    const val = e.target.value;
    // Only allow numeric, non-negative, and empty string
    if (/^\d*\.?\d*$/.test(val)) {
      if (val === '') {
        setValues(INITIAL_STATE);
        setLastEdited(null);
        return;
      }
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) return;
      // Convert to meters (base), then update all fields
      const meters = CONVERSIONS[unit].toBase(num);
      const newValues = {
        ft: formatValue(CONVERSIONS.ft.fromBase(meters)),
        in: formatValue(CONVERSIONS.in.fromBase(meters)),
        cm: formatValue(CONVERSIONS.cm.fromBase(meters)),
        m: formatValue(CONVERSIONS.m.fromBase(meters)),
      };
      setValues(newValues);
      setLastEdited(unit);
    }
  };

  // Format value for display (max 6 digits, no trailing zeros)
  function formatValue(val) {
    return val === '' ? '' : parseFloat(val.toFixed(6)).toString();
  }

  // Reset all fields
  const handleReset = () => {
    setValues(INITIAL_STATE);
    setLastEdited(null);
  };

  return (
    <Card 
      elevation={6} 
      sx={{ 
        borderRadius: { xs: 2, sm: 4 }, 
        p: { xs: 2, sm: 2.5 }, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        bgcolor: 'background.paper',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'hidden'
      }}
    >
      <CardContent sx={{ 
        p: 0, 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between' 
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1.5, sm: 2 }, 
          width: '100%', 
          flex: 1 
        }}>
          {Object.keys(UNIT_LABELS).map((unit) => (
            <TextField
              key={unit}
              label={UNIT_LABELS[unit]}
              value={values[unit]}
              onChange={handleChange(unit)}
              fullWidth
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              inputProps={{ 
                inputMode: 'decimal', 
                pattern: '[0-9]*', 
                min: 0 
              }}
              helperText={HELPER_TEXT[unit]}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {unit}
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1, sm: 2 },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
                '& .MuiFormHelperText-root': {
                  color: 'text.secondary',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  margin: '4px 0 0 0',
                },
              }}
            />
          ))}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: { xs: 1.5, sm: 2 }, 
          pt: { xs: 1.5, sm: 2 } 
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            fullWidth
            sx={{ 
              borderRadius: { xs: 1, sm: 2 }, 
              px: { xs: 3, sm: 4 }, 
              py: { xs: 1, sm: 1.2 }, 
              fontWeight: 600, 
              fontSize: { xs: '0.875rem', sm: '1rem' }, 
              boxShadow: 2,
              textTransform: 'none',
              minWidth: 120
            }}
          >
            Reset
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Converter; 