"use client"
// app/administracion/page.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, Edit, Trash2, Loader2, UserX, UserCheck } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Reusable Confirmation Dialog ---
const ConfirmationDialog = ({ open, onOpenChange, title, description, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Sub-component for Profile Form ---
const PerfilForm = ({ perfil: existingPerfil, onSave, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchModules = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/administracion/modules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch modules');
      const data = await response.json();

      let initialModulos;
      if (existingPerfil) {
        setNombre(existingPerfil.nombre);
        setDescripcion(existingPerfil.descripcion);
        initialModulos = data.map(mod => {
          const userModule = existingPerfil.modulos.find(m => m.ruta === mod.ruta);
          return {
            ...mod,
            selected: !!userModule,
            funciones: mod.funciones.map(func => ({
              ...func,
              selected: userModule ? userModule.funciones.some(f => f.nombre === func.nombre) : false
            }))
          };
        });
      } else {
         setNombre('');
         setDescripcion('');
         initialModulos = data.map(mod => ({
           ...mod,
           selected: false,
           funciones: mod.funciones.map(func => ({ ...func, selected: false }))
         }));
      }
      setModulos(initialModulos);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast({ title: "Error", description: "No se pudieron cargar los módulos disponibles.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, existingPerfil]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleModuleChange = (moduleIndex) => {
    const newModulos = [...modulos];
    const isSelected = !newModulos[moduleIndex].selected;
    newModulos[moduleIndex].selected = isSelected;
    newModulos[moduleIndex].funciones.forEach(f => f.selected = isSelected);
    setModulos(newModulos);
  };

  const handleFunctionChange = (moduleIndex, functionIndex) => {
    const newModulos = [...modulos];
    newModulos[moduleIndex].funciones[functionIndex].selected = !newModulos[moduleIndex].funciones[functionIndex].selected;
    if (newModulos[moduleIndex].funciones.some(f => f.selected)) {
        newModulos[moduleIndex].selected = true;
    }
    setModulos(newModulos);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedModulos = modulos
      .filter(m => m.selected)
      .map(m => ({
        nombre: m.nombre,
        ruta: m.ruta,
        funciones: m.funciones.filter(f => f.selected).map(f => ({ nombre: f.nombre, descripcion: f.descripcion }))
      }));
    onSave({ nombre, descripcion, modulos: selectedModulos });
  };

  if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Cargando...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre del Perfil</Label>
        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Input id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>
      <div>
        <Label>Permisos por Módulo</Label>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          {modulos.map((modulo, modIndex) => (
            <div key={modulo.ruta} className="mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox id={`module-${modIndex}`} checked={modulo.selected} onCheckedChange={() => handleModuleChange(modIndex)} />
                <label htmlFor={`module-${modIndex}`} className="text-sm font-medium leading-none">{modulo.nombre} ({modulo.ruta})</label>
              </div>
              {modulo.selected && modulo.funciones.length > 0 && (
                <div className="pl-8 mt-2 space-y-2 border-l-2 border-gray-200 ml-2">
                  {modulo.funciones.map((func, funcIndex) => (
                    <div key={func.nombre} className="flex items-center space-x-2">
                       <Checkbox id={`func-${modIndex}-${funcIndex}`} checked={func.selected} onCheckedChange={() => handleFunctionChange(modIndex, funcIndex)} />
                      <label htmlFor={`func-${modIndex}-${funcIndex}`} className="text-sm font-normal">{func.nombre} <span className="text-muted-foreground">({func.descripcion})</span></label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
};

// --- Sub-component for Profiles Tab ---
const PerfilesContent = () => {
  const { token } = useAuth();
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deletingPerfilId, setDeletingPerfilId] = useState(null);

  const fetchPerfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/administracion/perfiles`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('No se pudieron obtener los perfiles.');
      const data = await response.json();
      setPerfiles(data.map(p => ({ ...p, _id: p._id.$oid || p._id })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchPerfiles();
  }, [token, fetchPerfiles]);

  const handleSave = async (perfilData) => {
    const url = editingPerfil ? `${API_BASE_URL}/administracion/perfiles/${editingPerfil._id}` : `${API_BASE_URL}/administracion/perfiles`;
    const method = editingPerfil ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(perfilData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el perfil');
      }
      toast({ title: "Éxito", description: `Perfil ${editingPerfil ? 'actualizado' : 'creado'} correctamente.` });
      setIsDialogOpen(false);
      setEditingPerfil(null);
      fetchPerfiles();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteClick = (perfilId) => {
    setDeletingPerfilId(perfilId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPerfilId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/administracion/perfiles/${deletingPerfilId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status !== 204) {
         const errorData = await response.json();
         throw new Error(errorData.detail || 'Error al eliminar el perfil');
      }
      toast({ title: "Éxito", description: "Perfil eliminado." });
      fetchPerfiles();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsConfirmDialogOpen(false);
      setDeletingPerfilId(null);
    }
  };

  const openCreateDialog = () => { setEditingPerfil(null); setIsDialogOpen(true); };
  const openEditDialog = (perfil) => { setEditingPerfil(perfil); setIsDialogOpen(true); };

  if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Cargando perfiles...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfiles</CardTitle>
        <CardDescription>Crear, editar y eliminar perfiles de roles de usuario.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={openCreateDialog}><PlusCircle className="mr-2 h-4 w-4" /> Crear Perfil</Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editingPerfil ? 'Editar Perfil' : 'Crear Nuevo Perfil'}</DialogTitle>
              <DialogDescription>
                {editingPerfil ? 'Modifica los detalles y permisos del perfil.' : 'Completa los detalles para crear un nuevo perfil.'}
              </DialogDescription>
            </DialogHeader>
            <PerfilForm perfil={editingPerfil} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
        <ConfirmationDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          title="¿Estás seguro?"
          description="Esta acción no se puede deshacer. Esto eliminará permanentemente el perfil."
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmDialogOpen(false)}
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perfiles.map((perfil) => (
                <TableRow key={perfil._id}>
                  <TableCell className="font-medium">{perfil.nombre}</TableCell>
                  <TableCell>{perfil.descripcion}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(perfil)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(perfil._id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Sub-component for User Form ---
const UsuarioForm = ({ usuario: existingUsuario, perfiles, onSave, onCancel }) => {
    // Inicializa el estado directamente basado en si `existingUsuario` existe.
    // Esto es más robusto que usar un useEffect para poblar el formulario.
    const getInitialFormData = () => {
        if (existingUsuario) {
            return {
                username: existingUsuario.username || '',
                password: '', // El password nunca se precarga
                perfil: existingUsuario.perfil || '', // El ID del perfil ya viene normalizado
                datos_personales: { ...existingUsuario.datos_personales, fecha_nacimiento: (existingUsuario.datos_personales?.fecha_nacimiento || '').split('T')[0] },
                contactos: existingUsuario.contactos || [{ tipo: 'Email', valor: '' }],
                domicilios: existingUsuario.domicilios || [{ tipo: 'Legal', pais: 'Argentina', provincia: '', ciudad: '', calle: '' }],
            };
        }
        // Estado inicial para un nuevo usuario
        return { username: '', password: '', perfil: '', datos_personales: { nombre: '', apellido: '', cuit: '', fecha_nacimiento: '' }, contactos: [{ tipo: 'Email', valor: '' }], domicilios: [{ tipo: 'Legal', pais: 'Argentina', provincia: '', ciudad: '', calle: '' }] };
    };

    const [formData, setFormData] = useState(getInitialFormData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePerfilChange = (value) => {
        setFormData(prev => ({ ...prev, perfil: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        // Asegurarse que la fecha no tenga la parte de la hora
        if (dataToSave.datos_personales.fecha_nacimiento) {
            dataToSave.datos_personales.fecha_nacimiento = dataToSave.datos_personales.fecha_nacimiento.split('T')[0];
        }
        if (!existingUsuario) { // Creando nuevo usuario
            if (!dataToSave.password) {
                toast({ title: "Error", description: "La contraseña es obligatoria para nuevos usuarios.", variant: "destructive" });
                return;
            }
        } else { // Editing existing user
            delete dataToSave.password; // Don't send empty password
        }
        onSave(dataToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="username">Email (Username)</Label>
                    <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                {!existingUsuario && (
                    <div>
                        <Label htmlFor="password">Contraseña</Label>
                        <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                    </div>
                )}
                <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" name="datos_personales.nombre" value={formData.datos_personales.nombre} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" name="datos_personales.apellido" value={formData.datos_personales.apellido} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="cuit">CUIT</Label>
                    <Input id="cuit" name="datos_personales.cuit" value={formData.datos_personales.cuit} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                    <Input id="fecha_nacimiento" name="datos_personales.fecha_nacimiento" type="date" value={formData.datos_personales.fecha_nacimiento} onChange={handleChange} required />
                </div>
                 <div>
                    <Label htmlFor="perfil-select">Perfil</Label>
                    <Select value={formData.perfil} onValueChange={handlePerfilChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un perfil" />
                        </SelectTrigger>
                        <SelectContent>
                            {perfiles.map((perfil) => (
                                <SelectItem key={perfil._id} value={perfil._id}>{perfil.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    );
};


// --- Sub-component for Users Tab ---
const GestionUsuariosContent = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isToggleConfirmDialogOpen, setIsToggleConfirmDialogOpen] = useState(false);
  const [togglingUser, setTogglingUser] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [usersRes, perfilesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/administracion/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/administracion/perfiles`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (!usersRes.ok) throw new Error('No se pudieron obtener los usuarios.');
      if (!perfilesRes.ok) throw new Error('No se pudieron obtener los perfiles.');
      const usersData = await usersRes.json();
      const perfilesData = await perfilesRes.json(); // Array de perfiles
      const normalizedPerfiles = perfilesData.map(p => ({ ...p, _id: p._id.$oid || p._id }));
      
      const usersWithProfileNames = usersData.map(user => {
        const userPerfilId = typeof user.perfil === 'object' && user.perfil !== null ? user.perfil.$oid : user.perfil;
        const perfil = normalizedPerfiles.find(p => p._id === userPerfilId);
        return { 
          ...user,
          _id: user._id.$oid || user._id, // Normalizar el ID del usuario también
          perfil: userPerfilId, // Usar el ID del perfil ya normalizado
          perfilNombre: perfil ? perfil.nombre : 'Sin perfil' 
        };
      });
      setUsers(usersWithProfileNames);
      setPerfiles(normalizedPerfiles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (userData) => {
    const url = editingUser ? `${API_BASE_URL}/administracion/usuarios/${editingUser._id}` : `${API_BASE_URL}/administracion/usuarios`;
    const method = editingUser ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el usuario');
      }
      toast({ title: "Éxito", description: `Usuario ${editingUser ? 'actualizado' : 'creado'} correctamente.` });
      setIsDialogOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleActiveClick = (user) => {
    setTogglingUser(user);
    setIsToggleConfirmDialogOpen(true);
  };

  const handleConfirmToggleActive = async () => {
    if (!togglingUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/administracion/usuarios/${togglingUser._id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cambiar el estado del usuario');
      }
      toast({ title: "Éxito", description: "Estado del usuario actualizado." });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsToggleConfirmDialogOpen(false);
      setTogglingUser(null);
    }
  };

  const openCreateDialog = () => { setEditingUser(null); setIsDialogOpen(true); };
  const openEditDialog = (user) => { setEditingUser(user); setIsDialogOpen(true); };

  if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Cargando...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios</CardTitle>
        <CardDescription>Crear, editar y gestionar el estado de los usuarios del sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={openCreateDialog}><PlusCircle className="mr-2 h-4 w-4" /> Crear Usuario</Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
                </DialogHeader>
                {isDialogOpen && (
                    <UsuarioForm 
                        key={editingUser ? editingUser._id : 'new-user'} 
                        usuario={editingUser} 
                        perfiles={perfiles} 
                        onSave={handleSave} 
                        onCancel={() => setIsDialogOpen(false)} />
                )}
            </DialogContent>
        </Dialog>
        <ConfirmationDialog
          open={isToggleConfirmDialogOpen}
          onOpenChange={setIsToggleConfirmDialogOpen}
          title={`¿Estás seguro de que quieres ${togglingUser?.activo ? 'desactivar' : 'activar'} a este usuario?`}
          description={`El estado del usuario '${togglingUser?.username}' se cambiará.`}
          onConfirm={handleConfirmToggleActive}
          onCancel={() => setIsToggleConfirmDialogOpen(false)}
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email (Username)</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{`${user.datos_personales.nombre} ${user.datos_personales.apellido}`}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.perfilNombre}</TableCell>
                  <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className={user.activo ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"} onClick={() => handleToggleActiveClick(user)}>
                        {user.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};


// --- Main Admin Page Component ---
export default function AdministracionPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Gestión de Perfiles y Usuarios</h2>
        
      </div>
      <Tabs defaultValue="perfiles" className="w-full">
        <TabsList>
          <TabsTrigger value="perfiles">Gestionar Perfiles</TabsTrigger>
          <TabsTrigger value="usuarios">Gestionar Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="perfiles">
          <PerfilesContent />
        </TabsContent>
        <TabsContent value="usuarios">
          <GestionUsuariosContent />
        </TabsContent>
      </Tabs>
    </main>
  )
}