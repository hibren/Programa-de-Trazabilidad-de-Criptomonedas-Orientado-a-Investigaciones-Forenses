import { getSession } from "next-auth/react"

const API_URL = "http://localhost:8000"

const api = {
  get: async (path) => {
    const session = await getSession()
    const token = session?.user?.token

    const res = await fetch(`${API_URL}/api${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error fetching ${path}`)
    }

    return res.json()
  },

  post: async (path, body) => {
    const session = await getSession()
    const token = session?.user?.token

    const res = await fetch(`${API_URL}/api${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error posting to ${path}`)
    }

    return res.json()
  },
}

export default api