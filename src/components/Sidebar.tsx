import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Tooltip,
  Avatar,
  useTheme,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Store as StoreIcon,
  Inventory2 as Inventory2Icon,
  Category as CategoryIcon,
  ReceiptLong as ReceiptLongIcon,
  Replay as ReplayIcon,
  NoteAlt as NoteAltIcon,
  PointOfSale as PointOfSaleIcon,
  BeachAccess,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logopng.png';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 70;

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { permisos, usuario } = useAuth();
  const [adminExpanded, setAdminExpanded] = useState(false);

  // Función para obtener el nombre a mostrar
  const obtenerNombreUsuario = () => {
    if (!usuario) return 'Usuario';
    
    // 1. Si tiene empleado, mostrar nombre del empleado
    if (usuario.empleado?.nombre) {
      return usuario.empleado.nombre;
    }
    
    // 2. Si tiene nombre directo, usarlo
    if (usuario.nombre) {
      return usuario.nombre;
    }
    
    // 3. Buscar correo en diferentes campos posibles
    const posiblesCorreos = [
      usuario.correo,
      usuario.email,
      (usuario as any).sub,
      (usuario as any).username,
      (usuario as any).user,
      (usuario as any).login
    ];
    
    for (const correo of posiblesCorreos) {
      if (correo && typeof correo === 'string' && correo.includes('@')) {
        return correo.split('@')[0];
      }
    }
    
    // 4. Buscar cualquier campo que contenga un email
    for (const [key, value] of Object.entries(usuario)) {
      if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
        return value.split('@')[0];
      }
    }
    
    // 5. Fallback
    return 'Usuario';
  };

  // Configuración de las secciones del menú
  const menuSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: DashboardIcon,
      permission: null, // Siempre visible
      color: theme.palette.mode === 'dark' ? '#AB47BC' : '#5B3758',
    },
    {
      id: 'ventas',
      label: 'Ventas',
      path: '/ventas',
      icon: ShoppingCartIcon,
      permission: 'ver_ventas',
      color: theme.palette.mode === 'dark' ? '#F9A825' : '#5B3758',
    },
    {
      id: 'inventario',
      label: 'Inventario',
      path: '/inventario',
      icon: Inventory2Icon,
      permission: 'ver_inventario',
      color: theme.palette.mode === 'dark' ? '#42A5F5' : '#5B3758',
    },
    {
      id: 'familias',
      label: 'Categorías',
      path: '/familias',
      icon: CategoryIcon,
      permission: 'ver_categoria',
      color: theme.palette.mode === 'dark' ? '#FFC107' : '#5B3758',
    },
    {
      id: 'proveedores',
      label: 'Proveedores',
      path: '/proveedores',
      icon: StoreIcon,
      permission: 'ver_proveedor',
      color: theme.palette.mode === 'dark' ? '#66BB6A' : '#5B3758',
    },
    {
      id: 'reportes',
      label: 'Reportes',
      path: '/reportes',
      icon: AssessmentIcon,
      permission: 'ver_reportes',
      color: theme.palette.mode === 'dark' ? '#AB47BC' : '#5B3758',
    },
    {
      id: 'notacredito',
      label: 'Notas de Crédito',
      path: '/notacredito',
      icon: ReceiptLongIcon,
      permission: 'ver_nota_credito',
      color: theme.palette.mode === 'dark' ? '#8BC34A' : '#5B3758',
    },
  ];

  // Secciones administrativas (expandibles)
  const adminSections = [
    {
      id: 'administracion',
      label: 'Sistema',
      path: '/administracion',
      icon: SettingsIcon,
      permission: 'ver_admin',
      color: theme.palette.mode === 'dark' ? '#EC407A' : '#5B3758',
    },
    {
      id: 'pagoproveedores',
      label: 'Pagos y Planillas',
      path: '/pagoproveedores',
      icon: NoteAltIcon,
      permission: 'ver_pagoproveedores',
      color: theme.palette.mode === 'dark' ? '#BA68C8' : '#5B3758',
    },
    {
      id: 'cajas',
      label: 'Cajas',
      path: '/cajas',
      icon: PointOfSaleIcon,
      permission: 'ver_cajas_admin',
      color: theme.palette.mode === 'dark' ? '#FF7043' : '#5B3758',
    },
    {
      id: 'vacaciones',
      label: 'Vacaciones',
      path: '/vacaciones',
      icon: BeachAccess,
      permission: 'ver_vacaciones',
      color: theme.palette.mode === 'dark' ? '#4CAF50' : '#5B3758',
    },
    {
      id: 'cargar-inventario',
      label: 'Cargar Inventario',
      path: '/cargar-inventario',
      icon: AssessmentIcon,
      permission: 'carga_masiva',
      color: theme.palette.mode === 'dark' ? '#66BB6A' : '#217346',
    },
  ];

  const hasPermission = (permission: string | null) => {
    if (!permission) return true;
    return permisos.includes(permission);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const renderMenuItem = (item: any, isNested = false) => {
    if (!hasPermission(item.permission)) return null;

    const Icon = item.icon;
    const isActive = isActivePath(item.path);

    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
        <Tooltip title={!open ? item.label : ''} placement="right">
          <ListItemButton
            onClick={() => handleNavigation(item.path)}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              pl: isNested ? 4 : 2.5,
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              backgroundColor: isActive 
                ? theme.palette.mode === 'dark' 
                  ? 'rgba(139, 69, 19, 0.2)' 
                  : 'rgba(91, 55, 88, 0.15)'
                : 'transparent',
              borderLeft: isActive 
                ? `4px solid ${theme.palette.mode === 'dark' ? item.color : '#5B3758'}` 
                : '4px solid transparent',
              border: isActive && theme.palette.mode === 'light' 
                ? '1px solid rgba(91, 55, 88, 0.3)'
                : 'none',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(139, 69, 19, 0.1)'
                  : 'rgba(91, 55, 88, 0.08)',
                transform: 'translateX(4px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: isActive 
                  ? theme.palette.mode === 'dark' ? item.color : '#5B3758'
                  : theme.palette.mode === 'dark' ? 'text.secondary' : 'rgba(91, 55, 88, 0.7)',
                transition: 'all 0.3s ease',
              }}
            >
              <Icon />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                opacity: open ? 1 : 0,
                color: isActive 
                  ? theme.palette.mode === 'dark' ? item.color : '#5B3758'
                  : theme.palette.mode === 'dark' ? 'text.primary' : 'rgba(91, 55, 88, 0.8)',
                '& .MuiListItemText-primary': {
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                },
                transition: 'all 0.3s ease',
              }}
            />
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  const hasAdminPermissions = adminSections.some(section => hasPermission(section.permission));

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a0f1a' : '#FFFFFF',
          borderRight: `1px solid ${theme.palette.mode === 'dark' ? '#4a3a4a' : 'rgba(91, 55, 88, 0.12)'}`,
          overflowX: 'hidden',
          transition: 'width 0.3s ease, background-color 0.3s ease',
          boxShadow: theme.palette.mode === 'dark' 
            ? '4px 0 20px rgba(0, 0, 0, 0.3)'
            : '4px 0 20px rgba(91, 55, 88, 0.08)',
        },
      }}
    >
      {/* Header del Sidebar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: 2,
          py: 1,
          minHeight: 64,
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2a1a2a 60%, #3a2a3a 100%)'
            : 'linear-gradient(135deg, #FFFFFF 60%, #F8F4E6 100%)',
          borderBottom: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(91, 55, 88, 0.15)',
        }}
      >
        {open && (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={logoImage}
              alt="El Punto"
              sx={{ 
                width: 36, 
                height: 36,
                backgroundColor: '#5B3758', // Fondo morado siempre
                border: theme.palette.mode === 'dark' 
                  ? '2px solid rgba(255, 255, 255, 0.3)'
                  : '2px solid rgba(91, 55, 88, 0.3)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                  : '0 2px 8px rgba(91, 55, 88, 0.15)',
                padding: '2px', // Espacio para que el logo no toque los bordes
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.mode === 'dark' ? 'white' : '#5B3758',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textShadow: theme.palette.mode === 'dark' 
                  ? '0 1px 2px rgba(0, 0, 0, 0.3)'
                  : 'none',
              }}
            >
              El Punto
            </Typography>
          </Box>
        )}
        {!open && (
          <Avatar
            src={logoImage}
            alt="El Punto"
            sx={{ 
              width: 32, 
              height: 32,
              backgroundColor: '#5B3758', // Fondo morado siempre
              border: theme.palette.mode === 'dark' 
                ? '2px solid rgba(255, 255, 255, 0.3)'
                : '2px solid rgba(91, 55, 88, 0.3)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                : '0 2px 8px rgba(91, 55, 88, 0.15)',
              padding: '2px', // Espacio para que el logo no toque los bordes
            }}
          />
        )}
        <IconButton
          onClick={onToggle}
          sx={{
            color: theme.palette.mode === 'dark' ? 'white' : '#5B3758',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(91, 55, 88, 0.1)',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(91, 55, 88, 0.2)',
            },
            ml: open ? 0 : 'auto',
          }}
        >
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ 
        borderColor: theme.palette.mode === 'dark' ? '#4a3a4a' : 'rgba(91, 55, 88, 0.12)' 
      }} />

      {/* Usuario info */}
      {open && usuario && (
        <Box sx={{ 
          p: 2, 
          textAlign: 'center',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(91, 55, 88, 0.05)'
            : 'rgba(91, 55, 88, 0.03)',
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'text.secondary' : 'rgba(91, 55, 88, 0.6)',
              fontSize: '0.8rem',
            }}
          >
            Bienvenido
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'text.primary' : '#5B3758',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            {obtenerNombreUsuario()}
          </Typography>
        </Box>
      )}

      <Divider sx={{ 
        borderColor: theme.palette.mode === 'dark' ? '#4a3a4a' : 'rgba(91, 55, 88, 0.12)' 
      }} />

      {/* Menú principal */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {menuSections.map(item => renderMenuItem(item))}
        
        {/* Sección de Administración */}
        {hasAdminPermissions && (
          <>
            <Divider sx={{ 
              my: 1, 
              borderColor: theme.palette.mode === 'dark' ? '#4a3a4a' : 'rgba(91, 55, 88, 0.12)' 
            }} />
            
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => setAdminExpanded(!adminExpanded)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  backgroundColor: adminExpanded 
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(91, 55, 88, 0.1)'
                      : 'rgba(91, 55, 88, 0.08)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(139, 69, 19, 0.1)'
                      : 'rgba(91, 55, 88, 0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: theme.palette.mode === 'dark' ? 'text.secondary' : 'rgba(91, 55, 88, 0.7)',
                  }}
                >
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Administración"
                  sx={{
                    opacity: open ? 1 : 0,
                    color: theme.palette.mode === 'dark' ? 'text.primary' : 'rgba(91, 55, 88, 0.8)',
                    '& .MuiListItemText-primary': {
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    },
                  }}
                />
                {open && (
                  <ListItemIcon sx={{ 
                    minWidth: 0,
                    color: theme.palette.mode === 'dark' ? 'text.secondary' : 'rgba(91, 55, 88, 0.7)',
                  }}>
                    {adminExpanded ? <ExpandLess /> : <ExpandMore />}
                  </ListItemIcon>
                )}
              </ListItemButton>
            </ListItem>

            <Collapse in={adminExpanded && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {adminSections.map(item => renderMenuItem(item, true))}
              </List>
            </Collapse>
          </>
        )}
      </List>
    </Drawer>
  );
}
