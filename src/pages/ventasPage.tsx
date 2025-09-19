/* src/pages/FacturaCompleta.tsx */
import React, { useRef, useState } from "react";
import {
    Paper, Typography, Grid, TextField, IconButton, Button,
    Divider, Box, MenuItem, Switch
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import Autocomplete from '@mui/material/Autocomplete';
import { useQuery } from "@apollo/client";
import { GET_INVENTARIOS } from "../graphql/queries/inventario";
import { useMutation } from "@apollo/client";
import { CREAR_FACTURA_MUTATION } from "../graphql/mutations/factura";
import {
    Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import ModalAlerta from '../context/ModalAlerta';
import { useSesion } from "../context/SesionContext";
import { useCaja } from "../context/CajaContext";
import { CONFIGURACIONES } from "../graphql/queries/configuracion";
import VistaFactura from '../vistas/VistaFactura';
import { useReactToPrint } from 'react-to-print';

// Define the Factura interface if not imported
interface Factura {
    negocio: string;
    fecha: string;
    total: number;
    productos: { nombre: string; precio: number }[];
}

interface FacturaGenerada extends Factura { }   // reutiliza el que ya tienes

interface Producto {
    id: string;
    nombre: string;
    codigoBarras: string;
    precioFinalVenta: number;
    precioCostoSinImpuesto: number;
    impuestoPorProducto: number;
    cantidadExistencias: number;
    familia?: { id: string; nombre: string };
    proveedor?: { id: string; nombre: string };
}

interface Linea {
    bodega: string;
    item: string;           // código de barras
    descripcion: string;    // nombre
    unidad: string;
    cantidad: number;
    precio: number;
    descuento: number;      // %
    impuesto: number;       // %
}

interface Cliente {
    id?: string;
    nombre: string;
    direccion: string;
    telefono: string;
    correo: string;
}

const unidades = ["pz", "kg", "lt", "m", "cj"];

/* línea vacía */
const lineaVacia: Linea = {
    bodega: "",
    item: "",
    descripcion: "",
    unidad: "pz",
    cantidad: 1,
    precio: 0,
    descuento: 0,
    impuesto: 0,
};

const FacturaCompleta: React.FC = () => {
    const theme = useTheme();
    const [mostrarDialogoImprimir, setMostrarDialogoImprimir] = useState(false);
    interface FacturaGenerada extends Factura { }
    const [facturaGenerada, setFacturaGenerada] = useState<FacturaGenerada | null>(null);

    const [mensajeAlerta, setMensajeAlerta] = useState('');
    const [mostrarAlerta, setMostrarAlerta] = useState(false);

    const mostrarModal = (mensaje: string) => {
        setMensajeAlerta(mensaje);
        setMostrarAlerta(true);
    };

    /* --------verificar la caja abierta-------- */
    const { usuario } = useSesion();

    const { abrirCaja, caja } = useCaja();
    const [openSinCaja, setOpenSinCaja] = useState(false);

    /* -------- estado de la factura -------- */
    const [openTarjeta, setOpenTarjeta] = useState(false);
    const [openEfectivo, setOpenEfectivo] = useState(false);
    const [efectivoRecibido, setEfectivoRecibido] = useState<number | "">("");
    /* -------- datos de inventario desde GraphQL -------- */
    // const { data } = useQuery<{ inventarios: Producto[] }>(GET_INVENTARIOS, {
    //     variables: { search: "" }, fetchPolicy: "cache-and-network",
    // });

    const { data: cfgDataConfig, loading: cfgLoading, refetch: refetchConfig } = useQuery(CONFIGURACIONES, {
        variables: { pantalla: "FACTURACION" },   // Quitar filtro de estado para obtener todas las configuraciones
        fetchPolicy: "cache-and-network",  // Cambiar a cache-and-network para obtener actualizaciones
        notifyOnNetworkStatusChange: true,
    });

    // Refetch configuration when component mounts
    React.useEffect(() => {
        refetchConfig();
    }, [refetchConfig]);

    // Configuración de impuestos globales y agrupación de duplicados
    const configuracionVentas = React.useMemo(() => {
        if (!cfgDataConfig?.configuraciones) return { 
            impuesto: { usar: false, valor: 13 },
            agruparDuplicados: true 
        };
        
        const usarGlobal = cfgDataConfig.configuraciones.find((c: any) => 
            c.clave === 'USAR_IMPUESTO_GLOBAL' && c.pantalla === 'FACTURACION'
        );
        const valorGlobal = cfgDataConfig.configuraciones.find((c: any) => 
            c.clave === 'VALOR_IMPUESTO_GLOBAL' && c.pantalla === 'FACTURACION'
        );
        const agruparConfig = cfgDataConfig.configuraciones.find((c: any) => 
            c.clave === 'AGRUPAR_PRODUCTOS_DUPLICADOS' && c.pantalla === 'FACTURACION'
        );
        
        const config = {
            impuesto: {
                usar: usarGlobal?.estado || false,
                valor: valorGlobal?.valor !== undefined ? Number(valorGlobal.valor) : 13
            },
            agruparDuplicados: agruparConfig?.estado !== undefined ? agruparConfig.estado : true
        };
        
        return config;
    }, [cfgDataConfig]);

    // Extraer configuraciones para facilitar uso
    const impuestoGlobalConfig = configuracionVentas.impuesto;
    const agruparDuplicados = configuracionVentas.agruparDuplicados;

    // Funciones de cálculo con configuración de impuestos
    const subtotalLinea = (l: Linea) => l.cantidad * l.precio;
    const descuentoLinea = (l: Linea) => (subtotalLinea(l) * l.descuento) / 100;
    const impuestoLinea = (l: Linea) => {
        // Usar impuesto global si está activado, sino el del producto
        const tasaImpuesto = impuestoGlobalConfig.usar ? impuestoGlobalConfig.valor : l.impuesto;
       
        
        return ((subtotalLinea(l) - descuentoLinea(l)) * tasaImpuesto) / 100;
    };
    const totalLinea = (l: Linea) => 
        subtotalLinea(l) - descuentoLinea(l) + impuestoLinea(l);

    // Query 1: Productos / Inventarios
    const { data: inventarioData, loading: loadingInventario } = useQuery<{ inventarios: Producto[] }>(
        GET_INVENTARIOS,
        {
            variables: { search: "" },
            fetchPolicy: "cache-and-network",
        }
    );

    // Query 2: Configuraciones
    const { data: configuracionData, loading: loadingConfiguraciones } = useQuery(
        CONFIGURACIONES,
        {
            variables: { estado: true, pantalla: "Ventas" },
            fetchPolicy: "cache-first",
        }
    );

    const productos = inventarioData?.inventarios || [];

    // Actualizar impuestos de líneas existentes cuando cambie la configuración global
    React.useEffect(() => {
        setLineas(prevLineas => 
            prevLineas.map(linea => {
                if (!linea.item) return linea; // Skip empty lines
                
                // Buscar el producto para obtener su impuesto original
                const producto = productos.find(p => p.codigoBarras === linea.item);
                
                const impuestoAUsar = impuestoGlobalConfig.usar 
                    ? impuestoGlobalConfig.valor 
                    : (producto?.impuestoPorProducto || linea.impuesto);
                
                return {
                    ...linea,
                    impuesto: impuestoAUsar
                };
            })
        );
    }, [impuestoGlobalConfig.usar, impuestoGlobalConfig.valor, productos]);

    // Enfocar automáticamente el primer campo de código de barras al cargar la página
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const firstInput = document.querySelector(
                '[data-row="0"] input[placeholder="Código"]'
            ) as HTMLInputElement;
            
            if (firstInput) {
                firstInput.focus();
            }
        }, 500); // Delay para asegurar que los componentes estén renderizados
        
        return () => clearTimeout(timer);
    }, []);

    /* -------- estado cliente -------- */
    const [cliente, setCliente] = useState<Cliente>({
        nombre: "Cliente Nurevo", direccion: "Juan Viñas", telefono: "0", correo: "cliente@nurevo.com",
    });

    /* -------- 5 líneas iniciales -------- */
    const [lineas, setLineas] = useState<Linea[]>(
        Array.from({ length: 5 }, () => ({ ...lineaVacia }))
    );

    /* -------- Estado para manejar el foco automático -------- */
    const [currentFocusedRow, setCurrentFocusedRow] = useState<number | null>(null);

    /* -------- Estado para feedback visual -------- */
    const [lineaResaltada, setLineaResaltada] = useState<number | null>(null);
    const [mostrarIndicadorMas1, setMostrarIndicadorMas1] = useState<number | null>(null);

    /* -------- Estado para evitar llamadas duplicadas -------- */
    const [ultimoCodigoProcesado, setUltimoCodigoProcesado] = useState<{codigo: string, timestamp: number} | null>(null);

    const { descuentos, impuestos } = React.useMemo(() => {
        const cfgs = (configuracionData?.configuraciones ?? [])
            .filter((c: any) => c.estado);

        const byTipo = (pref: string) =>
            cfgs
                .filter((c: any) => c.clave.toLowerCase().startsWith(pref)) // “descuento …” ó “impuesto …”
                .sort((a: any, b: any) => b.prioridad - a.prioridad);          // 1 > 0  → aparece primero

        return {
            descuentos: byTipo("descuento"),
            impuestos: byTipo("impuesto"),
        };
    }, [configuracionData]);

    /* -------- handlers -------- */

    const ticketRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => ticketRef.current,
        documentTitle: 'Factura',
        // opcional: luego de imprimir borra el ticket de memoria
        onAfterPrint: () => setFacturaGenerada(null),
    });

    const handleCliente = (campo: keyof Cliente, valor: string) =>
        setCliente({ ...cliente, [campo]: valor });

    const handleLinea = (
        idx: number,
        campo: keyof Linea,
        valor: string | number
    ) => {
        setLineas((prev) => {
            const copia = [...prev];
            const nuevoValor =
                ["cantidad", "precio", "descuento", "impuesto"].includes(campo)
                    ? Number(valor)
                    : valor;
            copia[idx] = {
                ...copia[idx],
                [campo]: nuevoValor,
            } as Linea;
            return copia;
        });
    };

    // Función para mover al siguiente campo automáticamente
    const moveToNextRow = (currentIdx: number) => {
        // Si estamos en la última línea, agregar una nueva línea
        if (currentIdx === lineas.length - 1) {
            setLineas(prev => [...prev, { ...lineaVacia }]);
        }
        
        // Enfocar la siguiente línea después de un pequeño delay
        setTimeout(() => {
            setCurrentFocusedRow(currentIdx + 1);
            
            // Buscar el siguiente campo de código de barras y enfocarlo
            const nextRowInput = document.querySelector(
                `[data-row="${currentIdx + 1}"] input[placeholder="Código"]`
            ) as HTMLInputElement;
            
            if (nextRowInput) {
                nextRowInput.focus();
                nextRowInput.select(); // Seleccionar todo el texto para facilitar el siguiente escaneo
            }
        }, 150); // Aumentar el delay para dar tiempo a que se actualice el DOM
    };

    // Función para buscar producto por código de barras
    const buscarProductoPorCodigo = (codigo: string, idx: number) => {
        const codigoLimpio = codigo.trim();
        if (!codigoLimpio) return false;
        
        // Evitar llamadas duplicadas: si el mismo código se procesó hace menos de 500ms, ignorar
        const ahora = Date.now();
        if (ultimoCodigoProcesado && 
            ultimoCodigoProcesado.codigo === codigoLimpio && 
            (ahora - ultimoCodigoProcesado.timestamp) < 500) {
            console.log('🚫 Evitando llamada duplicada para:', codigoLimpio);
            return false;
        }
        
        // Actualizar el último código procesado
        setUltimoCodigoProcesado({ codigo: codigoLimpio, timestamp: ahora });
        
        console.log('🔍 Buscando producto:', codigoLimpio, 'en índice:', idx, 'agrupación:', agruparDuplicados);
        
        const producto = productos.find(p => p.codigoBarras === codigoLimpio);
        if (!producto) return false;

        // Si la agrupación está activada, buscar si el producto ya existe
        if (agruparDuplicados) {
            const lineaExistente = lineas.findIndex((linea, index) => 
                linea.item === codigoLimpio && index !== idx
            );

            if (lineaExistente !== -1) {
                // Producto duplicado encontrado, sumar cantidad
                setLineas(prev => {
                    const copia = [...prev];
                    copia[lineaExistente] = {
                        ...copia[lineaExistente],
                        cantidad: copia[lineaExistente].cantidad + 1
                    };
                    return copia;
                });

                // Activar feedback visual
                setLineaResaltada(lineaExistente);
                setMostrarIndicadorMas1(lineaExistente);
                setTimeout(() => {
                    setLineaResaltada(null);
                    setMostrarIndicadorMas1(null);
                }, 1000);

                // Limpiar la línea actual y mover al siguiente campo
                setLineas(prev => {
                    const copia = [...prev];
                    copia[idx] = { ...lineaVacia };
                    return copia;
                });

                moveToNextRow(idx);
                return true;
            }
        }

        // Si no es duplicado o la agrupación está desactivada, agregar normalmente
        const impuestoAUsar = impuestoGlobalConfig.usar 
            ? impuestoGlobalConfig.valor 
            : producto.impuestoPorProducto;
            
        handleLinea(idx, "item", producto.codigoBarras);
        handleLinea(idx, "descripcion", producto.nombre);
        handleLinea(idx, "precio", producto.precioFinalVenta);
        handleLinea(idx, "impuesto", impuestoAUsar);
        
        // Mover automáticamente a la siguiente línea
        moveToNextRow(idx);
        return true;
    };

    /** Redondea a colones enteros */
    const redondearColones = (valor: number) => Math.round(valor);

    /** Opcional: redondea al múltiplo de 5 ₡ más cercano */
    const redondearA5 = (valor: number) => Math.round(valor / 5) * 5;

    /* ─ helper ───────────────────────────── */
    const asegurarCajaAbierta = () => {
        if (caja) return true;
        abrirCaja();
        return false;
    };

    /** Formatea en CRC sin céntimos */
    const formatearCRC = (valor: number) =>
        valor.toLocaleString("es-CR", {
            style: "currency",
            currency: "CRC",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

    const validarFactura = () => {
        if (!cliente.nombre || !cliente.direccion) {
            mostrarModal("Por favor, completa los datos del cliente.");
            return false;
        }
        const lineasValidas = lineas.filter(
            (l) => l.item && l.cantidad > 0 && l.precio > 0
        );
        if (lineasValidas.length === 0) {
            mostrarModal("Debes agregar al menos una línea de producto válida.");
            return false;
        }

        return true;
    };



    // const agregarLinea = () => setLineas([...lineas, { ...lineaVacia }]);
    const agregarLinea = () => {
        const defaultDesc = descuentos[0]?.valor ?? 0;
        const defaultImp = impuestos[0]?.valor ?? 0;

        const nuevaLinea: Linea = {
            ...lineaVacia,
            descuento: defaultDesc,
            impuesto: defaultImp,
        };

        setLineas([...lineas, nuevaLinea]);
    };

    const eliminarLinea = (idx: number) =>
        setLineas(lineas.filter((_, i) => i !== idx));

    /* -------- totales -------- */
    const subtotal = lineas.reduce((s, l) => s + subtotalLinea(l), 0);
    const descuentoTot = lineas.reduce((s, l) => s + descuentoLinea(l), 0);
    const impuestoTot = lineas.reduce((s, l) => s + impuestoLinea(l), 0);
    const totalGeneral = subtotal - descuentoTot + impuestoTot;

    const totalSinCent = redondearColones(totalGeneral);
    const totalEfectivo = redondearA5(totalGeneral);   // ⇠ usa éste si redondeas a 5 ₡

    const onClickTarjeta = () => {
        if (!asegurarCajaAbierta()) return;
        if (validarFactura()) setOpenTarjeta(true);
    };

    const onClickEfectivo = () => {
        if (!asegurarCajaAbierta()) return;
        if (validarFactura()) {
            setEfectivoRecibido("");
            setOpenEfectivo(true);
        }
    };


    // const [crearFactura] = useMutation(CREAR_FACTURA_MUTATION, {
    //     onCompleted: () => {
    //         setOpenTarjeta(false);
    //         setOpenEfectivo(false);
    //         setLineas(Array.from({ length: 5 }, () => ({ ...lineaVacia })));
    //         mostrarModal("¡Factura registrada con éxito!");
    //     },
    //     onError: (e) => mostrarModal(e.message),
    // });
    const [crearFactura] = useMutation(CREAR_FACTURA_MUTATION, {
        onCompleted: (data) => {
            setOpenTarjeta(false);
            setOpenEfectivo(false);
            setLineas(Array.from({ length: 5 }, () => ({ ...lineaVacia })));
            mostrarModal('¡Factura registrada con éxito!');

            const f: FacturaGenerada = {
                negocio: configuracionData?.miNegocio?.nombre ?? 'El Puntoo',
                fecha: new Date().toLocaleString('es-CR'),
                total: totalSinCent,
                productos: lineas
                    .filter(l => l.item && l.cantidad > 0 && l.precio > 0)
                    .map(l => ({
                        nombre: l.descripcion,
                        precio: totalLinea(l),
                    })),
            };
            setFacturaGenerada(f);

            // Mostrar el diálogo de impresión en vez de imprimir automáticamente
            setMostrarDialogoImprimir(true);
        },
        onError: (e) => mostrarModal(e.message),
    });

    const confirmarPago = async (metodo: "TARJETA" | "EFECTIVO") => {

        if (!caja || !caja.id) {
            mostrarModal("Debes abrir una caja antes de registrar una factura.");
            if (!asegurarCajaAbierta()) return;
        }


        const productosInput = lineas
            .filter(l => l.item && l.cantidad > 0 && l.precio > 0)
            .map(l => ({
                codigoBarras: l.item,     // asumiendo que `item` es el id real
                cantidad: l.cantidad,
            }));

        await crearFactura({
            variables: {
                input: {
                    cajaId: caja?.id,
                    usuarioId: usuario.id,
                    // clienteId: cliente.id ?? null,
                    formaPago: metodo,
                    productos: productosInput,
                },
            },
        });
    };
    React.useEffect(() => {
        if (descuentos.length > 0) {
            setLineas(prev =>
                prev.map(l =>
                    l.descuento === 0
                        ? { ...l, descuento: descuentos[0].valor }
                        : l
                )
            );
        }
    }, [descuentos]);

    React.useEffect(() => {
        if (impuestos.length > 0) {
            setLineas(prev =>
                prev.map(l =>
                    l.impuesto === 0
                        ? { ...l, impuesto: impuestos[0].valor }
                        : l
                )
            );
        }
    }, [impuestos]);
    // const confirmarPago = (metodo: "TARJETA" | "EFECTIVO") => {

    //     setOpenTarjeta(false);
    //     setOpenEfectivo(false);
    //     alert("¡Factura registrada con éxito!");
    // };

    // const pagar = () => {
    //     if (!cliente.nombre || !cliente.direccion) {
    //         alert("Por favor, completa los datos del cliente.");
    //         return;
    //     }
    //     const lineasValidas = lineas.filter(l => l.item && l.cantidad > 0 && l.precio > 0);
    //     if (lineasValidas.length === 0) {
    //         alert("Debes agregar al menos una línea de producto válida.");
    //         return;
    //     }
    //     // aquí iría la llamada a tu mutación createFactura
    //     alert(Total a pagar: ₡${totalGeneral.toFixed(2)});
    // };

    // ─────────────────────────────────── render
    return (
        <Box sx={{ 
            minHeight: '100vh',
            bgcolor: theme.palette.mode === 'dark' ? '#1a0f1a' : 'transparent',
            transition: 'background-color 0.3s ease',
            p: 2
        }}>
            <Paper elevation={6} sx={{ 
                p: 4, 
                maxWidth: "100%", 
                width: "100%", 
                mx: "auto", 
                my: 5,
                bgcolor: theme.palette.mode === 'dark' ? '#2a1a2a' : 'background.paper',
                transition: 'background-color 0.3s ease'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5">Gestión de Ventas</Typography>
                    <Button
                        variant="outlined"
                        href="/dashboard"
                        sx={{
                            borderColor: theme.palette.mode === 'dark' ? '#7B4397' : '#b2dfdb',
                            backgroundColor: theme.palette.mode === 'dark' ? '#2a1a2a' : '#e0f7fa',
                            color: theme.palette.mode === 'dark' ? '#D1C4E9' : '#00695c',
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' ? '#3a2a3a' : '#b2ebf2',
                                borderColor: theme.palette.mode === 'dark' ? '#9C4DCC' : '#4dd0e1',
                                color: theme.palette.mode === 'dark' ? '#E1BEE7' : '#004d40',
                                boxShadow: 4,
                            },
                        }}
                    >
                        Volver al Dashboard
                    </Button>
                </Box>
                <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
                    Factura
                </Typography>

                {/* Datos cliente */}
                <Typography variant="h6" mb={2}>Datos del Cliente</Typography>
                <Grid container spacing={2} mb={4}>
                    {(["nombre", "direccion", "telefono", "correo"] as (keyof Cliente)[]).map((campo) => (
                        <Grid item xs={12} sm={6} md={3} key={campo}>
                            <TextField
                                label={campo.charAt(0).toUpperCase() + campo.slice(1)}
                                size="small" fullWidth
                                type={campo === "correo" ? "email" : "text"}
                                value={cliente[campo] || ""}
                                onChange={(e) => handleCliente(campo, e.target.value)}
                            />
                        </Grid>
                    ))}
                </Grid>
                <Divider sx={{ mb: 3 }} />

                {/* Cabecera grid */}
                <Grid container spacing={1} sx={{ fontWeight: 600, borderBottom: "2px solid", borderColor: "primary.main", color: "primary.main", mb: 1 }}>
                    {["Bodega", "Código Barras", "Descripción", "Cant", "Precio", "Desc.%", "Imp.%", "Total", ""].map((h, i) => (
                        <Grid key={i} item xs={[1, 2.5, 2.5, 1, 1, 1, 1, 1, 1][i]}>
                            {h}
                        </Grid>
                    ))}
                </Grid>
                {/* Líneas */}
                {lineas.map((l, idx) => (
                    <Grid container spacing={1} key={idx} alignItems="center" sx={{ 
                        mb: 1, 
                        py: 0.5, 
                        bgcolor: lineaResaltada === idx 
                            ? (theme.palette.mode === 'dark' ? '#1B5E20' : '#E8F5E8')
                            : (theme.palette.mode === 'dark' 
                                ? (idx % 2 ? "#3a2a3a" : "transparent")
                                : (idx % 2 ? "grey.50" : "transparent")), 
                        borderRadius: 1,
                        transition: 'all 0.3s ease',
                        border: lineaResaltada === idx 
                            ? `2px solid ${theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32'}`
                            : '2px solid transparent',
                        transform: lineaResaltada === idx ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: lineaResaltada === idx ? 3 : 0,
                    }}>
                        {/* Bodega */}
                        <Grid item xs={1}>
                            <TextField value={l.bodega} onChange={e => handleLinea(idx, "bodega", e.target.value)} size="small" fullWidth />
                        </Grid>

                        {/* Item (Autocomplete) */}
                        <Grid item xs={2.5}>
                            <Autocomplete
                                options={productos}
                                getOptionLabel={(p: Producto) => `${p.codigoBarras} `}
                                size="small"
                                fullWidth
                                autoHighlight
                                value={productos.find((p: Producto) => p.codigoBarras === l.item) || null}
                                onChange={(_event: React.SyntheticEvent, producto: Producto | null) => {
                                    if (producto) {
                                        buscarProductoPorCodigo(producto.codigoBarras, idx);
                                    }
                                }}
                                renderInput={(params: any) => (
                                    <TextField 
                                        {...params} 
                                        placeholder="Código" 
                                        data-row={idx}
                                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                            // Si presiona Enter y hay un valor, buscar el producto
                                            if (e.key === 'Enter') {
                                                const codigo = (e.target as HTMLInputElement).value;
                                                buscarProductoPorCodigo(codigo, idx);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            // También buscar cuando pierde el foco (útil para lectores de códigos)
                                            const codigo = e.target.value;
                                            if (codigo && !l.descripcion) {
                                                buscarProductoPorCodigo(codigo, idx);
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Descripción (solo lectura) */}
                        <Grid item xs={2.5}>
                            <TextField value={l.descripcion} size="small" fullWidth InputProps={{ readOnly: true }} />
                        </Grid>

                        {/* Unidad */}
                        {/* <Grid item xs={1}>
                            <TextField select value={l.unidad} onChange={e => handleLinea(idx, "unidad", e.target.value)} size="small" fullWidth>
                                {unidades.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                            </TextField>
                        </Grid> */}

                        {/* Cantidad */}
                        <Grid item xs={1} sx={{ position: 'relative' }}>
                            <TextField type="number" inputProps={{ min: 1 }} size="small" fullWidth
                                value={l.cantidad} onChange={e => handleLinea(idx, "cantidad", e.target.value)} />
                            
                            {/* Indicador +1 */}
                            {mostrarIndicadorMas1 === idx && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -10,
                                        right: -10,
                                        backgroundColor: theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        zIndex: 10,
                                        animation: 'pulse 1s ease-in-out',
                                        '@keyframes pulse': {
                                            '0%': { transform: 'scale(0.8)', opacity: 0 },
                                            '50%': { transform: 'scale(1.2)', opacity: 1 },
                                            '100%': { transform: 'scale(1)', opacity: 1 }
                                        }
                                    }}
                                >
                                    +1
                                </Box>
                            )}
                        </Grid>

                        {/* Precio unitario */}
                        <Grid item xs={1}>
                            <TextField type="number" inputProps={{ min: 0, step: 0.01 }} size="small" fullWidth
                                value={l.precio} onChange={e => handleLinea(idx, "precio", e.target.value)} />
                        </Grid>

                        {/*------- Descuento % --------  */}
                        <Grid item xs={1}>
                            <TextField
                                select size="small" fullWidth
                                value={l.descuento}
                                onChange={e => handleLinea(idx, "descuento", Number(e.target.value))}
                            >
                                {descuentos.map((d: any) => (
                                    <MenuItem key={d.id} value={d.valor}>
                                        {d.valor}%
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* -------- Impuesto % --------  */}
                        <Grid item xs={1}>
                            <TextField
                                type="number"
                                size="small"
                                fullWidth
                                value={l.impuesto}
                                onChange={e => handleLinea(idx, "impuesto", Number(e.target.value))}
                                disabled={impuestoGlobalConfig.usar}
                                placeholder={impuestoGlobalConfig.usar ? `Global: ${impuestoGlobalConfig.valor}%` : "Imp %"}
                                sx={{
                                    '& .MuiInputBase-input': {
                                        color: impuestoGlobalConfig.usar ? 'text.secondary' : 'text.primary'
                                    },
                                    '& .MuiInputBase-root': {
                                        backgroundColor: impuestoGlobalConfig.usar ? 'action.disabled' : 'background.paper'
                                    }
                                }}
                            />
                        </Grid>
                        {/* Total línea */}
                        < Grid item xs={1} >
                            <Typography textAlign="right" fontWeight="bold">
                                ₡{totalLinea(l).toFixed(2)}
                            </Typography>
                        </Grid>

                        {/* Eliminar */}
                        <Grid item xs={1}>
                            <IconButton color="error" size="small" aria-label="Eliminar" onClick={() => eliminarLinea(idx)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Grid>
                    </Grid >
                ))}

                {/* Agregar línea */}
                <Button variant="contained" onClick={agregarLinea} sx={{ mb: 3 }}>
                    + Agregar línea
                </Button>

                <Divider />

                {/* Totales */}
                <Box sx={{ maxWidth: 400, ml: "auto", my: 3 }}>
                    <Paper elevation={2} sx={{ 
                        p: 3, 
                        bgcolor: theme.palette.mode === 'dark' ? "#3a2a3a" : "grey.50", 
                        borderRadius: 2,
                        transition: 'background-color 0.3s ease'
                    }}>
                        <Grid container spacing={2}>
                            {[
                                ["Subtotal", subtotal],
                                ["Descuento", descuentoTot],
                                ["Impuesto", impuestoTot],
                                ["Total", totalSinCent],
                            ].map(([label, val], i) => (
                                <React.Fragment key={label as string}>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant={label === "Total" ? "h6" : "subtitle1"}
                                            color={label === "Total" ? "primary" : "textSecondary"}
                                            fontWeight={label === "Total" ? "bold" : "medium"}
                                        >
                                            {label}:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography
                                            variant={label === "Total" ? "h5" : "h6"}
                                            fontWeight="bold"
                                            textAlign="right"
                                            color={label === "Total" ? "primary.main" : "text.primary"}
                                        >
                                            ₡{(val as number).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    {i === 2 && (
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 1 }} />
                                        </Grid>
                                    )}
                                </React.Fragment>
                            ))}
                        </Grid>
                    </Paper>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={onClickTarjeta}
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? "#2a3a2a" : "#b2dfdb",
                            color: theme.palette.mode === 'dark' ? '#A5D6A7' : "#00695c",
                            boxShadow: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? "#3a4a3a" : "#4dd0e1",
                                color: theme.palette.mode === 'dark' ? '#C8E6C9' : "#004d40",
                                boxShadow: 4,
                            },
                        }}
                    >
                        Pagar con Tarjeta
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onClickEfectivo}
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? "#3a3a1a" : "#ffe082",
                            color: theme.palette.mode === 'dark' ? '#FFF176' : "#795548",
                            boxShadow: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? "#4a4a2a" : "#ffd54f",
                                color: theme.palette.mode === 'dark' ? '#FFEB3B' : "#4e342e",
                                boxShadow: 4,
                            },
                        }}
                    >
                        Pagar en Efectivo
                    </Button>
                </Box>
                {/* ---------- DIÁLOGO TARJETA ---------- */}
                <Dialog open={openTarjeta} onClose={() => setOpenTarjeta(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Confirmar pago con tarjeta</DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="h6" textAlign="center">
                            Total a pagar: <strong>₡{totalGeneral.toFixed(2)}</strong>
                        </Typography>
                        <Typography sx={{ mt: 2 }}>
                            ¿Desea procesar el cobro en la terminal?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenTarjeta(false)}>Cancelar</Button>
                        <Button variant="contained" onClick={() =>
                            confirmarPago("TARJETA")

                        }>
                            Aceptar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ---------- DIÁLOGO EFECTIVO ---------- */}
                <Dialog open={openEfectivo} onClose={() => setOpenEfectivo(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Pago en efectivo</DialogTitle>
                    <DialogContent dividers>
                        <Typography>
                            Total a pagar: <strong>₡{totalGeneral.toFixed(2)}</strong>
                        </Typography>

                        <TextField
                            label="Efectivo recibido"
                            type="number"
                            fullWidth
                            margin="dense"
                            value={efectivoRecibido}
                            onChange={(e) => setEfectivoRecibido(e.target.value === "" ? "" : Number(e.target.value))}
                            inputProps={{ min: 0, step: 0.01 }}
                        />

                        {efectivoRecibido !== "" && (
                            <Typography sx={{ mt: 1 }}>
                                Vuelto: <strong>
                                    ₡{(Number(efectivoRecibido) - totalGeneral).toFixed(2)}
                                </strong>
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEfectivo(false)}>Cancelar</Button>
                        <Button
                            variant="contained"
                            disabled={
                                efectivoRecibido === "" || Number(efectivoRecibido) < totalGeneral
                            }
                            onClick={() => confirmarPago("EFECTIVO")}
                        >
                            Pagar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper >
            <ModalAlerta
                visible={mostrarAlerta}
                mensaje={mensajeAlerta}
                onClose={() => setMostrarAlerta(false)}
            />
            <Dialog
                open={mostrarDialogoImprimir}
                onClose={() => setMostrarDialogoImprimir(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>¿Desea imprimir la factura?</DialogTitle>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setMostrarDialogoImprimir(false);
                            setFacturaGenerada(null); // Limpia el ticket si no imprime
                        }}
                    >
                        No imprimir
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setMostrarDialogoImprimir(false);
                            handlePrint();
                        }}
                    >
                        Imprimir
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FacturaCompleta;
