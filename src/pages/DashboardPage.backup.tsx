import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  Collapse,
} from '@mui/material';
import {
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
} from '@mui/icons-material';
import { useCaja } from '../context/CajaContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

import pinImage from '../assets/pin.png';

export default function DashboardPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  /** ───────────────────────────────────────────────
   *  CONTEXTOS
   *  CajaContext expone:
   *    - caja: datos de la caja abierta o null
   *    - abrirCaja(): abre la caja (pide montoInicial vía prompt/modal)
   *    - cerrarCaja(id): cierra la caja (pide montoReal vía prompt/modal)
   *  ─────────────────────────────────────────────── */
  const { caja, abrirCaja, cerrarCaja } = useCaja();
  const { permisos } = useAuth();

  /** ────── Tarjetas disponibles por permiso ────── */
  const secciones = [
    {
      permiso: 'ver_ventas',
      label: 'Ventas',
      ruta: '/ventas',
      colorLight: '#FFE0B2',
      colorDark: '#3a2e1a',
      icono: <ShoppingCartIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#F9A825' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_proveedor',
      label: 'Proveedores',
      ruta: '/proveedores',
      colorLight: '#C8E6C9',
      colorDark: '#1e3a2e',
      icono: <StoreIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#66BB6A' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_categoria',
      label: 'Categorías',
      ruta: '/familias',
      colorLight: '#FFECB3',
      colorDark: '#3a351a',
      icono: <CategoryIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#FFC107' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_inventario',
      label: 'Inventario',
      ruta: '/inventario',
      colorLight: '#BBDEFB',
      colorDark: '#1a2e3a',
      icono: <Inventory2Icon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#42A5F5' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_reportes',
      label: 'Reportes',
      ruta: '/reportes',
      colorLight: '#D1C4E9',
      colorDark: '#2e1a3a',
      icono: <AssessmentIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#AB47BC' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_admin',
      label: 'Administración Sistema',
      ruta: '/administracion',
      colorLight: '#F8BBD0',
      colorDark: '#3a1a2e',
      icono: <SettingsIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#EC407A' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_nota_credito',
      label: 'Notas de Crédito',
      ruta: '/notacredito',
      colorLight: '#DCEDC8',
      colorDark: '#2e3a1a',
      icono: <ReceiptLongIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#8BC34A' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_planillas',
      label: 'Planillas',
      ruta: '/Planilla',
      colorLight: '#B2EBF2',
      colorDark: '#1a3a3a',
      icono: <ReplayIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#26C6DA' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_pagoproveedores',
      label: 'Administracion  General',
      ruta: '/pagoproveedores',
      colorLight: '#E1BEE7',
      colorDark: '#2e1a3a',
      icono: <NoteAltIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#BA68C8' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_cajas_admin',
      label: 'Cajas',
      ruta: '/cajas',
      colorLight: '#FFE4E1',
      colorDark: '#3a1e1a',
      icono: <PointOfSaleIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#FF7043' : '#5B3758' }} />,
    },
    {
      permiso: 'ver_vacaciones',
      label: 'Vacaciones',
      ruta: '/vacaciones',
      colorLight: '#E8F5E8',
      colorDark: '#1e3a1e',
      icono: <BeachAccess sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#4CAF50' : '#5B3758' }} />,
    },
    // Nueva sección para cargar Excel
    {
      permiso: 'carga_masiva',
      label: 'Cargar Inventario',
      ruta: '/cargar-inventario',
      colorLight: '#C5E1A5',
      colorDark: '#1e2e1a',
      icono: <AssessmentIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? '#66BB6A' : '#217346' }} />,
    },
  ];

  const seccionDisponible = (perm: string) => permisos.includes(perm);

  /** ────────── UI estado interno ────────── */
  const [expandido, setExpandido] = useState(false);

  /** ────────── Cargando caja ────────── */
  if (caja === undefined) return <p>Cargando datos de la caja...</p>;

  /** ────────── Fecha de apertura formateada ────────── */
  const fechaApertura = caja?.fechaApertura
    ? new Date(Number(caja.fechaApertura))
    : null;

  return (
    <Box sx={{ 
      p: '2rem', 
      backgroundColor: theme.palette.mode === 'dark' ? '#1a0f1a' : 'background.default',  // Negro con tinte morado
      minHeight: '100vh',
      transition: 'background-color 0.3s ease'
    }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ 
          fontWeight: 'bold', 
          color: 'text.primary',
          transition: 'color 0.3s ease'
        }}
      >
        Bienvenido al Sistema El Punto
      </Typography>

      {/* ────────── Panel de Caja ────────── */}
      <Card
        sx={{
          mb: 5,
          p: 4,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2a1a2a 60%, #3a2a3a 100%)'  // Degradado con tinte morado
            : 'linear-gradient(135deg, #FFF3E0 60%, #FFE0B2 100%)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'visible',
          transition: 'background 0.3s ease',
        }}
      >
        {/* Pin decorativo */}
        <Box sx={{ position: 'absolute', top: -28, left: 24, zIndex: 2 }}>
          <img
            src={pinImage}
            alt="pin"
            style={{
              width: 48,
              height: 48,
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
            }}
          />
        </Box>

        {/* Encabezado panel */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                background:
                  'linear-gradient(135deg, #FFB300 60%, #FFECB3 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <img
                src="https://img.icons8.com/ios-filled/50/5B3758/cash-register.png"
                alt="Caja"
                style={{ width: 32, height: 32, opacity: 0.85 }}
              />
            </Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              color={theme.palette.mode === 'dark' ? 'white' : 'primary.dark'}
              letterSpacing={1}
              sx={{ transition: 'color 0.3s ease' }}
            >
              Caja Actual
            </Typography>
          </Box>

          {/* Botón abrir/cerrar/expandir */}
          {caja ? (
            <Button
              variant={expandido ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setExpandido((e) => !e)}
              sx={{
                fontWeight: 'bold',
                borderRadius: 2,
                boxShadow: expandido ? 2 : 0,
                textTransform: 'none',
                px: 3,
              }}
            >
              {expandido ? 'Ocultar detalles' : 'Ver detalles'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={abrirCaja}
              sx={{
                fontWeight: 'bold',
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Abrir Caja
            </Button>
          )}
        </Box>

        {/* Detalle caja */}
        <Collapse in={expandido && !!caja}>
          <Divider sx={{ my: 2 }} />
          {caja && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ mb: 1 }}>
                  <strong>Estado:</strong>{' '}
                  <Box
                    component="span"
                    sx={{
                      color: caja.estado === 'abierta' ? 'success.main' : 'error.main',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: caja.estado === 'abierta' 
                        ? 'success.lighter' 
                        : 'error.lighter',
                    }}
                  >
                    {caja.estado}
                  </Box>
                </Typography>
                
                <Typography sx={{ mb: 1 }}>
                  <strong>Fecha Apertura:</strong>{' '}
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    {fechaApertura && !isNaN(fechaApertura.getTime())
                      ? fechaApertura.toLocaleDateString('es-CR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) + ' - ' + fechaApertura.toLocaleTimeString('es-CR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </Box>
                </Typography>
                
                <Typography sx={{ mb: 1 }}>
                  <strong>Número de Caja:</strong>{' '}
                  <Box
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      backgroundColor: 'primary.lighter',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    #{caja.numeroDia}
                  </Box>
                </Typography>

                {/* Información adicional */}
                {caja.empleado && (
                  <Typography sx={{ mb: 1 }}>
                    <strong>Cajero:</strong>{' '}
                    <Box component="span" sx={{ color: 'text.secondary' }}>
                      {caja.empleado.nombre || 'Sin asignar'}
                    </Box>
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ mb: 1 }}>
                  <strong>Monto Inicial:</strong>{' '}
                  <Box
                    component="span"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    ₡{caja.montoInicial || '0'}
                  </Box>
                </Typography>

                {/* Mostrar Monto Sistema */}
                {caja.montoSistema && !isNaN(parseFloat(caja.montoSistema)) && (
                  <Typography sx={{ mb: 1 }}>
                    <strong>Monto Sistema:</strong>{' '}
                    <Box component="span" sx={{ color: 'info.main', fontWeight: 600 }}>
                      ₡{Number(caja.montoSistema) === 0 ? '0' : Number(caja.montoSistema).toLocaleString('es-CR')}
                    </Box>
                  </Typography>
                )}

                {/* Mostrar Total Ventas */}
                {caja.totalVentas && !isNaN(parseFloat(caja.totalVentas)) && (
                  <Typography sx={{ mb: 1 }}>
                    <strong>Total Ventas:</strong>{' '}
                    <Box
                      component="span"
                      sx={{ color: 'success.dark', fontWeight: 600 }}
                    >
                      ₡{Number(caja.totalVentas) === 0 ? '0' : Number(caja.totalVentas).toLocaleString('es-CR')}
                    </Box>
                  </Typography>
                )}

                {/* Diferencia (Monto Sistema - Monto Inicial) */}
                {caja.montoSistema && !isNaN(parseFloat(caja.montoSistema)) && (
                  <Typography sx={{ mb: 2 }}>
                    <strong>Diferencia:</strong>{' '}
                    <Box
                      component="span"
                      sx={{ 
                        color: (parseFloat(caja.montoSistema) - parseFloat(caja.montoInicial)) >= 0 
                          ? 'success.main' 
                          : 'error.main', 
                        fontWeight: 600 
                      }}
                    >
                      ₡{(() => {
                        const diferencia = Number(caja.montoSistema) - Number(caja.montoInicial);
                        return diferencia === 0 ? '0' : diferencia.toLocaleString('es-CR');
                      })()}
                    </Box>
                  </Typography>
                )}

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => cerrarCaja(caja.id)}
                  sx={{
                    fontWeight: 'bold',
                    borderRadius: 2,
                    mt: 2,
                    px: 4,
                    boxShadow: 1,
                    textTransform: 'none',
                  }}
                >
                  Cerrar Caja
                </Button>
              </Grid>
            </Grid>
          )}
        </Collapse>
      </Card>

      {/* ────────── Tarjetas del dashboard ────────── */}
      <Grid container spacing={3}>
        {secciones.map(
          (sec) =>
            seccionDisponible(sec.permiso) && (
              <Grid item xs={12} sm={6} md={4} key={sec.label}>
                <Card
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? '#2a1a2a' : '#ffffff',  // Gris con tinte morado
                    cursor: 'pointer',
                    p: '0.5rem',
                    boxShadow: theme.palette.mode === 'dark' ? 6 : 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: theme.palette.mode === 'dark' ? 12 : 6,
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 220,
                    borderRadius: 5,
                    border: '2px solid',
                    borderColor: theme.palette.mode === 'dark' ? '#4a3a4a' : '#e0e0e0',  // Borde con tinte morado
                    position: 'relative',
                  }}
                  onClick={() => navigate(sec.ruta)}
                >
                  {/* Contenedor interno con color de marca */}
                  <Box
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? sec.colorDark : sec.colorLight,
                      borderRadius: 3,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      p: '1.5rem',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <Box
                      sx={{
                        background: theme.palette.mode === 'dark' 
                          ? 'linear-gradient(135deg, #3a3a3a 60%, #4a4a4a 100%)'
                          : 'linear-gradient(135deg, #fffde4 60%, #fff 100%)',
                        borderRadius: '50%',
                        width: 70,
                        height: 70,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 2,
                        mb: 2,
                        transition: 'background 0.3s ease',
                      }}
                    >
                      {sec.icono}
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        mt: 0.5,
                        fontWeight: 'bold',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#5B3758',
                        letterSpacing: 1,
                        textShadow: theme.palette.mode === 'dark' 
                          ? '0 1px 4px rgba(0,0,0,0.5)'
                          : '0 1px 4px rgba(255,255,255,0.5)',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {sec.label}
                    </Typography>

                    {/* Descripción breve */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#cccccc' : '#6d4c41',
                        mt: 1,
                        textAlign: 'center',
                        fontStyle: 'italic',
                        textShadow: theme.palette.mode === 'dark' 
                          ? '0 1px 2px rgba(0,0,0,0.3)'
                          : '0 1px 2px rgba(255,255,255,0.3)',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {{
                        Ventas:
                          'Realiza y gestiona tus ventas diarias fácilmente.',
                        Proveedores:
                          'Administra tus proveedores y sus productos.',
                        Categorías: 'Organiza tus productos por categorías.',
                        Inventario:
                          'Controla el stock y movimientos de inventario.',
                        Reportes:
                          'Visualiza reportes y estadísticas de tu negocio.',
                        'Administración Sistema':
                          'Configura usuarios, permisos y ajustes.',
                        'Notas de Crédito':
                          'Gestiona devoluciones y notas de crédito.',
                        Planillas: 'Administra la planilla y pagos de empleados.',
                        'Administracion  General':
                          'Registra y controla pagos a proveedores, planilla y manejo de empleados.',
                        Cajas: 'Administra la información de las cajas.',
                        Vacaciones: 'Administra la información de las vacaciones.',
                        'Cargar Inventario':
                          'Carga masiva de inventario desde un archivo Excel.',
                      }[sec.label] ?? ''}
                    </Typography>

                    {/* Icono decorativo pálido */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 18,
                        opacity: theme.palette.mode === 'dark' ? 0.08 : 0.12,
                        fontSize: 60,
                        color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      {sec.icono}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            )
        )}
      </Grid>

      {/* Mensaje cuando no hay tarjetas disponibles */}
      {secciones.filter(sec => seccionDisponible(sec.permiso)).length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No tienes permisos para acceder a ninguna sección del sistema.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Contacta a tu administrador para obtener los permisos necesarios.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
