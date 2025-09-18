const API_URL = "http://localhost:8000/direcciones/"

export const getDirecciones = async () => {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error("Error al obtener direcciones")
  return res.json()
}

export const fetchDireccionFromAPI = async (address) => {
  const res = await fetch(`${API_URL}fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direccion: address }),
  })

  const data = await res.json() // 👈 leer solo una vez
  if (!res.ok) {
    throw new Error(data.detail || "Error importando dirección")
  }
  return data
}

