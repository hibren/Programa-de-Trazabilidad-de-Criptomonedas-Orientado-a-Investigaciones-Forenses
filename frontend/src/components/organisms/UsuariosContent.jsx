"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const API_URL = "http://localhost:8000"

export default function UsuariosContent() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPerfilId, setSelectedPerfilId] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [usersRes, perfilesRes] = await Promise.all([
        fetch(`${API_URL}/api/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/perfiles`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!usersRes.ok) throw new Error('No se pudieron obtener los usuarios.');
      if (!perfilesRes.ok) throw new Error('No se pudieron obtener los perfiles.');

      const usersData = await usersRes.json();
      const perfilesData = await perfilesRes.json();

      const usersWithProfileNames = usersData.map(user => {
        const perfil = perfilesData.find(p => p.id === user.perfil);
        return { ...user, perfilNombre: perfil ? perfil.nombre : 'Sin perfil' };
      });

      setUsers(usersWithProfileNames);
      setPerfiles(perfilesData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setSelectedPerfilId(user.perfil);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser || !selectedPerfilId) return;

    try {
      const response = await fetch(`${API_URL}/api/usuarios/${selectedUser.id}/asignar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ perfilId: selectedPerfilId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al asignar el perfil.');
      }

      toast({ title: "Éxito", description: "Perfil de usuario actualizado." });
      setIsDialogOpen(false);
      setSelectedUser(null);
      fetchData(); // Recargar datos
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Perfil a {selectedUser?.datos_personales.nombre}</DialogTitle>
            <DialogDescription>
              Seleccione el nuevo perfil para este usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="perfil-select" className="text-right">
                Perfil
              </Label>
              <Select value={selectedPerfilId} onValueChange={setSelectedPerfilId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un perfil" />
                </SelectTrigger>
                <SelectContent>
                  {perfiles.map((perfil) => (
                    <SelectItem key={perfil.id} value={perfil.id}>
                      {perfil.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email (Username)</TableHead>
              <TableHead>Perfil Actual</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{`${user.datos_personales.nombre} ${user.datos_personales.apellido}`}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.perfilNombre}</TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}