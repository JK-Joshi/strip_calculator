import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  InputAdornment, 
  Typography, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// Conversion factors for length units
const LENGTH_CONVERSIONS = {
  ft: 0.3048, // feet to meters
  in: 0.0254, // inches to meters
  cm: 0.01,   // centimeters to meters
  m: 1,       // meters to meters
};

// Common LED strip power consumption values
const POWER_PRESETS = {
  '14.4': '14.4 W/m (Standard RGB)',
  '24': '24 W/m (High Density)',
  '36': '36 W/m (Ultra Bright)',
  '48': '48 W/m (Commercial Grade)',
  '60': '60 W/m (Professional)',
  'custom': 'Custom'
};

// Common driver wattages
const DRIVER_WATTAGES = {
  '30': '30W',
  '50': '50W',
  '75': '75W',
  '100': '100W',
  '150': '150W',
  '200': '200W',
  '300': '300W',
  '350': '350W',
  'custom': 'Custom'
};

const INITIAL_STATE = {
  length: '',
  lengthUnit: 'm',
  powerPerMeter: '14.4',
  powerPreset: '14.4',
  voltage: '24V',
  safetyMargin: '20',
  driverWattage: '100',
  driverWattagePreset: '100'
};

function DriverCalculator() {
  const [values, setValues] = useState(INITIAL_STATE);
  const [results, setResults] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate driver requirements when inputs change
  useEffect(() => {
    if (values.length && values.powerPerMeter && values.safetyMargin && values.driverWattage) {
      const length = parseFloat(values.length);
      const powerPerMeter = parseFloat(values.powerPerMeter);
      const margin = parseFloat(values.safetyMargin) / 100;
      const driverWattage = parseFloat(values.driverWattage);
      
      if (!isNaN(length) && !isNaN(powerPerMeter) && !isNaN(margin) && !isNaN(driverWattage)) {
        // Convert length to meters first
        const lengthInMeters = length * LENGTH_CONVERSIONS[values.lengthUnit];
        const totalPower = lengthInMeters * powerPerMeter;
        const recommendedPower = totalPower * (1 + margin);
        
        // Calculate number of drivers needed based on specified driver wattage
        const driverCount = Math.ceil(recommendedPower / driverWattage);
        const actualPowerPerDriver = driverWattage;
        
        setResults({
          totalPower: totalPower.toFixed(1),
          recommendedPower: recommendedPower.toFixed(1),
          driverCount,
          driverPower: actualPowerPerDriver.toFixed(0),
          voltage: values.voltage,
          lengthInMeters: lengthInMeters.toFixed(2),
          efficiency: ((recommendedPower / (driverCount * driverWattage)) * 100).toFixed(1)
        });
      } else {
        setResults(null);
      }
    } else {
      setResults(null);
    }
  }, [values]);

  // Handle input changes
  const handleChange = (field) => (e) => {
    const val = e.target.value;
    
    if (field === 'voltage' || field === 'lengthUnit' || field === 'powerPreset' || field === 'driverWattagePreset') {
      if (field === 'powerPreset') {
        const newPowerValue = val === 'custom' ? values.powerPerMeter : val;
        setValues(prev => ({ 
          ...prev, 
          [field]: val,
          powerPerMeter: newPowerValue
        }));
      } else if (field === 'driverWattagePreset') {
        const newDriverWattage = val === 'custom' ? values.driverWattage : val;
        setValues(prev => ({ 
          ...prev, 
          [field]: val,
          driverWattage: newDriverWattage
        }));
      } else {
        setValues(prev => ({ ...prev, [field]: val }));
      }
      return;
    }
    
    // Only allow numeric input for numeric fields
    if (/^\d*\.?\d*$/.test(val)) {
      setValues(prev => ({ ...prev, [field]: val }));
    }
  };

  // Reset all fields
  const handleReset = () => {
    setValues(INITIAL_STATE);
    setResults(null);
  };

  return (
    <Card 
      elevation={6} 
      sx={{ 
        borderRadius: { xs: 1, sm: 4 }, 
        p: { xs: 1, sm: 2.5 }, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        bgcolor: 'background.paper',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'scroll'
      }}
    >
      <CardContent sx={{ 
        p: 0, 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1, sm: 2 }, 
          width: '100%', 
          flex: 1 
        }}>
          
          {/* Length Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Unit Selection - Above field on mobile */}
            {isMobile && (
              <FormControl 
                variant="outlined" 
                size="small" 
                fullWidth
              >
                <InputLabel>Length Unit</InputLabel>
                <Select
                  value={values.lengthUnit}
                  onChange={handleChange('lengthUnit')}
                  label="Length Unit"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: { xs: 0.5, sm: 2 },
                    },
                  }}
                >
                  <MenuItem value="m">Meters (m)</MenuItem>
                  <MenuItem value="ft">Feet (ft)</MenuItem>
                  <MenuItem value="in">Inches (in)</MenuItem>
                  <MenuItem value="cm">Centimeters (cm)</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Length Input */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 2 }, 
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <TextField
                label="Total LED Strip Length"
                value={values.length}
                onChange={handleChange('length')}
                fullWidth
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                inputProps={{ 
                  inputMode: 'decimal', 
                  pattern: '[0-9]*', 
                  min: 0 
                }}
                helperText="Enter the total length of LED strip"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {values.lengthUnit}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 0.5, sm: 2 },
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
                  '& .MuiFormHelperText-root': {
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    margin: '4px 0 0 0',
                  },
                }}
              />
              {/* Unit Selection - Side by side on desktop */}
              {!isMobile && (
                <FormControl 
                  variant="outlined" 
                  size="medium" 
                  sx={{ 
                    minWidth: 120,
                  }}
                >
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={values.lengthUnit}
                    onChange={handleChange('lengthUnit')}
                    label="Unit"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: { xs: 0.5, sm: 2 },
                      },
                    }}
                  >
                    <MenuItem value="m">m</MenuItem>
                    <MenuItem value="ft">ft</MenuItem>
                    <MenuItem value="in">in</MenuItem>
                    <MenuItem value="cm">cm</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: { xs: 0.5, sm: 1.5 } }} />

          {/* Power Consumption Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Preset Selection - Above field on mobile */}
            {isMobile && (
              <FormControl 
                variant="outlined" 
                size="small" 
                fullWidth
              >
                <InputLabel>Power Preset</InputLabel>
                <Select
                  value={values.powerPreset}
                  onChange={handleChange('powerPreset')}
                  label="Power Preset"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: { xs: 0.5, sm: 2 },
                    },
                  }}
                >
                  {Object.entries(POWER_PRESETS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Power Input */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 2 }, 
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <TextField
                label="Power Consumption per Meter"
                value={values.powerPerMeter}
                onChange={handleChange('powerPerMeter')}
                fullWidth
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                inputProps={{ 
                  inputMode: 'decimal', 
                  pattern: '[0-9]*', 
                  min: 0 
                }}
                helperText="Enter power consumption in watts per meter"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        W/m
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 0.5, sm: 2 },
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
                  '& .MuiFormHelperText-root': {
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    margin: '4px 0 0 0',
                  },
                }}
              />
              {/* Preset Selection - Side by side on desktop */}
              {!isMobile && (
                <FormControl 
                  variant="outlined" 
                  size="medium" 
                  sx={{ 
                    minWidth: 160,
                  }}
                >
                  <InputLabel>Preset</InputLabel>
                  <Select
                    value={values.powerPreset}
                    onChange={handleChange('powerPreset')}
                    label="Preset"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: { xs: 0.5, sm: 2 },
                      },
                    }}
                  >
                    {Object.entries(POWER_PRESETS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: { xs: 0.5, sm: 1.5 } }} />

          {/* Driver Wattage Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Driver Wattage Preset Selection - Above field on mobile */}
            {isMobile && (
              <FormControl 
                variant="outlined" 
                size="small" 
                fullWidth
              >
                <InputLabel>Driver Wattage</InputLabel>
                <Select
                  value={values.driverWattagePreset}
                  onChange={handleChange('driverWattagePreset')}
                  label="Driver Wattage"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: { xs: 0.5, sm: 2 },
                    },
                  }}
                >
                  {Object.entries(DRIVER_WATTAGES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Driver Wattage Input */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 2 }, 
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <TextField
                label="Available Driver Wattage"
                value={values.driverWattage}
                onChange={handleChange('driverWattage')}
                fullWidth
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                inputProps={{ 
                  inputMode: 'decimal', 
                  pattern: '[0-9]*', 
                  min: 0 
                }}
                helperText="Enter the wattage of available drivers"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        W
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 0.5, sm: 2 },
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
                  '& .MuiFormHelperText-root': {
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    margin: '4px 0 0 0',
                  },
                }}
              />
              {/* Driver Wattage Preset Selection - Side by side on desktop */}
              {!isMobile && (
                <FormControl 
                  variant="outlined" 
                  size="medium" 
                  sx={{ 
                    minWidth: 140,
                  }}
                >
                  <InputLabel>Preset</InputLabel>
                  <Select
                    value={values.driverWattagePreset}
                    onChange={handleChange('driverWattagePreset')}
                    label="Preset"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: { xs: 0.5, sm: 2 },
                      },
                    }}
                  >
                    {Object.entries(DRIVER_WATTAGES).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: { xs: 0.5, sm: 1.5 } }} />

          {/* Voltage and Safety Margin Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 2 } }}>
            <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
              <InputLabel>Operating Voltage</InputLabel>
              <Select
                value={values.voltage}
                onChange={handleChange('voltage')}
                label="Operating Voltage"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 0.5, sm: 2 },
                  },
                }}
              >
                <MenuItem value="12V">12V</MenuItem>
                <MenuItem value="24V">24V</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Safety Margin"
              value={values.safetyMargin}
              onChange={handleChange('safetyMargin')}
              fullWidth
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              inputProps={{ 
                inputMode: 'decimal', 
                pattern: '[0-9]*', 
                min: 0 
              }}
              helperText="Enter safety margin percentage (default: 20%)"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      %
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 0.5, sm: 2 },
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
                '& .MuiFormHelperText-root': {
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  margin: '4px 0 0 0',
                },
              }}
            />
          </Box>

          {/* Results Section */}
          {results && (
            <Box sx={{ 
              mt: { xs: 0.5, sm: 1 }, 
              p: { xs: 1, sm: 2 }, 
              bgcolor: 'primary.light', 
              borderRadius: { xs: 0.5, sm: 2 },
              color: 'white'
            }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.9rem', sm: '1rem' } 
                }}
              >
                Driver Requirements
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.3, sm: 0.5 } }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Length: <strong>{values.length} {values.lengthUnit}</strong> ({results.lengthInMeters}m)
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Power: <strong>{values.powerPerMeter}W/m</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Power: <strong>{results.totalPower}W</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Recommended Power: <strong>{results.recommendedPower}W</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Driver Wattage: <strong>{values.driverWattage}W</strong>
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    mt: { xs: 0.3, sm: 0.5 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Suggestion: Use {results.driverCount} {results.driverCount > 1 ? 'drivers' : 'driver'} of {results.driverPower}W {results.voltage}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Efficiency: <strong>{results.efficiency}%</strong> (power utilization)
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Reset Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: { xs: 1, sm: 2 }, 
          pt: { xs: 1, sm: 2 } 
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            fullWidth
            sx={{ 
              borderRadius: { xs: 0.5, sm: 2 }, 
              px: { xs: 2, sm: 4 }, 
              py: { xs: 0.8, sm: 1.2 }, 
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

export default DriverCalculator; 