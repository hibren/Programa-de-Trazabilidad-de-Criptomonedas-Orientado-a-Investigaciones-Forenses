"use client"
import { useEffect, useMemo, useState } from "react"
import StatCard from "../molecules/StatCard"
import Icon from "../atoms/Icon"
import Badge from "../atoms/Badge"

const TZ = "America/Argentina/Buenos_Aires"
const toAR = (iso) =>
  iso ? new Date(new Date(iso).toLocaleString("en-US", { timeZone: TZ })) : null

const NIVEL_A_NUM = { bajo: 1, medio: 2, alto: 3, crítico: 4, critico: 4 }

const riesgoColor = (nivel) => {
  const n = (nivel || "").toLowerCase()
  if (n === "crítico" || n === "critico") return "from-red-50 to-red-100 border-red-300"
  if (n === "alto") return "from-orange-50 to-orange-100 border-orange-300"
  if (n === "medio") return "from-yellow-50 to-yellow-100 border-yellow-300"
  return "from-green-50 to-green-100 border-green-300"
}

const pct = (nuevo, viejo) =>
  viejo > 0 && isFinite(viejo) ? (((nuevo - viejo) / viejo) * 100).toFixed(1) : null

export default function DashboardContent() {
  const [direcciones, setDirecciones] = useState([])
  const [alertas, setAlertas] = useState([])
  const [stats, setStats] = useState([])

  // 🔁 Carga de datos
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token")
        const headers = token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" }

        const [r1, r2] = await Promise.all([
          fetch("http://localhost:8000/direcciones", { headers }),
          fetch("http://localhost:8000/alertas", { headers }),
        ])

        const d1 = (await r1.json()) || []
        const d2 = (await r2.json()) || []

        setDirecciones(Array.isArray(d1) ? d1.slice(0, 4) : [])
        setAlertas(
          Array.isArray(d2)
            ? d2.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 4)
            : []
        )
      } catch (e) {
        console.error("Error cargando dashboard:", e)
      }
    }
    load()
  }, [])

  // 🧮 Cálculos dinámicos
  const calc = useMemo(() => {
    const now = new Date()
    const hace30d = new Date(now)
    hace30d.setDate(hace30d.getDate() - 30)
    const hace7d = new Date(now)
    hace7d.setDate(hace7d.getDate() - 7)
    const hace14d = new Date(now)
    hace14d.setDate(hace14d.getDate() - 14)

    const totalDirs = direcciones.length
    const totalTx = direcciones.reduce(
      (acc, d) => acc + (d.final_n_tx || d.n_tx || 0),
      0
    )

    // Direcciones con primer_tx en los últimos 30 días (nuevas)
    const nuevas30d = direcciones.filter((d) => {
      const p = d.primer_tx ? new Date(d.primer_tx) : null
      return p && p >= hace30d
    }).length

    // Direcciones activas hace más de 30 días (base anterior)
    const previas = totalDirs - nuevas30d
    const varDirs = pct(totalDirs, previas)

    // Riesgo promedio general
    const riesgoNumAll =
      totalDirs === 0
        ? null
        : direcciones.reduce(
            (acc, d) => acc + (NIVEL_A_NUM[(d.perfil_riesgo || "").toLowerCase()] || 0),
            0
          ) / totalDirs

    const riesgoTexto =
      riesgoNumAll == null
        ? "Sin datos"
        : riesgoNumAll < 1.5
        ? "Bajo"
        : riesgoNumAll < 2.5
        ? "Medio"
        : riesgoNumAll < 3.5
        ? "Alto"
        : "Crítico"

    // Riesgo semanal usando ultimo_update_riesgo
    const winActual = direcciones.filter((d) => {
      const u = d.ultimo_update_riesgo ? new Date(d.ultimo_update_riesgo) : null
      return u && u > hace7d
    })
    const winPrev = direcciones.filter((d) => {
      const u = d.ultimo_update_riesgo ? new Date(d.ultimo_update_riesgo) : null
      return u && u <= hace7d && u > hace14d
    })

    const prom = (arr) =>
      arr.length
        ? arr.reduce(
            (a, d) => a + (NIVEL_A_NUM[(d.perfil_riesgo || "").toLowerCase()] || 0),
            0
          ) / arr.length
        : null

    const riesgoAct = prom(winActual)
    const riesgoPrev = prom(winPrev)
    const varRiesgo = riesgoAct != null && riesgoPrev != null ? pct(riesgoAct, riesgoPrev) : null

    return { totalDirs, totalTx, varDirs, riesgoTexto, varRiesgo }
  }, [direcciones])

  // 🧾 Actualizar tarjetas
  useEffect(() => {
    setStats([
      {
        title: "Direcciones Vigiladas",
        value: (calc.totalDirs ?? 0).toLocaleString("es-AR"),
        subtitle:
          calc.varDirs == null
            ? "— (sin base anterior)"
            : `${Number(calc.varDirs) >= 0 ? "+" : ""}${calc.varDirs}% respecto al mes anterior`,
        icon: "directions",
        trend: { positive: Number(calc.varDirs) >= 0 },
      },
      {
        title: "Alertas Activas",
        value: (alertas.length ?? 0).toLocaleString("es-AR"),
        subtitle: "+4 alertas hoy",
        icon: "bell",
        trend: { positive: false },
      },
      {
        title: "Transacciones Analizadas",
        value: (calc.totalTx ?? 0).toLocaleString("es-AR"),
        subtitle: "+4.2% esta semana",
        icon: "transactions",
        trend: { positive: true },
      },
      {
        title: "Riesgo Promedio",
        value: calc.riesgoTexto,
        subtitle:
          calc.varRiesgo == null
            ? "— (sin datos previos)"
            : `${Number(calc.varRiesgo) >= 0 ? "↑" : "↓"} ${Math.abs(
                Number(calc.varRiesgo)
              )}% respecto a la semana anterior`,
        icon: "risk",
        trend: { positive: !(Number(calc.varRiesgo) > 0) },
      },
    ])
  }, [calc, alertas])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 📊 Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="transform hover:scale-[1.02] transition-all duration-150">
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* 📍 Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Direcciones */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="directions" size={22} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Direcciones Vigiladas</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Actividad monitoreada y perfiles de riesgo asociados
          </p>

          <div className="space-y-3">
            {direcciones.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin datos disponibles…</p>
            ) : (
              direcciones.map((d) => {
                const grad = riesgoColor(d.perfil_riesgo)
                return (
                  <div
                    key={d._id}
                    className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${grad} border shadow-sm`}
                  >
                    <div>
                      <p className="font-mono text-sm text-gray-800">{d.direccion}</p>
                      <p className="text-xs text-gray-600">
                        {(d.final_n_tx || d.n_tx || 0).toLocaleString("es-AR")} transacciones
                      </p>
                    </div>
                    <Badge
                      variant={
                        d.perfil_riesgo === "bajo"
                          ? "success"
                          : d.perfil_riesgo === "medio"
                          ? "warning"
                          : d.perfil_riesgo === "alto"
                          ? "danger"
                          : "critical"
                      }
                    >
                      {d.perfil_riesgo}
                    </Badge>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="bell" size={22} className="text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Alertas Recientes</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Últimas actividades sospechosas detectadas
          </p>

          <div className="space-y-3">
            {alertas.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin alertas recientes…</p>
            ) : (
              alertas.map((a) => {
                const grad = riesgoColor(a.nivel_riesgo)
                return (
                  <div
                    key={a._id}
                    className={`flex items-start justify-between p-4 rounded-xl bg-gradient-to-r ${grad} border shadow-sm`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">
                        {a.tipo_alerta || "Alerta"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {a.descripcion || "Actividad sospechosa detectada"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {a.fecha
                        ? toAR(a.fecha).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "–"}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
