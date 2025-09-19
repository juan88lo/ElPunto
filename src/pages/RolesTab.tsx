import {
  Box, TextField, Button, Paper, IconButton, Alert, Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ROLES } from '../graphql/queries/roles';
import { CREAR_ROL, ACTUALIZAR_ROL, ELIMINAR_ROL } from '../graphql/mutations/roles';
import { useState } from 'react';

type Rol = { id:string; nombre:string; descripcion?:string };

export default function RolesTab() {
  const { data, loading, refetch } = useQuery<{roles:Rol[]}>(GET_ROLES);
  const [crear] = useMutation(CREAR_ROL);
  const [actualizar] = useMutation(ACTUALIZAR_ROL);
  const [eliminar] = useMutation(ELIMINAR_ROL);

  const [dialogo, setDialogo] = useState(false);
  const [editando, setEditando] = useState<Rol|null>(null);
  const [form, setForm]       = useState({nombre:'', descripcion:''});
  const [ok, setOk]           = useState(false);

  const guardar = async ()=>{
    const input = {...form};
    if(editando) await actualizar({ variables:{ id:editando.id, input } });
    else         await crear({ variables:{ input } });
    setDialogo(false); setOk(true); refetch();
  };

  const rows = data?.roles ?? [];
  const columns:GridColDef[] = [
    {field:'nombre', headerName:'Nombre', flex:1},
    {field:'descripcion', headerName:'Descripción', flex:1},
    {field:'actions', headerName:'', width:110, sortable:false,
     renderCell:p=>(
       <>
         <IconButton onClick={()=>{setEditando(p.row);setForm(p.row);setDialogo(true);}}><Edit/></IconButton>
         <IconButton color="error" onClick={()=>{ eliminar({variables:{id:p.id}}).then(()=>refetch()); }}><Delete/></IconButton>
       </>
     )}
  ];

  return (
    <Box>
      {ok && <Alert severity="success" onClose={()=>setOk(false)}>Cambios guardados</Alert>}
      <Button startIcon={<Add/>} sx={{mb:2}}
              onClick={()=>{ setEditando(null); setForm({nombre:'',descripcion:''}); setDialogo(true);} }>
        Nuevo Rol
      </Button>
      <DataGrid autoHeight rows={rows} columns={columns} loading={loading} />

      {/* diálogo simple */}
      {dialogo && (
        <Paper sx={{p:3, mt:2}}>
          <Grid container spacing={2} component="form"
                onSubmit={e=>{e.preventDefault();guardar();}}>
            <Grid item xs={12} sm={6}>
              <TextField label="Nombre" fullWidth required
                         value={form.nombre}
                         onChange={e=>setForm({...form,nombre:e.target.value})}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Descripción" fullWidth
                         value={form.descripcion}
                         onChange={e=>setForm({...form,descripcion:e.target.value})}/>
            </Grid>
            <Grid item xs={12} textAlign="right">
              <Button variant="contained" type="submit">Guardar</Button>
              <Button onClick={()=>setDialogo(false)} sx={{ml:1}}>Cancelar</Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
