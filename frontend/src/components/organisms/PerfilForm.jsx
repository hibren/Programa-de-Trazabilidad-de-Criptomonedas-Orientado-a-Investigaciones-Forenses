"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react';

const API_URL = "http://localhost:8000"

const PerfilForm = ({ perfil, onSave, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchModules = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/modules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch modules');
      const data = await response.json();

      let initialModulos;
      if (perfil) {
        // Edit mode: populate with existing profile data
        setNombre(perfil.nombre);
        setDescripcion(perfil.descripcion);
        initialModulos = data.map(mod => {
          const existingModule = perfil.modulos.find(m => m.ruta === mod.ruta);
          return {
            ...mod,
            selected: !!existingModule,
            funciones: mod.funciones.map(func => ({
              ...func,
              selected: existingModule ? existingModule.funciones.some(f => f.nombre === func.nombre) : false
            }))
          };
        });
      } else {
         // Create mode: initialize with all modules deselected
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
  }, [token, perfil]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleModuleChange = (moduleIndex) => {
    const newModulos = [...modulos];
    const isSelected = !newModulos[moduleIndex].selected;
    newModulos[moduleIndex].selected = isSelected;
    // When a module is selected, select all its functions. When deselected, deselect all.
    newModulos[moduleIndex].funciones.forEach(f => f.selected = isSelected);
    setModulos(newModulos);
  };

  const handleFunctionChange = (moduleIndex, functionIndex) => {
    const newModulos = [...modulos];
    newModulos[moduleIndex].funciones[functionIndex].selected = !newModulos[moduleIndex].funciones[functionIndex].selected;

    // If at least one function is selected, ensure the parent module is also selected.
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

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Cargando...</div>;
  }

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
                <Checkbox
                  id={`module-${modIndex}`}
                  checked={modulo.selected}
                  onCheckedChange={() => handleModuleChange(modIndex)}
                />
                <label
                  htmlFor={`module-${modIndex}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {modulo.nombre} ({modulo.ruta})
                </label>
              </div>
              {modulo.selected && modulo.funciones.length > 0 && (
                <div className="pl-8 mt-2 space-y-2 border-l-2 border-gray-200 ml-2">
                  {modulo.funciones.map((func, funcIndex) => (
                    <div key={func.nombre} className="flex items-center space-x-2">
                       <Checkbox
                        id={`func-${modIndex}-${funcIndex}`}
                        checked={func.selected}
                        onCheckedChange={() => handleFunctionChange(modIndex, funcIndex)}
                      />
                      <label
                        htmlFor={`func-${modIndex}-${funcIndex}`}
                        className="text-sm font-normal"
                      >
                        {func.nombre} <span className="text-muted-foreground">({func.descripcion})</span>
                      </label>
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

export default PerfilForm;