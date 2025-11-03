"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/DataTable/DataTable"
import { getColumnsPatronesCasos } from "@/components/DataTable/columns/getColumnsPatronesCasos"

const CasosDetectadosModal = ({ isOpen, onClose, casos, nombrePatron }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl z-[100]">
        <DialogHeader>
          <DialogTitle>Casos Detectados de {nombrePatron}</DialogTitle>
          <DialogDescription>
            Esta es la lista de todos los análisis donde se ha detectado el patrón de {nombrePatron}.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <DataTable
            columns={getColumnsPatronesCasos ? getColumnsPatronesCasos() : []}
            data={casos}
            filterColumn="descripcion"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CasosDetectadosModal;
