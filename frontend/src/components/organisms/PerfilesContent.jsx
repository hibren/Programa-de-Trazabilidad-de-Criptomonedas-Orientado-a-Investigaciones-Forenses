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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import PerfilForm from "./PerfilForm"; // Importando el formulario dinámico
import { toast } from "@/components/ui/use-toast";

const API_URL = "http://localhost:8000"

export default function PerfilesContent() {
  const { token } = useAuth();
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState(null);

  const fetchPerfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/perfiles`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('No se pudieron obtener los perfiles. Verifique sus permisos.');
      }
      const data = await response.json();
      setPerfiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPerfiles();
    }
  }, [token, fetchPerfiles]);

  const handleSave = async (perfilData) => {
    const url = editingPerfil ? `${API_URL}/perfiles/${editingPerfil._id.$oid}` : `${API_URL}/perfiles`;
    const method = editingPerfil ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(perfilData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el perfil');
      }

      toast({ title: "Éxito", description: `Perfil ${editingPerfil ? 'actualizado' : 'creado'} correctamente.` });
      setIsDialogOpen(false);
      setEditingPerfil(null);
      fetchPerfiles(); // Recargar la lista de perfiles
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (perfilId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este perfil? Esta acción no se puede deshacer.")) return;

    try {
      const response = await fetch(`${API_URL}/perfiles/${perfilId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status !== 204) {
         const errorData = await response.json();
         throw new Error(errorData.detail || 'Error al eliminar el perfil');
      }

      toast({ title: "Éxito", description: "Perfil eliminado." });
      fetchPerfiles(); // Recargar la lista
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const openCreateDialog = () => {
    setEditingPerfil(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (perfil) => {
    setEditingPerfil(perfil);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Cargando perfiles...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Perfil
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingPerfil ? 'Editar Perfil' : 'Crear Nuevo Perfil'}</DialogTitle>
            <DialogDescription>
              {editingPerfil ? 'Modifica los detalles y permisos del perfil.' : 'Completa los detalles para crear un nuevo perfil.'}
            </DialogDescription>
          </DialogHeader>
          <PerfilForm
            perfil={editingPerfil}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

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
              <TableRow key={perfil._id.$oid}>
                <TableCell className="font-medium">{perfil.nombre}</TableCell>
                <TableCell>{perfil.descripcion}</TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" onClick={() => openEditDialog(perfil)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(perfil._id.$oid)}>
                    <Trash2 className="h-4 w-4" />
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