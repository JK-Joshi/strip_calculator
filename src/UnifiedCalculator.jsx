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
  Divider,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Fab,
  Button as MUIButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';

// Conversion factors for length units
const LENGTH_CONVERSIONS = {
  ft: 0.3048, // feet to meters
  in: 0.0254, // inches to meters
  cm: 0.01,   // centimeters to meters
  m: 1,       // meters to meters
};

// Conversion factors for unit converter
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

const INITIAL_CONVERTER_STATE = { ft: '', in: '', cm: '', m: '' };
const INITIAL_DRIVER_STATE = {
  powerPerMeter: '14.4',
  powerPreset: '14.4',
  voltage: '24V',
  safetyMargin: '20',
  driverWattage: '100',
  driverWattagePreset: '100'
};

const INITIAL_CUSTOMER_STATE = {
  customerName: '',
  area: ''
};

function UnifiedCalculator() {
  const [converterValues, setConverterValues] = useState(INITIAL_CONVERTER_STATE);
  const [driverValues, setDriverValues] = useState(INITIAL_DRIVER_STATE);
  const [customerValues, setCustomerValues] = useState(INITIAL_CUSTOMER_STATE);
  const [lastEdited, setLastEdited] = useState(null);
  const [results, setResults] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('Saved!');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalEntry, setOriginalEntry] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filter history based on search term
  const filteredHistory = history.filter(entry => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = entry.customerName?.toLowerCase().includes(searchLower);
    const areaMatch = entry.area?.toLowerCase().includes(searchLower);
    return nameMatch || areaMatch;
  });

  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ledCalculatorHistory');
      console.log('Loading history from localStorage:', savedHistory);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        console.log('Parsed history:', parsedHistory);
        setHistory(parsedHistory);
      } else {
        console.log('No saved history found in localStorage');
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      try {
        console.log('Saving history to localStorage:', history);
        localStorage.setItem('ledCalculatorHistory', JSON.stringify(history));
        console.log('History saved successfully to localStorage');
      } catch (error) {
        console.error('Error saving history to localStorage:', error);
      }
    } else {
      console.log('History is empty, not saving to localStorage');
    }
  }, [history]);

  // Explicitly save history to localStorage
  const saveHistoryToLocalStorage = (historyData) => {
    try {
      console.log('Explicitly saving history to localStorage:', historyData);
      localStorage.setItem('ledCalculatorHistory', JSON.stringify(historyData));
      console.log('History explicitly saved to localStorage');
    } catch (error) {
      console.error('Error explicitly saving history to localStorage:', error);
    }
  };

  // Handle customer info changes
  const handleCustomerChange = (field) => (e) => {
    setCustomerValues(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Handle converter input change for any unit
  const handleConverterChange = (unit) => (e) => {
    const val = e.target.value;
    // Only allow numeric, non-negative, and empty string
    if (/^\d*\.?\d*$/.test(val)) {
      if (val === '') {
        setConverterValues(INITIAL_CONVERTER_STATE);
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
      setConverterValues(newValues);
      setLastEdited(unit);
    }
  };

  // Format value for display (max 6 digits, no trailing zeros)
  function formatValue(val) {
    return val === '' ? '' : parseFloat(val.toFixed(6)).toString();
  }

  // Handle driver calculator input changes
  const handleDriverChange = (field) => (e) => {
    const val = e.target.value;
    
    if (field === 'voltage' || field === 'powerPreset' || field === 'driverWattagePreset') {
      if (field === 'powerPreset') {
        const newPowerValue = val === 'custom' ? driverValues.powerPerMeter : val;
        setDriverValues(prev => ({ 
          ...prev, 
          [field]: val,
          powerPerMeter: newPowerValue
        }));
      } else if (field === 'driverWattagePreset') {
        const newDriverWattage = val === 'custom' ? driverValues.driverWattage : val;
        setDriverValues(prev => ({ 
          ...prev, 
          [field]: val,
          driverWattage: newDriverWattage
        }));
      } else {
        setDriverValues(prev => ({ ...prev, [field]: val }));
      }
      return;
    }
    
    // Only allow numeric input for numeric fields
    if (/^\d*\.?\d*$/.test(val)) {
      setDriverValues(prev => ({ ...prev, [field]: val }));
    }
  };

  // Calculate driver requirements when inputs change
  useEffect(() => {
    if (converterValues.m && driverValues.powerPerMeter && driverValues.safetyMargin && driverValues.driverWattage) {
      const length = parseFloat(converterValues.m);
      const powerPerMeter = parseFloat(driverValues.powerPerMeter);
      const margin = parseFloat(driverValues.safetyMargin) / 100;
      const driverWattage = parseFloat(driverValues.driverWattage);
      
      if (!isNaN(length) && !isNaN(powerPerMeter) && !isNaN(margin) && !isNaN(driverWattage)) {
        const totalPower = length * powerPerMeter;
        const recommendedPower = totalPower * (1 + margin);
        
        // Calculate number of drivers needed based on specified driver wattage
        const driverCount = Math.ceil(recommendedPower / driverWattage);
        const actualPowerPerDriver = driverWattage;
        
        setResults({
          totalPower: totalPower.toFixed(1),
          recommendedPower: recommendedPower.toFixed(1),
          driverCount,
          driverPower: actualPowerPerDriver.toFixed(0),
          voltage: driverValues.voltage,
          lengthInMeters: length.toFixed(2),
          efficiency: ((recommendedPower / (driverCount * driverWattage)) * 100).toFixed(1)
        });
      } else {
        setResults(null);
      }
    } else {
      setResults(null);
    }
  }, [converterValues, driverValues]);

  // Save current calculation to history
  const handleSaveToHistory = () => {
    if (!results) return;
    
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      customerName: customerValues.customerName,
      area: customerValues.area,
      converterValues,
      driverValues,
      results
    };
    
    console.log('Saving new entry to history:', newEntry);
    setHistory(prev => {
      const newHistory = [newEntry, ...prev.slice(0, 19)]; // Keep only last 20 entries
      console.log('New history state:', newHistory);
      // Explicitly save to localStorage immediately
      saveHistoryToLocalStorage(newHistory);
      return newHistory;
    });
    
    setSnackbarOpen(true);
    setSnackbarMessage('Saved!');
    
    // Delay the reset to ensure localStorage is saved first
    setTimeout(() => {
      handleReset();
    }, 100);
  };

  // Load calculation from history
  const handleLoadFromHistory = (entry) => {
    setCustomerValues({
      customerName: entry.customerName || '',
      area: entry.area || ''
    });
    setConverterValues(entry.converterValues);
    setDriverValues(entry.driverValues);
    setResults(entry.results);
    setHistoryOpen(false);
  };

  // Delete entry from history
  const handleDeleteFromHistory = (id) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
    setConfirmDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setConfirmDeleteDialogOpen(true);
  };

  // Start editing an entry
  const handleStartEdit = (entry) => {
    setOriginalEntry(entry);
    setCustomerValues({
      customerName: entry.customerName || '',
      area: entry.area || ''
    });
    setConverterValues(entry.converterValues);
    setDriverValues(entry.driverValues);
    setResults(entry.results);
    setIsEditing(true);
    setHistoryOpen(false);
  };

  // Save changes to the edited entry
  const handleSaveChanges = () => {
    if (!results || !originalEntry) return;
    
    const updatedEntry = {
      ...originalEntry,
      customerName: customerValues.customerName,
      area: customerValues.area,
      converterValues,
      driverValues,
      results,
      lastModified: new Date().toISOString()
    };
    
    setHistory(prev => prev.map(entry => 
      entry.id === originalEntry.id ? updatedEntry : entry
    ));
    
    setIsEditing(false);
    setOriginalEntry(null);
    setSnackbarOpen(true);
    setSnackbarMessage('Updated!');
    handleReset();
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setOriginalEntry(null);
    handleReset();
  };

  // Clear all history
  const handleClearHistory = () => {
    console.log('Clearing all history');
    setHistory([]);
    try {
      localStorage.removeItem('ledCalculatorHistory');
      console.log('History cleared from localStorage');
    } catch (error) {
      console.error('Error clearing history from localStorage:', error);
    }
    setConfirmClearDialogOpen(false);
  };

  // Reset all fields
  const handleReset = () => {
    setConverterValues(INITIAL_CONVERTER_STATE);
    setDriverValues(INITIAL_DRIVER_STATE);
    setCustomerValues(INITIAL_CUSTOMER_STATE);
    setLastEdited(null);
    setResults(null);
  };

  // Helper to build WhatsApp message (accepts custom entry)
  const buildWhatsAppMessage = (entry = null) => {
    const cVals = entry ? entry.converterValues : converterValues;
    const dVals = entry ? entry.driverValues : driverValues;
    const rVals = entry ? entry.results : results;
    const custVals = entry ? { customerName: entry.customerName, area: entry.area } : customerValues;
    if (!rVals) return '';
    const lines = [];
    if (custVals.customerName) lines.push(`*Customer:* ${custVals.customerName}`);
    if (custVals.area) lines.push(`*Area:* ${custVals.area}`);
    lines.push('');
    lines.push(`*Strip Length:*`);
    Object.entries(cVals).forEach(([unit, value]) => {
      if (value) lines.push(`- ${UNIT_LABELS[unit]}: ${value} ${unit}`);
    });
    lines.push('');
    lines.push(`*Power Consumption:* ${dVals.powerPerMeter} W/m`);
    lines.push(`*Driver Wattage:* ${dVals.driverWattage} W`);
    lines.push(`*Voltage:* ${dVals.voltage}`);
    lines.push(`*Safety Margin:* ${dVals.safetyMargin}%`);
    lines.push('');
    lines.push(`*Calculation Results:*`);
    lines.push(`- Total Power: ${rVals.totalPower} W`);
    lines.push(`- Recommended Power: ${rVals.recommendedPower} W`);
    lines.push(`- Driver Count: ${rVals.driverCount} x ${rVals.driverPower}W (${rVals.voltage})`);
    lines.push(`- Efficiency: ${rVals.efficiency}%`);
    return lines.join('\n');
  };

  // Share from history
  const handleShareHistoryEntry = (entry) => {
    const message = buildWhatsAppMessage(entry);
    if (message) {
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  // Save and Send via WhatsApp
  const handleSaveAndSend = () => {
    handleSaveToHistory();
    const message = buildWhatsAppMessage();
    if (message) {
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <>
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
          overflowY: 'scroll',
          position: 'relative'
        }}
      >
        {/* History Button - Top Right Corner */}
        <Box sx={{ 
          position: 'absolute', 
          top: { xs: 8, sm: 16 }, 
          right: { xs: 8, sm: 16 }, 
          zIndex: 10 
        }}>
          <Typography
            onClick={() => setHistoryOpen(true)}
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: 1,
              cursor: 'pointer',
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              userSelect: 'none',
            }}
          >
            History
          </Typography>
        </Box>

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
            
            {/* Customer Information Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 5 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.9rem', sm: '1.1rem' },
                  color: 'primary.main',
                  mb: 1
                }}
              >
                Customer Information{isEditing && (
                  <Typography 
                    component="span" 
                    variant="body2" 
                    sx={{ 
                      color: 'warning.main', 
                      fontWeight: 500,
                      ml: 1 
                    }}
                  >
                    (Editing)
                  </Typography>
                )}
              </Typography>
              
              <TextField
                label="Customer Name"
                value={customerValues.customerName}
                onChange={handleCustomerChange('customerName')}
                fullWidth
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                helperText="Enter customer name"
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

              <TextField
                label="Area"
                value={customerValues.area}
                onChange={handleCustomerChange('area')}
                fullWidth
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                helperText="Enter area (e.g., Living Room, Bedroom, Kitchen)"
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
            </Box>

            {/* Divider */}
            <Divider sx={{ my: { xs: 0.5, sm: 1.5 } }} />

            {/* Strip Length Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.9rem', sm: '1.1rem' },
                  color: 'primary.main',
                  mb: 1
                }}
              >
                Strip Length
              </Typography>
              
              {Object.keys(UNIT_LABELS).map((unit) => (
                <TextField
                  key={unit}
                  label={UNIT_LABELS[unit]}
                  value={converterValues[unit]}
                  onChange={handleConverterChange(unit)}
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

            {/* Divider */}
            <Divider sx={{ my: { xs: 0.5, sm: 1.5 } }} />

            {/* Driver Calculator Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.9rem', sm: '1.1rem' },
                  color: 'primary.main',
                  mb: 1
                }}
              >
                Driver Calculator
              </Typography>

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
                      value={driverValues.powerPreset}
                      onChange={handleDriverChange('powerPreset')}
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
                    value={driverValues.powerPerMeter}
                    onChange={handleDriverChange('powerPerMeter')}
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
                        value={driverValues.powerPreset}
                        onChange={handleDriverChange('powerPreset')}
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
                      value={driverValues.driverWattagePreset}
                      onChange={handleDriverChange('driverWattagePreset')}
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
                    value={driverValues.driverWattage}
                    onChange={handleDriverChange('driverWattage')}
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
                        value={driverValues.driverWattagePreset}
                        onChange={handleDriverChange('driverWattagePreset')}
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

              {/* Voltage and Safety Margin Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 2 } }}>
                <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                  <InputLabel>Operating Voltage</InputLabel>
                  <Select
                    value={driverValues.voltage}
                    onChange={handleDriverChange('voltage')}
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
                  value={driverValues.safetyMargin}
                  onChange={handleDriverChange('safetyMargin')}
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
                    {customerValues.customerName && (
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Customer: <strong>{customerValues.customerName}</strong>
                      </Typography>
                    )}
                    {customerValues.area && (
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Area: <strong>{customerValues.area}</strong>
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Length: <strong>{converterValues.m} m</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Power: <strong>{driverValues.powerPerMeter}W/m</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Power: <strong>{results.totalPower}W</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Recommended Power: <strong>{results.recommendedPower}W</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Driver Wattage: <strong>{driverValues.driverWattage}W</strong>
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
          </Box>
          
          {/* Reset & Save Buttons */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 2,
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
            {isEditing ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                width: '100%',
                mt: 1
              }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveChanges}
                  disabled={!results}
                  sx={{
                    flex: 1,
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
                  Update
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  sx={{
                    flex: 1,
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
                  Cancel Edit
                </Button>
              </Box>
            ) : (
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              width: '100%',
              mt: 1
            }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveToHistory}
                disabled={!results}
                sx={{
                  flex: 1,
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
                Save
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ShareIcon />}
                onClick={handleSaveAndSend}
                disabled={!results}
                sx={{
                  flex: 1,
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
                Share
              </Button>
            </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* History Drawer */}
      <Drawer
        anchor="right"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400, md: 500 },
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Calculation History
            </Typography>
            <IconButton onClick={() => setHistoryOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Search Field */}
          <TextField
            label="Search History"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* History List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {filteredHistory.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary'
              }}>
                <HistoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                  No saved calculations match your search.
                  <br />
                  Try a different search term.
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredHistory.map((entry) => (
                  <ListItem
                    key={entry.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleLoadFromHistory(entry)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {entry.customerName || 'Unnamed Project'}
                          </Typography>
                          {entry.area && (
                            <Typography variant="body2" color="text.secondary">
                              {entry.area}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {entry.converterValues.m} m • {entry.driverValues.powerPerMeter}W/m • {entry.results.driverCount} drivers
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(entry.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(entry);
                        }}
                        sx={{ color: 'error.main' }}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(entry);
                        }}
                        sx={{ color: 'primary.main', mr: 1 }}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareHistoryEntry(entry);
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Clear All Button - Sticky Bottom */}
          {history.length > 0 && (
            <Box sx={{ 
              position: 'sticky', 
              bottom: 0, 
              bgcolor: 'background.paper',
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setConfirmClearDialogOpen(true)}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Clear All History
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ 
            width: '100%',
            bgcolor: 'success.dark',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Confirm Clear History Dialog */}
      <Dialog
        open={confirmClearDialogOpen}
        onClose={() => setConfirmClearDialogOpen(false)}
        aria-labelledby="confirm-clear-dialog-title"
        aria-describedby="confirm-clear-dialog-description"
      >
        <DialogTitle id="confirm-clear-dialog-title">Confirm Clear History</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-clear-dialog-description">
            Are you sure you want to clear all your calculation history? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClearHistory} color="error" variant="contained">
            Clear History
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete History Entry Dialog */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
      >
        <DialogTitle id="confirm-delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-dialog-description">
            Are you sure you want to delete this calculation from your history? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => {
            if (entryToDelete) {
              handleDeleteFromHistory(entryToDelete.id);
            }
          }} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UnifiedCalculator; 