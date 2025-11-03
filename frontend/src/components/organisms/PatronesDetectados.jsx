"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Microscope, FileText, Search, Loader2, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import CasosDetectadosModal from "./CasosDetectadosModal"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const API_URL = "http://localhost:8000";

const PatronesDetectados = () => {
  const [expanded, setExpanded] = useState(null)
  const [patronesData, setPatronesData] = useState([])
  const [stats, setStats] = useState({ trazas: 0, patrones: 0, indicadores: 0, criticos: 0 })
  const [loading, setLoading] = useState(true)
  const [loadingPost, setLoadingPost] = useState(false)
  const [modalData, setModalData] = useState({ isOpen: false, casos: [], nombrePatron: "" })
  const { token } = useAuth()
  const { toast } = useToast()

  const processData = (analisis) => {
    const patronesMap = {
      smurfing: { id: "smurfing", nombre: "Smurfing", riesgo: "Alto", riesgoColor: "bg-yellow-500", descripcion: "Múltiples transacciones pequeñas.", analisisForense: "Consolidación de fondos desde múltiples direcciones.", indicadores: ["Repeticiones", "Fragmentación"], ejemplo: "Múltiples BTC → 1 Dirección", casos: [] },
      layering: { id: "layering", nombre: "Layering", riesgo: "Muy Alto", riesgoColor: "bg-red-600", descripcion: "Múltiples capas para ocultar origen.", analisisForense: "Cadenas extensas de transacciones.", indicadores: ["Uso de exchanges", "Cuentas en cascada"], ejemplo: "A → B → C → D", casos: [] },
      mixer: { id: "mixer", nombre: "Mixer Usage", riesgo: "Crítico", riesgoColor: "bg-red-800", descripcion: "Uso de servicios de mezcla.", analisisForense: "Utilización de mixers para romper trazabilidad.", indicadores: ["Detección de mixers", "Transacciones simultáneas"], ejemplo: "BTC In → Mixer → BTC Out", casos: [] },
    };
    analisis.forEach(a => {
      const tipo = a.cluster?.tipo_riesgo?.toLowerCase() || "";
      if (tipo.includes("smurfing")) patronesMap.smurfing.casos.push(a);
      if (tipo.includes("layering")) patronesMap.layering.casos.push(a);
      if (tipo.includes("mixer")) patronesMap.mixer.casos.push(a);
    });
    return Object.values(patronesMap);
  };

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [resPatrones, resAlertas] = await Promise.all([
        fetch(`${API_URL}/patrones/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/alertas/`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (!resPatrones.ok || !resAlertas.ok) throw new Error("Error cargando datos");

      const analisis = await resPatrones.json();
      const alertas = await resAlertas.json();

      setPatronesData(processData(analisis));
      setStats(prev => ({ ...prev, criticos: alertas.length, patrones: analisis.length }));

    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos." });
    } finally {
      setLoading(false);
    }
  };

  const detectarPatrones = async () => {
    if (!token) return;
    setLoadingPost(true);
    try {
      const res = await fetch(`${API_URL}/patrones/detectar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al ejecutar la detección");
      const data = await res.json();
      toast({
        title: "Detección Completada",
        description: `Se encontraron ${data.analisis.length} nuevos patrones.`,
      });
      loadData(); // Refresh all data
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Ocurrió un error en la detección." });
    } finally {
      setLoadingPost(false);
    }
  };

  const generarReporte = (casos, nombrePatron) => {
    const doc = new jsPDF();
    doc.text(`Reporte de Casos de ${nombrePatron}`, 14, 15);

    const tableColumn = ["ID", "Detalles del Análisis", "Riesgo", "Fecha"];
    const tableRows = casos.map(c => {
      // 1. Formatear direcciones con una viñeta (bullet point)
      const direccionesFormateadas = (c.cluster?.direccion || [])
        .map(dir => `• ${dir}`)
        .join('\n');

      const descripcionCompleta = `${c.descripcion}\n\nDirecciones involucradas:\n${direccionesFormateadas}`;

      // 2. Formatear fecha y hora en dos líneas
      const fechaHora = new Date(c.createdAt).toLocaleString('es-ES');
      const fechaFormateada = fechaHora.replace(', ', '\n');

      return [
        c._id,
        descripcionCompleta,
        c.riesgo,
        fechaFormateada,
      ];
    });

    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows,
      columnStyles: {
        1: { cellWidth: 'auto' }, // Columna "Detalles del Análisis" se ajusta al contenido
        2: { cellWidth: 25 },     // Ancho fijo para "Riesgo" para evitar que se parta
        3: { cellWidth: 35 },     // Ancho fijo para "Fecha" para que quepa en dos líneas
      }
    });
    doc.save(`reporte_${nombrePatron}.pdf`);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);
  const openModal = (casos, nombrePatron) => setModalData({ isOpen: true, casos, nombrePatron });
  const closeModal = () => setModalData({ isOpen: false, casos: [], nombrePatron: "" });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Patrones Detectados</h1>
            <Button onClick={detectarPatrones} disabled={loadingPost}>
                {loadingPost ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                Detectar Patrones
            </Button>
        </div>

        

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
            <AlertTriangle className="h-4 w-4 text-gray-500" />
            <h2 className="font-medium text-gray-700">Patrones Sospechosos Detectados</h2>
          </div>
          <p className="text-sm text-gray-500 px-5 pt-2 pb-4">Patrones comunes de lavado de dinero y ocultamiento de fondos</p>

          {loading ? (
            <div className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" /><p className="text-sm text-gray-500 mt-2">Cargando datos...</p></div>
          ) : (
            <div className="space-y-4 px-5 pb-5">
              {patronesData.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                  {/* ... Card Content ... */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2"><h3 className="font-semibold text-gray-800">{p.nombre}</h3><span className={`text-xs text-white px-2 py-0.5 rounded ${p.riesgoColor}`}>{p.riesgo}</span></div>
                      <p className="text-sm text-gray-600 mt-1">{p.descripcion}</p>
                    </div>
                    <div className="text-right"><p className="text-2xl font-semibold text-gray-800">{p.casos.length}</p><p className="text-xs text-gray-500">instancias</p></div>
                  </div>
                  <div className="mt-3">
                    <button onClick={() => toggleExpand(p.id)} className="text-green-700 text-sm font-medium flex items-center gap-1 hover:underline"><Microscope className="h-4 w-4" />{expanded === p.id ? "Ocultar Análisis" : "Ver Análisis Forense"}</button>
                    {expanded === p.id && (
                      <div className="mt-4 bg-white rounded-md border border-gray-100 p-4 space-y-3">
                        {/* ... Expanded Content ... */}
                        <div className="flex gap-2 pt-2">
                          <Button onClick={() => openModal(p.casos, p.nombre)}><Search className="h-4 w-4 mr-2" /> Ver Casos Detectados</Button>
                          <Button variant="outline" onClick={() => generarReporte(p.casos, p.nombre)}><FileText className="h-4 w-4 mr-2" /> Generar Reporte</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CasosDetectadosModal
            isOpen={modalData.isOpen}
            onClose={closeModal}
            casos={modalData.casos}
            nombrePatron={modalData.nombrePatron}
        />
    </div>
  )
}

export default PatronesDetectados