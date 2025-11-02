import React, { useState } from 'react';
import { Copy, CheckCircle, AlertTriangle, Shield, X, Clock, ArrowRight, ExternalLink } from 'lucide-react';

const ModalDetalleTraza = ({ traza, onCerrar }) => {
  const [copiedAddress, setCopiedAddress] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getRiesgoColor = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case "alto":
        return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
      case "medio":
        return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" };
      case "bajo":
        return { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
    }
  };

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const months = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30));
    if (months > 0) return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (days > 0) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    return 'Hoy';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">Análisis Detallado</h2>
          <button
            onClick={onCerrar}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 space-y-6">
          {/* Resumen */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className={`${getRiesgoColor(traza.perfil_riesgo).bg} ${getRiesgoColor(traza.perfil_riesgo).text} px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2`}>
                <AlertTriangle size={16} />
                Riesgo {traza.perfil_riesgo || "desconocido"}
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                <CheckCircle size={16} />
                {traza.estado}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
              <div className="mb-4">
                <div className="bg-white px-4 py-2 rounded-lg border-2 border-blue-300 shadow-sm inline-block">
                  <div className="text-xs text-gray-500 mb-1">ID de Transacción</div>
                  <div className="text-sm font-bold text-gray-900 break-all">{traza.hash}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Monto Total</div>
                  <div className="text-3xl font-bold text-gray-900">{traza.monto_total} BTC</div>
                </div>
                {traza.bloque?.recompensa_total && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Recompensa</div>
                    <div className="text-2xl font-semibold text-green-600">{traza.bloque.recompensa_total} BTC</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detalles del Bloque */}
          {traza.bloque && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield size={20} />
                Detalles del Bloque
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Número</div>
                    <div className="text-sm font-semibold text-gray-900">{traza.bloque.numero_bloque ?? "No disponible"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Clock size={12} />
                      Fecha
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(traza.bloque.fecha).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{getTimeSince(traza.bloque.fecha)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-gray-500 mb-2">Hash</div>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-300">
                      <code className="text-xs text-gray-700 flex-1 overflow-x-auto break-all">
                        {traza.bloque.hash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(traza.bloque.hash, 'modal-hash')}
                        className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                      >
                        {copiedAddress === 'modal-hash' ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  {traza.bloque.volumen_total && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Volumen</div>
                      <div className="text-sm font-semibold text-gray-900">{traza.bloque.volumen_total} BTC</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Análisis de Direcciones */}
          {(traza.origen?.length > 0 || traza.destino?.length > 0) && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ArrowRight size={20} />
                Análisis de Direcciones
              </h3>
              
              <div className="space-y-4">
                {/* Direcciones de Origen */}
                {traza.origen?.map((addr, i) => (
                  <div key={`origen-${i}`} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-700 uppercase">📤 Origen</span>
                      <button
                        onClick={() => copyToClipboard(addr, `modal-origin-${i}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {copiedAddress === `modal-origin-${i}` ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    
                    <code className="text-xs text-gray-700 break-all block mb-3 font-mono bg-white p-2 rounded">
                      {addr}
                    </code>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <div className="text-gray-500 mb-1">Balance</div>
                        <div className="font-semibold text-gray-900">-</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Transacciones</div>
                        <div className="font-semibold text-gray-900">-</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Riesgo</div>
                        <div className="font-semibold text-gray-900">-</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Reportes</div>
                        <div className="font-semibold text-gray-900">-</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Direcciones de Destino */}
                {traza.destino?.map((addr, i) => (
                  <div key={`destino-${i}`} className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-red-700 uppercase">📥 Destino</span>
                      <button
                        onClick={() => copyToClipboard(addr, `modal-dest-${i}`)}
                        className="text-red-600 hover:text-red-700"
                      >
                        {copiedAddress === `modal-dest-${i}` ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    
                    <code className="text-xs text-gray-700 break-all block mb-3 font-mono bg-white p-2 rounded">
                      {addr}
                    </code>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <div className="text-gray-500 mb-1">Balance</div>
                        <div className="font-semibold text-gray-900">-</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Transacciones</div>
                        <div className="font-semibold text-gray-900">-</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Riesgo</div>
                        <div className="font-semibold text-gray-900">-</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Reportes</div>
                        <div className="font-semibold text-gray-900">-</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dominios Relacionados */}
          {traza.dominios_asociados?.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ExternalLink size={20} />
                Dominios Relacionados
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {traza.dominios_asociados.map((domain, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-400 text-white flex-shrink-0">
                        REVISAR
                      </span>
                      <span className="text-xs text-gray-700 font-medium truncate">{domain}</span>
                    </div>
                    <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patrones Sospechosos */}
          {traza.patrones_sospechosos?.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">Patrones Sospechosos</h3>
              <div className="space-y-2">
                {traza.patrones_sospechosos.map((patron, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700"><strong>{patron}:</strong> Patrón detectado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleTraza;