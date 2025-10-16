const API_URL = "http://localhost:8000/direcciones/"

export const getDirecciones = async (token) => {
  const res = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error("Error al obtener direcciones")
  return res.json()
}

export const fetchDireccionFromAPI = async (address, token) => {
  const res = await fetch(`${API_URL}fetch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ direccion: address }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || "Error importando dirección")
  }
  return data
}

