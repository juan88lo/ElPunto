import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMutation, useQuery } from '@apollo/client';
import { CARGAR_INVENTARIO_MASIVO } from '../graphql/mutations/inventario';
import { GET_FAMILIAS } from '../graphql/queries/familia';
import { GET_PROVEEDORES } from '../graphql/queries/proveedor';

interface ProductoCarga {
  nombre: string;
  codigoBarras: string;
  precioCostoSinImpuesto: number;
  impuestoPorProducto: number;
  precioFinalVenta: number;
  cantidadExistencias: number;
  familiaId: string;
  proveedorId: string;
}

interface Familia {
  id: number;
  nombre: string;
  Observaciones?: string;
  Estado?: string;
}

interface Proveedor {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
}

const CargarInventarioCSV: React.FC = () => {
  const theme = useTheme();
  const [openCargaDialog, setOpenCargaDialog] = useState(false);
  const [productosCarga, setProductosCarga] = useState<ProductoCarga[]>([]);
  const [cargaExitosa, setCargaExitosa] = useState(false);
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);
  const [progresoCarga, setProgresoCarga] = useState({ actual: 0, total: 0 });
  const [cargandoPorLotes, setCargandoPorLotes] = useState(false);
  
  const [cargarInventarioMasivo, { loading: loadingCarga, error: errorCarga }] =
    useMutation(CARGAR_INVENTARIO_MASIVO);
  
  const { data: familiasData, loading: loadingFamilias } = useQuery(GET_FAMILIAS);
  const { data: proveedoresData, loading: loadingProveedores } = useQuery(GET_PROVEEDORES);

  // Función para validar y corregir familiaId
  const validarFamiliaId = (familiaId: string): string => {
    if (!familiasData?.familias) return '1'; // Valor por defecto si no hay familias cargadas
    
    const familiasDisponibles = familiasData.familias.map((f: Familia) => f.id.toString());
    
    // Si la familia existe, la devolvemos
    if (familiasDisponibles.includes(familiaId)) {
      return familiaId;
    }
    
    // Si no existe, devolvemos la primera familia disponible o '1'
    return familiasDisponibles[0] || '1';
  };

  // Función para validar y corregir proveedorId
  const validarProveedorId = (proveedorId: string): string => {
    if (!proveedoresData?.proveedores) return '1'; // Valor por defecto si no hay proveedores cargados
    
    const proveedoresDisponibles = proveedoresData.proveedores.map((p: Proveedor) => p.id.toString());
    
    // Si el proveedor existe, lo devolvemos
    if (proveedoresDisponibles.includes(proveedorId)) {
      return proveedorId;
    }
    
    // Si no existe, devolvemos el primer proveedor disponible o '1'
    return proveedoresDisponibles[0] || '1';
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoNombre(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      const productos = lines.slice(0).map((line, index) => {
        const values = line.split(',');
        
        // Detectar si hay 8 o 9 columnas
        let parsedData;
        if (values.length === 9) {
          // Formato con columna extra: nombre, extra, codigoBarras, precio, impuesto, precioVenta, existencias, familia, proveedor
          const [
            nombre,
            , // Ignorar columna extra
            codigoBarras,
            precioCostoSinImpuesto,
            impuestoPorProducto,
            precioFinalVenta,
            cantidadExistencias,
            familiaId,
            proveedorId
          ] = values;
          
          parsedData = {
            nombre: nombre?.trim() || '',
            codigoBarras: codigoBarras?.trim() || '',
            precioCostoSinImpuesto: parseFloat(precioCostoSinImpuesto) || 0,
            impuestoPorProducto: parseFloat(impuestoPorProducto) || 0,
            precioFinalVenta: parseFloat(precioFinalVenta) || 0,
            cantidadExistencias: parseInt(cantidadExistencias, 10) || 0,
            familiaId: validarFamiliaId(familiaId?.trim() || '1'),
            proveedorId: validarProveedorId(proveedorId?.trim() || '1')
          };
        } else {
          // Formato estándar: nombre, codigoBarras, precio, impuesto, precioVenta, existencias, familia, proveedor
          const [
            nombre,
            codigoBarras,
            precioCostoSinImpuesto,
            impuestoPorProducto,
            precioFinalVenta,
            cantidadExistencias,
            familiaId,
            proveedorId
          ] = values;
          
          parsedData = {
            nombre: nombre?.trim() || '',
            codigoBarras: codigoBarras?.trim() || '',
            precioCostoSinImpuesto: parseFloat(precioCostoSinImpuesto) || 0,
            impuestoPorProducto: parseFloat(impuestoPorProducto) || 0,
            precioFinalVenta: parseFloat(precioFinalVenta) || 0,
            cantidadExistencias: parseInt(cantidadExistencias, 10) || 0,
            familiaId: validarFamiliaId(familiaId?.trim() || '1'),
            proveedorId: validarProveedorId(proveedorId?.trim() || '1')
          };
        }
        
        // Validar que los precios estén dentro de rangos aceptables
        if (parsedData.precioCostoSinImpuesto > 999999) {
          console.warn(`Precio muy alto en línea ${index + 1}:`, parsedData.precioCostoSinImpuesto);
          parsedData.precioCostoSinImpuesto = 0;
        }
        
        return parsedData;
      });
      
      // Filtrar productos con datos válidos y completos
      const productosValidos = productos.filter(producto => {
        return producto.nombre && 
               producto.nombre.length > 0 && 
               !isNaN(producto.precioCostoSinImpuesto) &&
               !isNaN(producto.precioFinalVenta) &&
               producto.precioCostoSinImpuesto >= 0 &&
               producto.precioFinalVenta >= 0 &&
               producto.cantidadExistencias >= 0;
      });
      
      console.log(`Productos procesados: ${productos.length}, Productos válidos: ${productosValidos.length}`);
      
      // Mostrar estadísticas de familias y proveedores si es necesario
      if (!loadingFamilias && familiasData?.familias) {
        const familiasUsadas = new Set(productosValidos.map(p => p.familiaId));
        const familiasValidas = familiasData.familias.map((f: Familia) => f.id.toString());
        console.log(`Familias usadas: ${Array.from(familiasUsadas).join(', ')}`);
        console.log(`Familias disponibles: ${familiasValidas.join(', ')}`);
      }
      
      if (!loadingProveedores && proveedoresData?.proveedores) {
        const proveedoresUsados = new Set(productosValidos.map(p => p.proveedorId));
        const proveedoresValidos = proveedoresData.proveedores.map((p: Proveedor) => p.id.toString());
        console.log(`Proveedores usados: ${Array.from(proveedoresUsados).join(', ')}`);
        console.log(`Proveedores disponibles: ${proveedoresValidos.join(', ')}`);
      }
      
      setProductosCarga(productosValidos);
    };
    reader.readAsText(file);
  };

  const handleCargarMasivo = async () => {
    const BATCH_SIZE = 100; // Cargar de 100 productos por vez
    const batches = [];
    
    // Dividir productos en lotes
    for (let i = 0; i < productosCarga.length; i += BATCH_SIZE) {
      batches.push(productosCarga.slice(i, i + BATCH_SIZE));
    }
    
    setCargandoPorLotes(true);
    setProgresoCarga({ actual: 0, total: batches.length });
    
    try {
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        setProgresoCarga({ actual: i + 1, total: batches.length });
        
        await cargarInventarioMasivo({ 
          variables: { productos: batch } 
        });
        
        // Pequeña pausa entre lotes para no sobrecargar el servidor
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setOpenCargaDialog(false);
      setProductosCarga([]);
      setArchivoNombre(null);
      setCargaExitosa(true);
      setProgresoCarga({ actual: 0, total: 0 });
    } catch (e) {
      setCargaExitosa(false);
      console.error('Error en carga masiva:', e);
    } finally {
      setCargandoPorLotes(false);
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 1, md: 4 }, 
      maxWidth: 1100, 
      mx: 'auto',
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? '#1a0f1a' : 'transparent',
      transition: 'background-color 0.3s ease'
    }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">
            Carga masiva de inventario
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Button
            variant="outlined"
            color="secondary"
            href="/dashboard"
            size="large"
          >
            Volver al Dashboard
          </Button>
        </Grid>
      </Grid>

      {cargaExitosa && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setCargaExitosa(false)}
        >
          ✅ Inventario cargado correctamente. Todos los productos fueron procesados exitosamente.
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={600}>
          💡 Carga automática por lotes
        </Typography>
        <Typography variant="body2">
          Para archivos grandes, el sistema dividirá automáticamente los productos en lotes de 100 unidades 
          para evitar errores de servidor. Verás el progreso durante la carga.
        </Typography>
      </Alert>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={600}>
          📋 Formato de CSV detectado automáticamente
        </Typography>
        <Typography variant="body2">
          • Soporta tanto 8 como 9 columnas (se ignora columna extra si existe)
          • Orden: nombre,codigoBarras,precio,impuesto,precioVenta,existencias,familia,proveedor
          • Los productos con datos inválidos se filtran automáticamente
          • Las familias se validan automáticamente contra la base de datos
        </Typography>
      </Alert>

      {!loadingFamilias && familiasData?.familias && !loadingProveedores && proveedoresData?.proveedores && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            ✅ Datos de referencia cargados
          </Typography>
          <Typography variant="body2">
            • {familiasData.familias.length} familias disponibles
            • {proveedoresData.proveedores.length} proveedores disponibles
            • Las referencias inválidas se corregirán automáticamente
          </Typography>
        </Alert>
      )}

      <Card elevation={3} sx={{ 
        mt: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#2a1a2a' : 'background.paper',
        transition: 'background-color 0.3s ease'
      }}>
        <CardHeader
          title="Carga Masiva de Inventario"
          titleTypographyProps={{ fontWeight: 600, fontSize: 22 }}
          sx={{ pb: 0 }}
        />
        <Divider />
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenCargaDialog(true)}
              size="large"
            >
              Cargar Inventario desde CSV
            </Button>
            <Chip
              label="Formato: .csv"
              color="info"
              variant="outlined"
              sx={{ alignSelf: 'center' }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Utiliza el formato de columnas correcto para evitar errores en la carga.
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={openCargaDialog} onClose={() => setOpenCargaDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Cargar Inventario Masivo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => {
                  const contenido = `nombre,codigoBarras,precioCostoSinImpuesto,impuestoPorProducto,precioFinalVenta,cantidadExistencias,familiaId,proveedorId`;
                  const blob = new Blob([contenido], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'formato_inventario.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Descargar formato columnas
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button variant="outlined" component="label" fullWidth>
                Seleccionar archivo CSV
                <input type="file" accept=".csv" hidden onChange={handleCSVUpload} />
              </Button>
              {archivoNombre && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Archivo seleccionado: <b>{archivoNombre}</b>
                </Typography>
              )}
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          {productosCarga.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {productosCarga.length} productos listos para cargar.
            </Alert>
          )}
          {cargandoPorLotes && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Cargando lote {progresoCarga.actual} de {progresoCarga.total}...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(progresoCarga.actual / progresoCarga.total) * 100} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Progreso: {Math.round((progresoCarga.actual / progresoCarga.total) * 100)}%
              </Typography>
            </Box>
          )}
          {errorCarga && <Alert severity="error" sx={{ mb: 2 }}>{errorCarga.message}</Alert>}
          {productosCarga.length > 0 && (
            <Box sx={{ maxHeight: 300, overflow: 'auto', borderRadius: 1, border: '1px solid #eee', mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Código de Barras</TableCell>
                    <TableCell>Precio Costo</TableCell>
                    <TableCell>Impuesto</TableCell>
                    <TableCell>Precio Venta</TableCell>
                    <TableCell>Existencias</TableCell>
                    <TableCell>Familia</TableCell>
                    <TableCell>Proveedor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosCarga.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>{p.codigoBarras}</TableCell>
                      <TableCell>{p.precioCostoSinImpuesto}</TableCell>
                      <TableCell>{p.impuestoPorProducto}</TableCell>
                      <TableCell>{p.precioFinalVenta}</TableCell>
                      <TableCell>{p.cantidadExistencias}</TableCell>
                      <TableCell>{p.familiaId}</TableCell>
                      <TableCell>{p.proveedorId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenCargaDialog(false)} 
            color="inherit"
            disabled={cargandoPorLotes}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCargarMasivo}
            variant="contained"
            disabled={productosCarga.length === 0 || loadingCarga || cargandoPorLotes}
            color="primary"
            startIcon={cargandoPorLotes ? <CircularProgress size={20} /> : null}
          >
            {cargandoPorLotes 
              ? `Cargando lote ${progresoCarga.actual}/${progresoCarga.total}...` 
              : loadingCarga 
                ? 'Cargando...' 
                : 'Cargar productos'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CargarInventarioCSV;