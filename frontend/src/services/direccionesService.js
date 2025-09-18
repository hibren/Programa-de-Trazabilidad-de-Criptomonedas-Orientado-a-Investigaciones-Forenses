const API_URL = "http://localhost:8000/direcciones/"

export const getDirecciones = async () => {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error("Error al obtener direcciones")
  return res.json()
}

export const fetchDireccionFromAPI = async (address) => {
  const res = await fetch(`${API_URL}/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direccion: address }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || "Error importando dirección")
  }
  return res.json()
}
