"use client"

import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, AlertTriangle, Shield, Eye, Download, ChevronDown, ChevronUp, ExternalLink, Clock, ArrowRight, Link2, ShieldAlert, Globe2, Coins, FileWarning } from 'lucide-react';

const TrazabilidadList = () => {
  const [trazas, setTrazas] = useState([]);
  const [trazaActiva, setTrazaActiva] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/trazabilidad/trazas");
        const data = await res.json();
        setTrazas(data.trazas || []);
      } catch (error) {
        console.error("Error al cargar trazas:", error);
      }
    };
    fetchData();
  }, []);

  const toggleDetalles = (hash) => {
    setTrazaActiva(trazaActiva === hash ? null : hash);
  };

  const exportarAnalisis = (hash) => {
    alert(`📄 Exportando análisis de la transacción ${hash}...`);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const truncateAddress = (address) => {
    if (!address || address.length < 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
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

  const getRiesgoIcon = (nivel) => {
    const icons = {
      'PHISHING': '🎣',
      'FAKE_RETURNS': '💰',
      'RANSOMWARE': '🔒',
      'OTHER': '⚠️'
    };
    return icons[nivel] || '⚠️';
  };

  const getDomainBadge = (status) => {
    const badges = {
      'high-risk': 'bg-red-500 text-white',
      'suspicious': 'bg-orange-500 text-white',
      'unknown': 'bg-gray-400 text-white',
      'safe': 'bg-green-500 text-white',
      'blocked': 'bg-black text-white'
    };
    return badges[status] || badges.unknown;
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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      {/* Lista de trazas */}
      <div className="space-y-4">
        {trazas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No se encontraron trazas.</p>
          </div>
        ) : (
          trazas.map((trace, index) => (
            <div key={index}>
              {/* Card Principal Compacta */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-wrap items-start gap-2 mb-4">
                  <div className={`${getRiesgoColor(trace.perfil_riesgo).bg} ${getRiesgoColor(trace.perfil_riesgo).text} px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5`}>
                    <AlertTriangle size={14} />
                    Riesgo {trace.perfil_riesgo || "desconocido"}
                  </div>
                  <div className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    {trace.estado}
                  </div>
                </div>

                {/* Panel de montos con ID */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="bg-white px-3 py-1.5 rounded-lg border-2 border-blue-300 shadow-sm">
                      <div className="text-xs text-gray-500 mb-0.5">Hash de Transacción</div>
                      <div className="text-sm font-bold text-gray-900 break-all">{trace.hash || "Sin hash"}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-0.5">Monto Total</div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900">{trace.monto_total} BTC</div>
                    </div>
                    {trace.bloque?.recompensa_total && (
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-0.5">Recompensa</div>
                        <div className="text-xl md:text-2xl font-semibold text-green-600">{trace.bloque.recompensa_total} BTC</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Categorías de amenaza */}
                {trace.categorias_denuncia?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Shield size={16} />
                      Categorías de Amenaza
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trace.categorias_denuncia.map((category, i) => {
                        const colors = getRiesgoColor(category);
                        return (
                          <div
                            key={i}
                            className={`${colors.bg} ${colors.text} px-3 py-1.5 rounded-lg border ${colors.border} font-medium text-xs flex items-center gap-1.5`}
                          >
                            <span className="text-base">{getRiesgoIcon(category)}</span>
                            {category.replace('_', ' ')}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reportes info */}
                {trace.reportes_totales > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-4">
                    <p className="text-xs text-gray-700">
                      📋 <strong>Reportes:</strong> {trace.reportes_totales} totales ({trace.reportes_verificados} verificados, {trace.reportes_no_verificados} sin verificar)
                    </p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleDetalles(trace.hash)}
                    className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    <Eye size={16} />
                    {trazaActiva === trace.hash ? 'Ocultar Detalles' : 'Ver Detalles'}
                  </button>
                  <button
                    onClick={() => exportarAnalisis(trace.hash)}
                    className="flex items-center gap-1.5 bg-white text-gray-700 px-4 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition text-sm font-medium"
                  >
                    <Download size={16} />
                    Exportar
                  </button>
                </div>
              </div>

              {/* Detalles Expandibles - CONTENEDOR PADRE ÚNICO */}
              {trazaActiva === trace.hash && (
                <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                  {/* Mensaje si no hay detalles */}
                  {!trace.bloque && (!trace.origen || trace.origen.length === 0) && (!trace.destino || trace.destino.length === 0) && (!trace.dominios_asociados || trace.dominios_asociados.length === 0) && (!trace.patrones_sospechosos || trace.patrones_sospechosos.length === 0) ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">Sin detalles adicionales disponibles</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Detalles del Bloque */}
                      {trace.bloque && (
                        <div>
                          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield size={18} />
                            Detalles del Bloque
                          </h2>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-0.5">Número</div>
                              <div className="text-sm font-semibold text-gray-900">{trace.bloque.numero_bloque ?? "No disponible"}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                                <Clock size={12} />
                                Fecha
                              </div>
                              <div className="text-sm font-semibold text-gray-900 break-all">
                                {new Date(trace.bloque.fecha).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">{getTimeSince(trace.bloque.fecha)}</div>
                            </div>
                            <div className="md:col-span-2">
                              <div className="text-xs text-gray-500 mb-1.5">Hash</div>
                              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                                <code className="text-xs text-gray-700 flex-1 overflow-x-auto break-all">
                                  {trace.bloque.hash}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(trace.bloque.hash, `hash-${index}`)}
                                  className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                                >
                                  {copiedAddress === `hash-${index}` ? <CheckCircle size={16} /> : <Copy size={16} />}
                                </button>
                              </div>
                            </div>
                            {trace.bloque.volumen_total && (
                              <div>
                                <div className="text-xs text-gray-500 mb-0.5">Volumen</div>
                                <div className="text-sm font-semibold text-gray-900">{trace.bloque.volumen_total} BTC</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Separador */}
                      {trace.bloque && (trace.origen?.length > 0 || trace.destino?.length > 0) && (
                        <div className="border-t border-gray-200"></div>
                      )}

                      {/* Flujo de Transacción */}
                      {(trace.origen?.length > 0 || trace.destino?.length > 0) && (
                        <div>
                          <h2 className="text-base font-bold text-gray-900 mb-3">Flujo de Transacción</h2>
                          
                          <div className="flex flex-col md:flex-row items-center gap-3">
                            {/* Origen */}
                            <div className="flex-1 w-full">
                              <div className="text-xs font-semibold text-gray-700 mb-1.5">ORIGEN</div>
                              <div className="space-y-2">
                                {trace.origen?.map((addr, i) => (
                                  <div key={i} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <code className="text-xs text-gray-700 break-all">
                                        {truncateAddress(addr)}
                                      </code>
                                      <button
                                        onClick={() => copyToClipboard(addr, `origin-${index}-${i}`)}
                                        className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                                      >
                                        {copiedAddress === `origin-${index}-${i}` ? <CheckCircle size={16} /> : <Copy size={16} />}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center gap-1">
                              <ArrowRight size={24} className="text-gray-400 rotate-0 md:rotate-0" />
                              <div className="text-xs font-semibold text-gray-500">{trace.monto_total} BTC</div>
                            </div>

                            {/* Destino */}
                            <div className="flex-1 w-full">
                              <div className="text-xs font-semibold text-gray-700 mb-1.5">DESTINO</div>
                              <div className="space-y-2">
                                {trace.destino?.map((addr, i) => (
                                  <div key={i} className="bg-red-50 border-2 border-red-300 rounded-lg p-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <code className="text-xs text-gray-700 break-all">
                                        {truncateAddress(addr)}
                                      </code>
                                      <button
                                        onClick={() => copyToClipboard(addr, `dest-${index}-${i}`)}
                                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                                      >
                                        {copiedAddress === `dest-${index}-${i}` ? <CheckCircle size={16} /> : <Copy size={16} />}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Separador */}
                      {(trace.origen?.length > 0 || trace.destino?.length > 0) && trace.dominios_asociados?.length > 0 && (
                        <div className="border-t border-gray-200"></div>
                      )}

                      {/* Dominios Relacionados */}
                      {trace.dominios_asociados?.length > 0 && (
                        <div>
                          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <ExternalLink size={18} />
                            Dominios Relacionados
                          </h2>
                          
                          <div className="grid grid-cols-1 gap-2">
                            {trace.dominios_asociados.map((domain, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getDomainBadge('unknown')} flex-shrink-0`}>
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

                      {/* Separador */}
                      {trace.dominios_asociados?.length > 0 && trace.patrones_sospechosos?.length > 0 && (
                        <div className="border-t border-gray-200"></div>
                      )}

                      {/* Patrones Sospechosos */}
                      {trace.patrones_sospechosos?.length > 0 && (
                        <div>
                          <h2 className="text-base font-bold text-gray-900 mb-3">Patrones Sospechosos</h2>
                          <div className="space-y-2">
                            {trace.patrones_sospechosos.map((patron, i) => (
                              <div key={i} className="flex items-center gap-2 p-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
                                <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
                                <span className="text-xs text-gray-700"><strong>{patron}:</strong> Patrón detectado</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrazabilidadList;