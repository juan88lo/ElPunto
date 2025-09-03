// src/pages/AsignarPermisoTab.tsx
import { useState, useEffect } from 'react';
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Paper,
  Button,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Typography,
  Divider,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ROLES } from '../graphql/queries/roles';
import {
  GET_PERMISOS,
  GET_PERMISOS_POR_ROL,
} from '../graphql/queries/permisos';
import {
  ASIGNAR_PERMISO,
  QUITAR_PERMISO,
} from '../graphql/mutations/permisos';

/* ---------- Tipos ---------- */
interface Rol {
  id: string;
  nombre: string;
}
interface Permiso {
  id: string;
  nombrePermiso: string;
}
interface PermisoAsignado extends Permiso {
  asignado: boolean;
}

/* ---------- util helpers ---------- */
const not = (a: string[], b: string[]) => a.filter((x) => !b.includes(x));
const intersection = (a: string[], b: string[]) =>
  a.filter((x) => b.includes(x));

/* ─────────────────────────────────────── */
const AsignarPermisoTab = () => {
  const [rolSel, setRolSel] = useState<Rol | null>(null);
  const [asignados, setAsignados] = useState<string[]>([]);
  const [orig, setOrig] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ---------- queries ---------- */
  const {
    data: rolesData,
    loading: loadingRoles,
    error: rolesErr,
  } = useQuery(GET_ROLES);

  const {
    data: permisosData,
    loading: loadingPerms,
    error: permisosErr,
  } = useQuery(GET_PERMISOS);

  const {
    data: permisosRolData,
    loading: loadingRolPerms,
    refetch: refetchRol,
  } = useQuery(GET_PERMISOS_POR_ROL, {
    variables: { tipoUsuarioId: rolSel?.id || '' },
    skip: !rolSel,
    fetchPolicy: 'network-only',          // 👈 fuerza nueva llamada
  });

  /* ---------- mutations ---------- */
  const [addPerm] = useMutation(ASIGNAR_PERMISO);
  const [rmPerm] = useMutation(QUITAR_PERMISO);

  /* ---------- efectos ---------- */

  // 1. Vaciar listas apenas cambia el rol (antes de que llegue la consulta)
  useEffect(() => {
    setAsignados([]);
    setOrig([]);
    setChecked([]);
  }, [rolSel]);

  // 2. Cargar permisos del rol cuando la consulta termina
  useEffect(() => {
    if (rolSel && permisosRolData?.permisosPorTipoUsuario) {
      const permisosAsignados: PermisoAsignado[] =
        permisosRolData.permisosPorTipoUsuario;
      const ids = permisosAsignados
        .filter((p) => p.asignado)
        .map((p) => p.id);
      setAsignados(ids);
      setOrig(ids);
      setChecked([]);
    }
  }, [rolSel, permisosRolData]);          // 👈 depende de ambos

  // 3. Ocultar mensajes después de 3,5 s
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  /* ---------- handlers ---------- */
  const toggle = (id: string) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const asignar = () => {
    const move = intersection(unassigned, checked);
    setAsignados(asignados.concat(move));
    setChecked(not(checked, move));
  };

  const revocar = () => {
    const move = intersection(asignados, checked);
    setAsignados(not(asignados, move));
    setChecked(not(checked, move));
  };

  const asignarTodos = () => {
    setAsignados(allPerms.map((p) => p.id));
    setChecked([]);
  };

  const revocarTodos = () => {
    setAsignados([]);
    setChecked([]);
  };

  const save = async () => {
    if (!rolSel) return;
    setSaving(true);
    try {
      const add = not(asignados, orig);
      const del = not(orig, asignados);

      await Promise.all([
        ...add.map((id) =>
          addPerm({
            variables: { tipoUsuarioId: rolSel.id, permisoId: id },
          }),
        ),
        ...del.map((id) =>
          rmPerm({
            variables: { tipoUsuarioId: rolSel.id, permisoId: id },
          }),
        ),
      ]);

      await refetchRol();
      setOrig(asignados);                 // referencia alineada
      setSuccess('Permisos actualizados');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- datos derivados ---------- */
  const allPerms: Permiso[] = permisosData?.permisos || [];
  const unassigned = not(
    allPerms.map((p) => p.id),
    asignados,
  );

  /* ---------- render helpers ---------- */
  const renderList = (
    items: string[],
    title: string,
    onSelectAll: () => void,
  ) => (
    <Paper sx={{ width: 260, height: 400, overflow: 'auto' }}>
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle1">{title}</Typography>
        <Button size="small" onClick={onSelectAll}>
          Seleccionar todos
        </Button>
      </Box>
      <Divider />
      <List dense>
        {items.map((id) => {
          const perm = allPerms.find((p) => p.id === id);
          if (!perm) return null;
          return (
            <ListItem
              key={id}
              button
              onClick={() => toggle(id)}
              selected={checked.includes(id)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.includes(id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText primary={perm.nombrePermiso} />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );

  /* ---------- spinners / errores ---------- */
  if (
    loadingRoles ||
    loadingPerms ||
    (rolSel && loadingRolPerms) // espera datos del rol actual
  )
    return <CircularProgress />;
  if (rolesErr) return <Alert severity="error">{rolesErr.message}</Alert>;
  if (permisosErr) return <Alert severity="error">{permisosErr.message}</Alert>;

  /* ---------- UI ---------- */
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth>
          <InputLabel>Rol</InputLabel>
          <Select
            value={rolSel?.id || ''}
            label="Rol"
            onChange={(e) =>
              setRolSel(
                rolesData.roles.find((r: Rol) => r.id === e.target.value) ||
                  null,
              )
            }
          >
            {rolesData.roles.map((r: Rol) => (
              <MenuItem key={r.id} value={r.id}>
                {r.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {rolSel && (
        <>
          <Grid item xs={12}>
            <Typography variant="h6">
              Permisos para: {rolSel.nombre}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {renderList(asignados, 'Asignados', () =>
                setChecked((prev) => [...prev, ...not(asignados, prev)]),
              )}

              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <Button
                  variant="outlined"
                  onClick={revocar}
                  disabled={!intersection(asignados, checked).length}
                >
                  &lt; Revocar
                </Button>
                <Button
                  variant="outlined"
                  onClick={asignar}
                  disabled={!intersection(unassigned, checked).length}
                >
                  Asignar &gt;
                </Button>
                <Divider />
                <Button
                  variant="contained"
                  color="error"
                  onClick={revocarTodos}
                >
                  Revocar todos
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={asignarTodos}
                >
                  Asignar todos
                </Button>
              </Box>

              {renderList(unassigned, 'Disponibles', () =>
                setChecked((prev) => [...prev, ...not(unassigned, prev)]),
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={save}
              disabled={saving}
            >
              {saving ? (
                <CircularProgress size={22} />
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </Grid>

          {success && (
            <Grid item xs={12}>
              <Alert severity="success">{success}</Alert>
            </Grid>
          )}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

export default AsignarPermisoTab;
